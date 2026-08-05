/**
 * Dashboard Controller
 * Provides dashboard statistics and summaries
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import BorrowRecord from '../models/BorrowRecord.js';
import Fine from '../models/Fine.js';
import { BORROW_STATUS, ROLES } from '../constants/index.js';

// ============= GET DASHBOARD STATISTICS =============
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalBooks = await Book.countDocuments({ isDeleted: false });
    const availableBooks = await Book.countDocuments({
      availableCopies: { $gt: 0 },
      isDeleted: false,
    });
    const borrowedBooks = await BorrowRecord.countDocuments({
      status: BORROW_STATUS.ACTIVE,
    });
    const overdueBooks = await BorrowRecord.countDocuments({
      status: BORROW_STATUS.OVERDUE,
    });

    // Get unpaid fines amount
    const unpaidFinesAgg = await Fine.aggregate([
      { $match: { status: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } },
    ]);

    const unpaidFinesAmount = unpaidFinesAgg[0]?.total || 0;

    // Get active users
    const activeUsers = await User.countDocuments({ status: 'active' });

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved',
      data: {
        totalUsers,
        activeUsers,
        totalBooks,
        availableBooks,
        borrowedBooks,
        overdueBooks,
        unpaidFinesAmount,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET RECENT TRANSACTIONS =============
export const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const transactions = await BorrowRecord.find()
      .populate('user', 'firstName lastName email')
      .populate('book', 'title isbn')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('borrowDate returnDate status dueDate user book');

    res.json({
      success: true,
      message: 'Recent transactions retrieved',
      data: { transactions },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET POPULAR BOOKS =============
export const getPopularBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const popularBooks = await BorrowRecord.aggregate([
      { $match: { status: { $in: [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED] } } },
      { $group: { _id: '$book', borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      { $unwind: '$bookDetails' },
      {
        $project: {
          _id: '$bookDetails._id',
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          isbn: '$bookDetails.isbn',
          borrowCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      message: 'Popular books retrieved',
      data: { books: popularBooks },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET USER STATISTICS =============
export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const roleStats = await User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      message: 'User statistics retrieved',
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        roleStats,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET BORROW STATISTICS =============
export const getBorrowStats = async (req, res, next) => {
  try {
    const activeBorrows = await BorrowRecord.countDocuments({
      status: BORROW_STATUS.ACTIVE,
    });
    const overdueCount = await BorrowRecord.countDocuments({
      status: BORROW_STATUS.OVERDUE,
    });
    const returnedCount = await BorrowRecord.countDocuments({
      status: BORROW_STATUS.RETURNED,
    });
    const totalBorrows = await BorrowRecord.countDocuments();

    res.json({
      success: true,
      message: 'Borrow statistics retrieved',
      data: {
        activeBorrows,
        overdueCount,
        returnedCount,
        totalBorrows,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET FINE STATISTICS =============
export const getFineStats = async (req, res, next) => {
  try {
    const totalFines = await Fine.countDocuments();
    const unpaidFines = await Fine.countDocuments({ status: 'unpaid' });
    const paidFines = await Fine.countDocuments({ status: 'paid' });

    const unpaidAmount = await Fine.aggregate([
      { $match: { status: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } },
    ]);

    const paidAmount = await Fine.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]);

    res.json({
      success: true,
      message: 'Fine statistics retrieved',
      data: {
        totalFines,
        unpaidFines,
        paidFines,
        totalUnpaidAmount: unpaidAmount[0]?.total || 0,
        totalPaidAmount: paidAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

export default {
  getDashboardStats,
  getRecentTransactions,
  getPopularBooks,
  getUserStats,
  getBorrowStats,
  getFineStats,
};
