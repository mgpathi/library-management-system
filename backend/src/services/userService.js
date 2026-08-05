/**
 * User Service
 * Business logic for user management
 */

import User from '../models/User.js';
import { getPaginationParams } from '../utils/helpers.js';
import { MEMBERSHIP_STATUS, ROLES } from '../constants/index.js';

export const userService = {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const query = { isDeleted: false };

    // Apply filters
    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { membershipId: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    return {
      users,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    };
  },

  /**
   * Search users
   */
  async searchUsers(searchTerm, limit = 10) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { membershipId: { $regex: searchTerm, $options: 'i' } },
      ],
      isDeleted: false,
      status: MEMBERSHIP_STATUS.ACTIVE,
    }).limit(limit);

    return users;
  },

  /**
   * Update user status
   */
  async updateUserStatus(userId, status) {
    if (!Object.values(MEMBERSHIP_STATUS).includes(status)) {
      throw new Error('Invalid status');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Suspend user account
   */
  async suspendUser(userId, reason = '') {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: MEMBERSHIP_STATUS.SUSPENDED,
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Activate user account
   */
  async activateUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status: MEMBERSHIP_STATUS.ACTIVE },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, status: MEMBERSHIP_STATUS.INACTIVE },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Get user borrowing statistics
   */
  async getUserBorrowStats(userId) {
    const BorrowRecord = require('../models/BorrowRecord.js').default;
    const { BORROW_STATUS } = require('../constants/index.js');

    const activeBorrows = await BorrowRecord.countDocuments({
      user: userId,
      status: BORROW_STATUS.ACTIVE,
    });

    const overdueCount = await BorrowRecord.countDocuments({
      user: userId,
      status: BORROW_STATUS.OVERDUE,
    });

    const totalBorrows = await BorrowRecord.countDocuments({ user: userId });

    return {
      activeBorrows,
      overdueCount,
      totalBorrows,
    };
  },

  /**
   * Check if user can borrow more books
   */
  async canBorrowMore(userId) {
    const MAX_ACTIVE_BORROWS = 5;
    const BorrowRecord = require('../models/BorrowRecord.js').default;
    const { BORROW_STATUS } = require('../constants/index.js');

    const activeBorrows = await BorrowRecord.countDocuments({
      user: userId,
      status: BORROW_STATUS.ACTIVE,
    });

    const hasOverdue = await BorrowRecord.findOne({
      user: userId,
      status: BORROW_STATUS.OVERDUE,
    });

    return activeBorrows < MAX_ACTIVE_BORROWS && !hasOverdue;
  },
};

export default userService;
