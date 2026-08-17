/**
 * Borrow Routes
 */

import express from 'express';
import borrowController from '../controllers/borrowController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validateRequest.js';
import {
  validateBorrowBook,
  validateReturnBook,
  validateRenewBorrow,
} from '../validators/requestValidators.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// User routes
router.get('/my-books', protect, borrowController.getActiveBorrows);
router.get('/my-history', protect, borrowController.getBorrowHistory);

// Borrow operations - Librarian/Admin
router.post('/borrow', protect, authorize(ROLES.LIBRARIAN, ROLES.ADMIN), validateBorrowBook, handleValidationErrors, borrowController.borrowBook);
router.post('/return', protect, authorize(ROLES.LIBRARIAN, ROLES.ADMIN), validateReturnBook, handleValidationErrors, borrowController.returnBook);
router.post('/renew', protect, validateRenewBorrow, handleValidationErrors, borrowController.renewBook);

// Admin routes
router.get('/overdue', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), borrowController.getOverdueBooks);
router.post('/send-reminders', protect, authorize(ROLES.ADMIN), borrowController.sendDueReminders);
// Send overdue alert for a specific borrow (Librarian/Admin)
router.post('/alert', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), borrowController.sendOverdueAlert);
router.get('/stats', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), borrowController.getBorrowStats);
router.get('/:userId/active', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), borrowController.getActiveBorrows);
router.get('/:userId/history', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), borrowController.getBorrowHistory);

export default router;
