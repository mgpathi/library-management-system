/**
 * User Routes
 */

import express from 'express';
import userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validateRequest.js';
import { validateUpdateProfile, validateUserQuery } from '../validators/requestValidators.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, validateUpdateProfile, handleValidationErrors, userController.updateProfile);
router.get('/borrow-stats', protect, userController.getBorrowStats);
router.get('/borrow-stats/:id', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), userController.getBorrowStats);

// Admin routes
router.get('/', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validateUserQuery, userController.getAllUsers);
router.get('/search', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), userController.searchUsers);
router.get('/:id', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), userController.getUserById);
router.put('/:id/status', protect, authorize(ROLES.ADMIN), userController.updateUserStatus);
router.put('/:id/suspend', protect, authorize(ROLES.ADMIN), userController.suspendUser);
router.put('/:id/activate', protect, authorize(ROLES.ADMIN), userController.activateUser);
router.delete('/:id', protect, authorize(ROLES.ADMIN), userController.deleteUser);

export default router;
