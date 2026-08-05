/**
 * Utility functions for common operations
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique ID
 * @returns {String}
 */
export const generateId = () => uuidv4();

/**
 * Generate membership ID
 * @returns {String}
 */
export const generateMembershipId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `LIB${year}${random}`;
};

/**
 * Generate barcode
 * @returns {String}
 */
export const generateBarcode = () => {
  return `BC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

/**
 * Generate QR code data
 * @param {String} bookId - Book ID
 * @returns {String}
 */
export const generateQRCode = (bookId) => {
  return `QRCODE_${bookId}_${Date.now()}`;
};

/**
 * Calculate pagination parameters
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Skip and limit values
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

/**
 * Format error response
 * @param {String} message - Error message
 * @param {Array} details - Error details
 * @returns {Object}
 */
export const formatErrorResponse = (message, details = []) => {
  return {
    success: false,
    message,
    ...(details.length > 0 && { details }),
  };
};

/**
 * Format success response
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @param {Object} pagination - Pagination info
 * @returns {Object}
 */
export const formatSuccessResponse = (message, data = null, pagination = null) => {
  return {
    success: true,
    message,
    ...(data && { data }),
    ...(pagination && { pagination }),
  };
};

/**
 * Hash string using SHA256
 * @param {String} string - String to hash
 * @returns {String}
 */
export const hashString = (string) => {
  return crypto.createHash('sha256').update(string).digest('hex');
};

/**
 * Calculate fine amount
 * @param {Number} daysOverdue - Days overdue
 * @param {Number} dailyFineAmount - Daily fine amount
 * @returns {Number}
 */
export const calculateFine = (daysOverdue, dailyFineAmount = 10) => {
  return Math.max(0, daysOverdue * dailyFineAmount);
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {String}
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Number}
 */
export const daysBetween = (startDate, endDate) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate - startDate) / millisecondsPerDay);
};

export default {
  generateId,
  generateMembershipId,
  generateBarcode,
  generateQRCode,
  getPaginationParams,
  formatErrorResponse,
  formatSuccessResponse,
  hashString,
  calculateFine,
  formatDate,
  daysBetween,
};
