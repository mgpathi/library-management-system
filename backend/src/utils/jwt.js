/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_JWT_SECRET = 'dev_jwt_secret_change_me';

const getJwtSecret = () => process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

/**
 * Generate JWT token
 * @param {String} userId - User ID
 * @returns {String} - JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate Refresh Token
 * @param {String} userId - User ID
 * @returns {String} - Refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

/**
 * Verify token
 * @param {String} token - JWT token
 * @returns {Object} - Decoded token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

/**
 * Decode token without verification
 * @param {String} token - JWT token
 * @returns {Object} - Decoded token
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
