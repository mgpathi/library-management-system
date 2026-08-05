/**
 * Category Controller
 * Handles book category operations
 */

import { ErrorResponse } from '../middleware/errorHandler.js';
import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';

// ============= CREATE CATEGORY =============
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new ErrorResponse('Category already exists', 400));
    }

    const category = await Category.create({
      name,
      description,
      icon,
      color,
    });

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'ADMIN_ACTION',
      entityType: 'Category',
      entityId: category._id,
      description: `Created category: ${name}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET ALL CATEGORIES =============
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ name: 1 });

    res.json({
      success: true,
      message: 'Categories retrieved',
      data: { categories },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= GET CATEGORY BY ID =============
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) {
      return next(new ErrorResponse('Category not found', 404));
    }

    res.json({
      success: true,
      message: 'Category retrieved',
      data: { category },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= UPDATE CATEGORY =============
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'ADMIN_ACTION',
      entityType: 'Category',
      entityId: category._id,
      description: `Updated category: ${category.name}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// ============= DELETE CATEGORY =============
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    await AuditLog.createLog({
      userId: req.user._id,
      action: 'ADMIN_ACTION',
      entityType: 'Category',
      entityId: category._id,
      description: `Deleted category: ${category.name}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
