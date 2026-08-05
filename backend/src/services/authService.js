/**
 * Authentication Service
 * Business logic for authentication operations
 */

import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { generateMembershipId } from '../utils/helpers.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';
import crypto from 'crypto';

export const authService = {
  /**
   * Register new user
   */
  async register(data) {
    const {
      firstName, lastName, email, phone, password, address
    } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create membership ID
    const membershipId = generateMembershipId();

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      role: ROLES.STUDENT,
      membershipId,
      membershipExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: MEMBERSHIP_STATUS.ACTIVE,
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, `${firstName} ${lastName}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      user: user.getPublicProfile(),
      token,
      refreshToken,
    };
  },

  /**
   * Login user
   */
  async login(email, password) {
    console.log(`Attempting login for email: ${email}`);
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== MEMBERSHIP_STATUS.ACTIVE) {
      throw new Error('Your account is not active');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    console.log(`User ${user.email} logged in successfully`);
    return {
      user: user.getPublicProfile(),
      token,
      refreshToken,
    };
  },

  /**
   * Forgot password - generate reset token
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User with this email not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    return resetToken;
  },

  /**
   * Reset password
   */
  async resetPassword(resetToken, password) {
    // Find user by reset token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      user: user.getPublicProfile(),
      token,
      refreshToken,
    };
  },

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    if (!(await user.matchPassword(currentPassword))) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  },

  /**
   * Verify email token
   */
  async verifyEmail(verificationToken) {
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return { message: 'Email verified successfully' };
  },
};

export default authService;
