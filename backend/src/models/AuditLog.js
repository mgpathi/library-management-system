/**
 * AuditLog Model Schema
 * Tracks all important system activities and changes
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // User who performed the action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Action Details
    action: {
      type: String,
      required: true,
      enum: [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED',
        'BOOK_ADDED',
        'BOOK_UPDATED',
        'BOOK_DELETED',
        'BOOK_BORROWED',
        'BOOK_RETURNED',
        'BOOK_RENEWED',
        'SEND_OVERDUE_ALERT',
        'FINE_CREATED',
        'FINE_PAID',
        'FINE_WAIVED',
        'REPORT_GENERATED',
        'SETTINGS_CHANGED',
        'ADMIN_ACTION',
        'PROFILE_UPDATED',
        'PASSWORD_CHANGED',
      ],
      index: true,
    },

    // Entity Information
    entityType: {
      type: String,
      enum: ['User', 'Book', 'BorrowRecord', 'Fine', 'Category'],
    },
    entityId: mongoose.Schema.Types.ObjectId,

    // Change Details
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    description: String,

    // Request Details
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },

    // Status
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Data Retention (delete after 1 year)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// ============= INDEXES =============

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

// Set TTL index to auto-delete old records
auditLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============= STATIC METHODS =============

/**
 * Create an audit log entry
 * @param {Object} data - Log data
 * @returns {Promise<Object>}
 */
auditLogSchema.statics.createLog = async function(data) {
  try {
    const log = await this.create({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      endpoint: data.endpoint,
      method: data.method,
      success: data.success || true,
      errorMessage: data.errorMessage,
    });
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent disrupting main operation
  }
};

export default mongoose.model('AuditLog', auditLogSchema);
