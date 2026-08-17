/**
 * Borrow Service
 * Business logic for book lending and return operations
 */

import BorrowRecord from '../models/BorrowRecord.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import { BORROW_STATUS, BOOK_STATUS } from '../constants/index.js';
import { calculateFine, getPaginationParams } from '../utils/helpers.js';
import { sendOverdueReminderEmail, sendFineNotificationEmail } from '../utils/emailService.js';

export const borrowService = {
  /**
   * Borrow book for user
   */
  async borrowBook(bookId, userId, issuedBy) {
    // Validate book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book || book.isDeleted) {
      throw new Error('Book not found');
    }

    if (!book.hasAvailableCopies()) {
      throw new Error('Book is not available for borrowing');
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has pending fines or overdues
    const overdueRecord = await BorrowRecord.findOne({
      user: userId,
      status: BORROW_STATUS.OVERDUE,
    });

    if (overdueRecord) {
      throw new Error('User has overdue books. Please return them before borrowing more');
    }

    // Create borrow record
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days default

    const borrowRecord = await BorrowRecord.create({
      user: userId,
      book: bookId,
      dueDate,
      borrowDate: new Date(),
      issuedBy,
      status: BORROW_STATUS.ACTIVE,
    });

    // Decrease available copies
    book.decreaseAvailableCopies();
    if (book.borrowedCopies >= book.totalCopies) {
      book.status = BOOK_STATUS.BORROWED;
    }
    await book.save();

    return borrowRecord.populate(['user', 'book']);
  },

  /**
   * Return book
   */
  async returnBook(borrowRecordId, returnCondition = 'good', remarks = '') {
    // Find borrow record
    const borrowRecord = await BorrowRecord.findById(borrowRecordId);
    if (!borrowRecord) {
      throw new Error('Borrow record not found');
    }

    if (borrowRecord.status === BORROW_STATUS.RETURNED) {
      throw new Error('Book has already been returned');
    }

    // Update borrow record
    borrowRecord.returnDate = new Date();
    borrowRecord.returnCondition = returnCondition;
    borrowRecord.remarks = remarks;
    borrowRecord.status = BORROW_STATUS.RETURNED;

    // Calculate and create fine if overdue
    const isOverdue = borrowRecord.daysUntilDue < 0;
    if (isOverdue) {
      const daysOverdue = borrowRecord.calculateDaysOverdue();
      const fineAmount = calculateFine(daysOverdue, 10);

      const fine = await Fine.create({
        borrowRecord: borrowRecordId,
        user: borrowRecord.user,
        book: borrowRecord.book,
        daysOverdue,
        totalFineAmount: fineAmount,
        remainingAmount: fineAmount,
      });

      borrowRecord.fine = fine._id;

      // Send fine notification email
      const user = await User.findById(borrowRecord.user);
      const book = await Book.findById(borrowRecord.book);
      try {
        await sendFineNotificationEmail(user.email, fineAmount, book.title);
      } catch (error) {
        console.error('Failed to send fine notification email:', error.message);
      }
    }

    await borrowRecord.save();

    // Increase available copies
    const book = await Book.findById(borrowRecord.book);
    if (returnCondition === 'damaged') {
      book.damagedCopies += 1;
    } else if (returnCondition === 'lost') {
      // Don't increase available copies for lost books
    } else {
      book.increaseAvailableCopies();
    }

    // Update book status
    if (book.availableCopies > 0) {
      book.status = BOOK_STATUS.AVAILABLE;
    }

    await book.save();

    return borrowRecord.populate(['user', 'book', 'fine']);
  },

  /**
   * Renew book borrow
   */
  async renewBorrow(borrowRecordId) {
    const borrowRecord = await BorrowRecord.findById(borrowRecordId);
    if (!borrowRecord) {
      throw new Error('Borrow record not found');
    }

    if (!borrowRecord.renewBorrow(14)) {
      throw new Error('Cannot renew: maximum renewals reached or book not in active status');
    }

    await borrowRecord.save();

    return borrowRecord.populate(['user', 'book']);
  },

  /**
   * Get user's active borrows
   */
  async getUserActiveBorrows(userId, page = 1, limit = 10) {
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const total = await BorrowRecord.countDocuments({
      user: userId,
      status: BORROW_STATUS.ACTIVE,
    });

    const borrows = await BorrowRecord.find({
      user: userId,
      status: BORROW_STATUS.ACTIVE,
    })
      .populate('book')
      .skip(skip)
      .limit(pageLimit)
      .sort({ dueDate: 1 });

    return {
      borrows,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    };
  },

  /**
   * Get user's borrowing history
   */
  async getUserBorrowHistory(userId, page = 1, limit = 10) {
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const total = await BorrowRecord.countDocuments({ user: userId });

    const history = await BorrowRecord.find({ user: userId })
      .populate('book')
      .populate('fine')
      .skip(skip)
      .limit(pageLimit)
      .sort({ borrowDate: -1 });

    return {
      history,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    };
  },

  /**
   * Get overdue borrows
   */
  async getOverdueBooks(page = 1, limit = 10) {
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const query = {
      status: BORROW_STATUS.ACTIVE,
      dueDate: { $lt: new Date() },
    };

    const total = await BorrowRecord.countDocuments(query);

    const overdueBooks = await BorrowRecord.find(query)
      .populate('user')
      .populate('book')
      .skip(skip)
      .limit(pageLimit)
      .sort({ dueDate: 1 });

    return {
      overdueBooks,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    };
  },

  /**
   * Send due date reminders
   */
  async sendDueDateReminders() {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(0, 0, 0, 0);

    const nextDayDate = new Date(tomorrowDate);
    nextDayDate.setDate(nextDayDate.getDate() + 1);

    const borrows = await BorrowRecord.find({
      status: BORROW_STATUS.ACTIVE,
      dueDate: { $gte: tomorrowDate, $lt: nextDayDate },
    })
      .populate('user')
      .populate('book');

    const userBooksMap = {};
    borrows.forEach(borrow => {
      if (!userBooksMap[borrow.user._id]) {
        userBooksMap[borrow.user._id] = {
          user: borrow.user,
          books: [],
        };
      }
      userBooksMap[borrow.user._id].books.push({
        title: borrow.book.title,
        author: borrow.book.author,
        dueDate: borrow.dueDate,
      });
    });

    for (const userId in userBooksMap) {
      const { user, books } = userBooksMap[userId];
      try {
        await sendOverdueReminderEmail(user.email, books);
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error.message);
      }
    }

    return { sent: Object.keys(userBooksMap).length };
  },

  /**
   * Send overdue alert for a specific borrow record
   */
  async sendOverdueAlert(borrowRecordId) {
    const borrowRecord = await BorrowRecord.findById(borrowRecordId)
      .populate('user')
      .populate('book');

    if (!borrowRecord) {
      throw new Error('Borrow record not found');
    }

    const user = borrowRecord.user;
    const book = borrowRecord.book;

    try {
      await sendOverdueReminderEmail(user.email, [
        {
          title: book.title,
          author: book.author,
          dueDate: borrowRecord.dueDate,
        },
      ]);
    } catch (error) {
      console.error(`Failed to send overdue alert to ${user.email}:`, error.message);
      throw error;
    }

    return { success: true };
  },

  /**
   * Get borrow statistics
   */
  async getBorrowStats() {
    const activeBorrows = await BorrowRecord.countDocuments({ status: BORROW_STATUS.ACTIVE });
    const overdueCount = await BorrowRecord.countDocuments({ status: BORROW_STATUS.OVERDUE });
    const totalBorrows = await BorrowRecord.countDocuments();

    return { activeBorrows, overdueCount, totalBorrows };
  },
};

export default borrowService;
