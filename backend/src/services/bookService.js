/**
 * Book Service
 * Business logic for book management
 */

import Book from '../models/Book.js';
import Category from '../models/Category.js';
import { getPaginationParams, generateBarcode, generateQRCode } from '../utils/helpers.js';
import { BOOK_STATUS } from '../constants/index.js';

export const bookService = {
  /**
   * Create new book
   */
  async createBook(data, userId) {
    const {
      title, author, isbn, category, publisher, publishedYear,
      language, totalCopies, replacementCost, description, pages, weight
    } = data;

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      throw new Error('Category not found');
    }

    // Create book
    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      publisher,
      publishedYear,
      language,
      totalCopies,
      availableCopies: totalCopies,
      replacementCost,
      description,
      pages,
      weight,
      barcode: generateBarcode(),
      qrCode: generateQRCode(null), // Will be updated with actual ID
      createdBy: userId,
      status: BOOK_STATUS.AVAILABLE,
    });

    // Update QR code with actual book ID
    book.qrCode = generateQRCode(book._id);
    await book.save();

    // Update category book count
    await Category.findByIdAndUpdate(category, { $inc: { bookCount: 1 } });

    return book.populate('category');
  },

  /**
   * Get book by ID
   */
  async getBookById(bookId) {
    const book = await Book.findById(bookId).populate('category');
    if (!book || book.isDeleted) {
      throw new Error('Book not found');
    }
    return book;
  },

  /**
   * Update book
   */
  async updateBook(bookId, updates) {
    const book = await Book.findByIdAndUpdate(
      bookId,
      updates,
      { new: true, runValidators: true }
    ).populate('category');

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  },

  /**
   * Get all books with pagination and filters
   */
  async getAllBooks(page = 1, limit = 10, filters = {}) {
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const query = { isDeleted: false };

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.author) {
      query.author = { $regex: filters.author, $options: 'i' };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { author: { $regex: filters.search, $options: 'i' } },
        { isbn: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('category')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    return {
      books,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    };
  },

  /**
   * Search books
   */
  async searchBooks(searchTerm, limit = 10) {
    const books = await Book.find(
      { $text: { $search: searchTerm }, isDeleted: false },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('category');

    return books;
  },

  /**
   * Get available books count
   */
  async getAvailableBooksCount() {
    const count = await Book.countDocuments({
      availableCopies: { $gt: 0 },
      isDeleted: false,
    });
    return count;
  },

  /**
   * Get books by category
   */
  async getBooksByCategory(categoryId, page = 1, limit = 10) {
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const total = await Book.countDocuments({
      category: categoryId,
      isDeleted: false,
    });

    const books = await Book.find({
      category: categoryId,
      isDeleted: false,
    })
      .skip(skip)
      .limit(pageLimit)
      .populate('category')
      .sort({ createdAt: -1 });

    return {
      books,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    };
  },

  /**
   * Delete book (soft delete)
   */
  async deleteBook(bookId) {
    const book = await Book.findByIdAndUpdate(
      bookId,
      { isDeleted: true, status: BOOK_STATUS.LOST },
      { new: true }
    );

    if (!book) {
      throw new Error('Book not found');
    }

    // Update category book count
    if (book.category) {
      await Category.findByIdAndUpdate(book.category, { $inc: { bookCount: -1 } });
    }

    return book;
  },

  /**
   * Get top borrowed books
   */
  async getTopBorrowedBooks(limit = 10) {
    const BorrowRecord = require('../models/BorrowRecord.js').default;

    const topBooks = await BorrowRecord.aggregate([
      { $match: { status: { $in: ['active', 'returned', 'overdue'] } } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
    ]);

    return topBooks;
  },

  /**
   * Get book statistics
   */
  async getBookStats() {
    const total = await Book.countDocuments({ isDeleted: false });
    const available = await Book.countDocuments({
      availableCopies: { $gt: 0 },
      isDeleted: false,
    });
    const borrowed = await Book.countDocuments({
      borrowedCopies: { $gt: 0 },
      isDeleted: false,
    });
    const damaged = await Book.countDocuments({
      damagedCopies: { $gt: 0 },
      isDeleted: false,
    });

    return { total, available, borrowed, damaged };
  },
};

export default bookService;
