/**
 * Book Routes
 */

import express from 'express';
import bookController from '../controllers/bookController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validateRequest.js';
import { validateAddBook, validateBookQuery } from '../validators/requestValidators.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Public routes (with optional auth)
router.get('/', optionalAuth, validateBookQuery, handleValidationErrors, bookController.getAllBooks);
router.get('/search', optionalAuth, bookController.searchBooks);
router.get('/category/:categoryId', optionalAuth, bookController.getBooksByCategory);
router.get('/popular', optionalAuth, bookController.getTopBorrowedBooks);
router.get('/stats', optionalAuth, bookController.getBookStats);
router.get('/:id', optionalAuth, bookController.getBookById);

// Protected routes - Librarian/Admin only
router.post('/', protect, authorize(ROLES.LIBRARIAN, ROLES.ADMIN), validateAddBook, handleValidationErrors, bookController.createBook);
router.put('/:id', protect, authorize(ROLES.LIBRARIAN, ROLES.ADMIN), validateAddBook, handleValidationErrors, bookController.updateBook);
router.delete('/:id', protect, authorize(ROLES.LIBRARIAN, ROLES.ADMIN), bookController.deleteBook);

export default router;
