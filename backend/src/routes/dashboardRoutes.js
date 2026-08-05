/**
 * Dashboard Routes
 */

import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Admin dashboard routes
router.get('/stats', protect, authorize(ROLES.ADMIN), dashboardController.getDashboardStats);
router.get('/transactions', protect, authorize(ROLES.ADMIN), dashboardController.getRecentTransactions);
router.get('/books/popular', protect, authorize(ROLES.ADMIN), dashboardController.getPopularBooks);
router.get('/users/stats', protect, authorize(ROLES.ADMIN), dashboardController.getUserStats);
router.get('/borrow/stats', protect, authorize(ROLES.ADMIN), dashboardController.getBorrowStats);
router.get('/fines/stats', protect, authorize(ROLES.ADMIN), dashboardController.getFineStats);

export default router;
