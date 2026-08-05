/**
 * Fine Model Schema
 * Tracks fines for overdue books
 */

import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema(
  {
    // Reference to BorrowRecord and User
    borrowRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRecord',
      required: true,
      unique: true,
      index: true,
    },
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
    },

    // Fine Details
    daysOverdue: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyFineAmount: {
      type: Number,
      required: [true, 'Daily fine amount is required'],
      default: 10,
    },
    totalFineAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Status
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'partially_paid', 'waived'],
      default: 'unpaid',
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },

    // Payment Information
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'other'],
    },
    transactionId: String,

    // Waive Information
    waivedAmount: {
      type: Number,
      default: 0,
    },
    waiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    waiveReason: String,
    waiveDate: Date,

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

fineSchema.index({ user: 1, status: 1 });
fineSchema.index({ createdAt: -1 });

// ============= METHODS =============

/**
 * Record payment for fine
 * @param {Number} amount - Amount paid
 * @param {String} method - Payment method
 * @param {String} transactionId - Transaction ID (optional)
 */
fineSchema.methods.recordPayment = function(amount, method, transactionId = null) {
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  const previouslyPaid = this.paidAmount;
  this.paidAmount = Math.min(previouslyPaid + amount, this.totalFineAmount);
  this.remainingAmount = this.totalFineAmount - this.paidAmount;

  if (this.remainingAmount === 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  }

  this.paymentDate = new Date();
  this.paymentMethod = method;
  if (transactionId) {
    this.transactionId = transactionId;
  }
};

/**
 * Waive fine amount
 * @param {Number} amount - Amount to waive
 * @param {String} reason - Reason for waiver
 * @param {ObjectId} waiverId - User ID of who is waiving
 */
fineSchema.methods.waiveFine = function(amount, reason, waiverId) {
  if (amount > this.remainingAmount) {
    throw new Error('Waive amount cannot exceed remaining fine');
  }

  this.waivedAmount += amount;
  this.remainingAmount -= amount;
  this.waiveReason = reason;
  this.waiverId = waiverId;
  this.waiveDate = new Date();

  if (this.remainingAmount === 0) {
    this.status = 'waived';
  }
};

export default mongoose.model('Fine', fineSchema);
