/**
 * Fine Controller
 * Handles fine management operations
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import Fine from '../models/Fine.js';
import BorrowRecord from '../models/BorrowRecord.js';
import AuditLog from '../models/AuditLog.js';
import { getPaginationParams } from '../utils/helpers.js';

// ============= GET USER FINES =============
export const getUserFines = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const userId = req.params.userId || req.user._id;

    const query = { user: userId };
    if (status) query.status = status;

    const total = await Fine.countDocuments(query);
    const fines = await Fine.find(query)
      .populate('book')
      .populate('borrowRecord')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'User fines retrieved',
      data: { fines },
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET ALL FINES (ADMIN) =============
export const getAllFines = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const query = {};
    if (status) query.status = status;

    const total = await Fine.countDocuments(query);
    const fines = await Fine.find(query)
      .populate('user')
      .populate('book')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Fines retrieved',
      data: { fines },
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET FINE BY ID =============
export const getFineById = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id)
      .populate('user')
      .populate('book')
      .populate('borrowRecord');

    if (!fine) {
      return next(new ErrorResponse('Fine not found', 404));
    }

    res.json({
      success: true,
      message: 'Fine retrieved',
      data: { fine },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= PAY FINE =============
export const payFine = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;

    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return next(new ErrorResponse('Fine not found', 404));
    }

    fine.recordPayment(amount, paymentMethod, transactionId);
    await fine.save();

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'FINE_PAID',
      entityType: 'Fine',
      entityId: fine._id,
      description: `Fine paid: Rs. ${amount}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Fine payment recorded',
      data: { fine },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= WAIVE FINE =============
export const waiveFine = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return next(new ErrorResponse('Fine not found', 404));
    }

    fine.waiveFine(amount, reason, req.user._id);
    await fine.save();

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'FINE_WAIVED',
      entityType: 'Fine',
      entityId: fine._id,
      description: `Fine waived: Rs. ${amount} - ${reason}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Fine waived successfully',
      data: { fine },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET FINE STATISTICS =============
export const getFineStats = async (req, res, next) => {
  try {
    const totalFines = await Fine.countDocuments();
    const unpaidFines = await Fine.countDocuments({ status: 'unpaid' });
    const paidFines = await Fine.countDocuments({ status: 'paid' });
    const totalAmount = await Fine.aggregate([
      { $match: { status: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } },
    ]);

    res.json({
      success: true,
      message: 'Fine statistics retrieved',
      data: {
        totalFines,
        unpaidFines,
        paidFines,
        totalUnpaidAmount: totalAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

export default {
  getUserFines,
  getAllFines,
  getFineById,
  payFine,
  waiveFine,
  getFineStats,
};
