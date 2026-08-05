/**
 * Fine Routes
 */

import express from 'express';
import fineController from '../controllers/fineController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validateRequest.js';
import { validatePayFine } from '../validators/requestValidators.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// User routes
router.get('/my-fines', protect, fineController.getUserFines);
router.get('/:id', protect, fineController.getFineById);

// Fine payment
router.post('/:id/pay', protect, validatePayFine, handleValidationErrors, fineController.payFine);

// Admin routes
router.get('/', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), fineController.getAllFines);
router.post('/:id/waive', protect, authorize(ROLES.ADMIN), fineController.waiveFine);
router.get('/stats', protect, authorize(ROLES.ADMIN), fineController.getFineStats);
router.get('/:userId/user-fines', protect, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), fineController.getUserFines);

export default router;
