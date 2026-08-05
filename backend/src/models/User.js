/**
 * User Model Schema
 * Stores user/member information in the library system
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+?\d{1,3}[-.\s]?)?\d{10,}$/, 'Please provide a valid phone number'],
    },

    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    // Role and Status
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    status: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
    },

    // Membership Information
    membershipId: {
      type: String,
      unique: true,
      sparse: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    membershipExpiryDate: {
      type: Date,
      required: function() {
        return this.role !== ROLES.ADMIN;
      },
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },

    // Profile
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Account Settings
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Preferences
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      dueReminders: {
        type: Boolean,
        default: true,
      },
      overdueAlerts: {
        type: Boolean,
        default: true,
      },
    },

    // System Fields
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============= INDEXES =============

userSchema.index({ email: 1 });
userSchema.index({ membershipId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// ============= VIRTUAL FIELDS =============

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isActive').get(function() {
  return this.status === MEMBERSHIP_STATUS.ACTIVE;
});

userSchema.set('toJSON', { virtuals: true });

// ============= MIDDLEWARE =============

// Hash password before saving if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============= METHODS =============

/**
 * Compare password with hashed password
 * @param {String} enteredPassword - Password to compare
 * @returns {Promise<Boolean>} - True if password matches
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Get public profile data
 * @returns {Object} - User profile without sensitive data
 */
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  return userObject;
};

export default mongoose.model('User', userSchema);
