/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import authService from '../services/authService.js';
import AuditLog from '../models/AuditLog.js';

// ============= REGISTER =============
export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    // Log audit
    await AuditLog.createLog({
      userId: result.user._id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: result.user._id,
      description: 'New user registered',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= LOGIN =============
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Log audit
    await AuditLog.createLog({
      userId: result.user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: result.user._id,
      description: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 401));
  }
};

// ============= FORGOT PASSWORD =============
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const resetToken = await authService.forgotPassword(email);

    // In production, send this via email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: 'Password reset link sent to email',
      data: {
        resetUrl, // Only for development
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= RESET PASSWORD =============
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password } = req.body;

    const result = await authService.resetPassword(resetToken, password);

    // Log audit
    await AuditLog.createLog({
      userId: result.user._id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: result.user._id,
      description: 'User reset password',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= CHANGE PASSWORD =============
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user._id, currentPassword, newPassword);

    // Log audit
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: req.user._id,
      description: 'User changed password',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET CURRENT USER =============
export const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

// ============= LOGOUT =============
export const logout = async (req, res) => {
  try {
    // Log audit
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: req.user._id,
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  logout,
};
