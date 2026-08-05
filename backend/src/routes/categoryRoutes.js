/**
 * Category Routes
 */

import express from 'express';
import categoryController from '../controllers/categoryController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validateRequest.js';
import { validateAddCategory } from '../validators/requestValidators.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, categoryController.getAllCategories);
router.get('/:id', optionalAuth, categoryController.getCategoryById);

// Protected routes - Admin only
router.post('/', protect, authorize(ROLES.ADMIN), validateAddCategory, handleValidationErrors, categoryController.createCategory);
router.put('/:id', protect, authorize(ROLES.ADMIN), validateAddCategory, handleValidationErrors, categoryController.updateCategory);
router.delete('/:id', protect, authorize(ROLES.ADMIN), categoryController.deleteCategory);

export default router;
