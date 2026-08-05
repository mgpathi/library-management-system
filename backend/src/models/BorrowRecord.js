/**
 * BorrowRecord Model Schema
 * Tracks book borrowing and return transactions
 */

import mongoose from 'mongoose';
import { BORROW_STATUS } from '../constants/index.js';

const borrowRecordSchema = new mongoose.Schema(
  {
    // Reference to User and Book
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },

    // Important Dates
    borrowDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },

    // Status and Fine
    status: {
      type: String,
      enum: Object.values(BORROW_STATUS),
      default: BORROW_STATUS.ACTIVE,
      index: true,
    },
    daysOverdue: {
      type: Number,
      default: 0,
    },
    fine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fine',
    },

    // Return Information
    returnCondition: {
      type: String,
      enum: ['good', 'damaged', 'lost'],
      default: null,
    },
    remarks: {
      type: String,
      maxlength: 500,
    },

    // Renewal
    renewalCount: {
      type: Number,
      default: 0,
      max: 3, // Maximum 3 renewals allowed
    },
    lastRenewalDate: Date,

    // Issued/Received By
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  },
  {
    timestamps: true,
  }
);

// ============= INDEXES =============

borrowRecordSchema.index({ user: 1, status: 1 });
borrowRecordSchema.index({ book: 1 });
borrowRecordSchema.index({ dueDate: 1 });
borrowRecordSchema.index({ borrowDate: 1 });

// ============= VIRTUAL FIELDS =============

borrowRecordSchema.virtual('isOverdue').get(function() {
  if (this.status === BORROW_STATUS.RETURNED) {
    return false;
  }
  return new Date() > this.dueDate;
});

borrowRecordSchema.virtual('daysUntilDue').get(function() {
  if (this.status === BORROW_STATUS.RETURNED) {
    return 0;
  }
  const timeDiff = this.dueDate - new Date();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

borrowRecordSchema.set('toJSON', { virtuals: true });

// ============= METHODS =============

/**
 * Check if borrow record is overdue
 * @returns {Boolean}
 */
borrowRecordSchema.methods.checkOverdue = function() {
  if (this.status === BORROW_STATUS.RETURNED) {
    return false;
  }
  const now = new Date();
  return now > this.dueDate;
};

/**
 * Calculate days overdue
 * @returns {Number}
 */
borrowRecordSchema.methods.calculateDaysOverdue = function() {
  if (this.status === BORROW_STATUS.RETURNED || !this.checkOverdue()) {
    return 0;
  }
  const now = new Date();
  return Math.ceil((now - this.dueDate) / (1000 * 3600 * 24));
};

/**
 * Renew the borrow record
 * @param {Number} extensionDays - Number of days to extend
 * @returns {Boolean} - True if renewal successful
 */
borrowRecordSchema.methods.renewBorrow = function(extensionDays = 14) {
  if (this.renewalCount >= 3) {
    return false;
  }
  if (this.status !== BORROW_STATUS.ACTIVE) {
    return false;
  }
  this.dueDate = new Date(this.dueDate.getTime() + extensionDays * 24 * 60 * 60 * 1000);
  this.renewalCount += 1;
  this.lastRenewalDate = new Date();
  return true;
};

export default mongoose.model('BorrowRecord', borrowRecordSchema);
