/**
 * Book Controller
 * Handles book-related HTTP requests
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import bookService from '../services/bookService.js';
import AuditLog from '../models/AuditLog.js';

// ============= CREATE BOOK =============
export const createBook = async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body, req.user._id);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'BOOK_ADDED',
      entityType: 'Book',
      entityId: book._id,
      description: `Added book: ${book.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: { book },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET ALL BOOKS =============
export const getAllBooks = async (req, res, next) => {
  try {
    const { page, limit, category, author, status, search } = req.query;

    const result = await bookService.getAllBooks(page, limit, {
      category,
      author,
      status,
      search,
    });

    res.json({
      success: true,
      message: 'Books retrieved',
      data: { books: result.books },
      pagination: result.pagination,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET BOOK BY ID =============
export const getBookById = async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);

    res.json({
      success: true,
      message: 'Book retrieved',
      data: { book },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 404));
  }
};

// ============= UPDATE BOOK =============
export const updateBook = async (req, res, next) => {
  try {
    const allowedFields = [
      'title', 'author', 'category', 'publisher', 'publishedYear',
      'language', 'totalCopies', 'replacementCost', 'description',
      'pages', 'weight', 'status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const book = await bookService.updateBook(req.params.id, updates);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'BOOK_UPDATED',
      entityType: 'Book',
      entityId: book._id,
      changes: { after: updates },
      description: `Updated book: ${book.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= DELETE BOOK =============
export const deleteBook = async (req, res, next) => {
  try {
    const book = await bookService.deleteBook(req.params.id);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'BOOK_DELETED',
      entityType: 'Book',
      entityId: book._id,
      description: `Deleted book: ${book.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= SEARCH BOOKS =============
export const searchBooks = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return next(new ErrorResponse('Search term must be at least 2 characters', 400));
    }

    const books = await bookService.searchBooks(q, limit);

    res.json({
      success: true,
      message: 'Books found',
      data: { books },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET BOOKS BY CATEGORY =============
export const getBooksByCategory = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await bookService.getBooksByCategory(req.params.categoryId, page, limit);

    res.json({
      success: true,
      message: 'Books retrieved',
      data: { books: result.books },
      pagination: result.pagination,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET TOP BORROWED BOOKS =============
export const getTopBorrowedBooks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const books = await bookService.getTopBorrowedBooks(limit);

    res.json({
      success: true,
      message: 'Top borrowed books retrieved',
      data: { books },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET BOOK STATISTICS =============
export const getBookStats = async (req, res, next) => {
  try {
    const stats = await bookService.getBookStats();

    res.json({
      success: true,
      message: 'Book statistics retrieved',
      data: stats,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

export default {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  getBooksByCategory,
  getTopBorrowedBooks,
  getBookStats,
};
