/**
 * Borrow Controller
 * Handles book borrowing and return operations
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import borrowService from '../services/borrowService.js';
import AuditLog from '../models/AuditLog.js';

// ============= BORROW BOOK =============
export const borrowBook = async (req, res, next) => {
  try {
    const { bookId, userId } = req.body;
    const userIdToBorrow = userId || req.user._id;

    const borrowRecord = await borrowService.borrowBook(
      bookId,
      userIdToBorrow,
      req.user._id
    );

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'BOOK_BORROWED',
      entityType: 'BorrowRecord',
      entityId: borrowRecord._id,
      description: `Book borrowed: ${borrowRecord.book.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: { borrowRecord },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= RETURN BOOK =============
export const returnBook = async (req, res, next) => {
  try {
    const { borrowRecordId, returnCondition, remarks } = req.body;

    const borrowRecord = await borrowService.returnBook(
      borrowRecordId,
      returnCondition,
      remarks
    );

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'BOOK_RETURNED',
      entityType: 'BorrowRecord',
      entityId: borrowRecord._id,
      description: `Book returned: ${borrowRecord.book.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: { borrowRecord },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= RENEW BOOK =============
export const renewBook = async (req, res, next) => {
  try {
    const { borrowRecordId } = req.body;

    const borrowRecord = await borrowService.renewBorrow(borrowRecordId);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'BOOK_RENEWED',
      entityType: 'BorrowRecord',
      entityId: borrowRecord._id,
      description: `Book renewed: ${borrowRecord.book.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Book renewed successfully',
      data: { borrowRecord },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET ACTIVE BORROWS =============
export const getActiveBorrows = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const userId = req.params.userId || req.user._id;

    const result = await borrowService.getUserActiveBorrows(userId, page, limit);

    res.json({
      success: true,
      message: 'Active borrows retrieved',
      data: { borrows: result.borrows },
      pagination: result.pagination,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET BORROW HISTORY =============
export const getBorrowHistory = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const userId = req.params.userId || req.user._id;

    const result = await borrowService.getUserBorrowHistory(userId, page, limit);

    res.json({
      success: true,
      message: 'Borrow history retrieved',
      data: { history: result.history },
      pagination: result.pagination,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET OVERDUE BOOKS =============
export const getOverdueBooks = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await borrowService.getOverdueBooks(page, limit);

    res.json({
      success: true,
      message: 'Overdue books retrieved',
      data: { overdueBooks: result.overdueBooks },
      pagination: result.pagination,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= SEND DUE REMINDERS (ADMIN/CRON) =============
export const sendDueReminders = async (req, res, next) => {
  try {
    const result = await borrowService.sendDueDateReminders();

    res.json({
      success: true,
      message: 'Due date reminders sent',
      data: result,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET BORROW STATISTICS =============
export const getBorrowStats = async (req, res, next) => {
  try {
    const stats = await borrowService.getBorrowStats();

    res.json({
      success: true,
      message: 'Borrow statistics retrieved',
      data: stats,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= SEND OVERDUE ALERT FOR A BORROW =============
export const sendOverdueAlert = async (req, res, next) => {
  try {
    const { borrowRecordId } = req.body;

    const result = await borrowService.sendOverdueAlert(borrowRecordId);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'SEND_OVERDUE_ALERT',
      entityType: 'BorrowRecord',
      entityId: borrowRecordId,
      description: `Sent overdue alert for borrow ${borrowRecordId}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Overdue alert sent',
      data: result,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

export default {
  borrowBook,
  returnBook,
  renewBook,
  getActiveBorrows,
  getBorrowHistory,
  getOverdueBooks,
  sendDueReminders,
  sendOverdueAlert,
  getBorrowStats,
};
