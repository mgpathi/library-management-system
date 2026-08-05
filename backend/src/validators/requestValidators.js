/**
 * Request Validators
 * Validation schemas for various endpoints
 */

import { body, param, query } from 'express-validator';

// ============= AUTH VALIDATORS =============

export const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .matches(/^(\+?\d{1,3}[-.\s]?)?\d{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

export const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

// ============= USER VALIDATORS =============

export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('phone')
    .optional()
    .matches(/^(\+?\d{1,3}[-.\s]?)?\d{10,}$/)
    .withMessage('Please provide a valid phone number'),
];

export const validateUserQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
];

// ============= BOOK VALIDATORS =============

export const validateAddBook = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Book title is required'),
  body('author')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Author name is required'),
  body('isbn')
    .matches(/^(?:ISBN(?:-1[03])?[ -]?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[ -]?){3})[ -0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[ -]?){4})[ -0-9]{17}$)(?:97[89][ -]?)?[0-9]{1,5}[ -]?[0-9]+[ -]?[0-9]+[ -]?[0-9X]/)
    .withMessage('Please provide a valid ISBN'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('publisher')
    .trim()
    .notEmpty()
    .withMessage('Publisher is required'),
  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Please provide a valid year'),
  body('totalCopies')
    .isInt({ min: 1 })
    .withMessage('Total copies must be at least 1'),
  body('replacementCost')
    .isFloat({ min: 0 })
    .withMessage('Replacement cost must be a positive number'),
];

export const validateBookQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim(),
  query('category')
    .optional()
    .trim(),
  query('author')
    .optional()
    .trim(),
];

// ============= BORROW VALIDATORS =============

export const validateBorrowBook = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required'),
  body('userId')
    .optional(), // Librarian can specify user
];

export const validateReturnBook = [
  body('borrowRecordId')
    .notEmpty()
    .withMessage('Borrow record ID is required'),
  body('returnCondition')
    .isIn(['good', 'damaged', 'lost'])
    .withMessage('Invalid return condition'),
];

export const validateRenewBorrow = [
  body('borrowRecordId')
    .notEmpty()
    .withMessage('Borrow record ID is required'),
];

export const validatePayFine = [
  body('fineId')
    .notEmpty()
    .withMessage('Fine ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'online'])
    .withMessage('Invalid payment method'),
];

// ============= CATEGORY VALIDATORS =============

export const validateAddCategory = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Category name must be at least 2 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

export default {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateUserQuery,
  validateAddBook,
  validateBookQuery,
  validateBorrowBook,
  validateReturnBook,
  validateRenewBorrow,
  validatePayFine,
  validateAddCategory,
};
