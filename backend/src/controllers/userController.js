/**
 * User Controller
 * Handles user-related HTTP requests
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import userService from '../services/userService.js';
import { formatSuccessResponse } from '../utils/helpers.js';
import AuditLog from '../models/AuditLog.js';

// ============= GET PROFILE =============
export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user._id);

    res.json({
      success: true,
      message: 'User profile retrieved',
      data: { user },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 404));
  }
};

// ============= UPDATE PROFILE =============
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'address', 'bio', 'profileImage'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await userService.updateProfile(req.user._id, updates);

    // Log audit
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'PROFILE_UPDATED',
      entityType: 'User',
      entityId: req.user._id,
      changes: { before: req.user, after: user },
      description: 'User updated profile',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET ALL USERS (ADMIN) =============
export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, status, search } = req.query;

    const result = await userService.getAllUsers(page, limit, {
      role,
      status,
      search,
    });

    res.json({
      success: true,
      message: 'Users retrieved',
      data: { users: result.users },
      pagination: result.pagination,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET USER BY ID (ADMIN) =============
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      message: 'User retrieved',
      data: { user },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 404));
  }
};

// ============= SEARCH USERS =============
export const searchUsers = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return next(new ErrorResponse('Search term must be at least 2 characters', 400));
    }

    const users = await userService.searchUsers(q, limit);

    res.json({
      success: true,
      message: 'Users found',
      data: { users },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= UPDATE USER STATUS (ADMIN) =============
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const user = await userService.updateUserStatus(req.params.id, status);

    // Log audit
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'ADMIN_ACTION',
      entityType: 'User',
      entityId: user._id,
      description: `Admin changed user status to ${status}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: { user },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= SUSPEND USER (ADMIN) =============
export const suspendUser = async (req, res, next) => {
  try {
    const user = await userService.suspendUser(req.params.id);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'ADMIN_ACTION',
      entityType: 'User',
      entityId: user._id,
      description: 'Admin suspended user account',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'User account suspended',
      data: { user },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= ACTIVATE USER (ADMIN) =============
export const activateUser = async (req, res, next) => {
  try {
    const user = await userService.activateUser(req.params.id);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'ADMIN_ACTION',
      entityType: 'User',
      entityId: user._id,
      description: 'Admin activated user account',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'User account activated',
      data: { user },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= DELETE USER (ADMIN) =============
export const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: user._id,
      description: 'Admin deleted user account',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET USER BORROW STATS =============
export const getBorrowStats = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user._id;
    const stats = await userService.getUserBorrowStats(userId);

    res.json({
      success: true,
      message: 'User borrow statistics retrieved',
      data: stats,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

export default {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  searchUsers,
  updateUserStatus,
  suspendUser,
  activateUser,
  deleteUser,
  getBorrowStats,
};
