/**
 * Book Model Schema
 * Stores book information and inventory details
 */

import mongoose from 'mongoose';
import { BOOK_STATUS } from '../constants/index.js';

const bookSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      match: [/^(?:ISBN(?:-1[03])?[ -]?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[ -]?){3})[ -0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[ -]?){4})[ -0-9]{17}$)(?:97[89][ -]?)?[0-9]{1,5}[ -]?[0-9]+[ -]?[0-9]+[ -]?[0-9X]/, 'Please provide a valid ISBN'],
    },
    description: {
      type: String,
      maxlength: 2000,
    },

    // Category and Publisher
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    publisher: {
      type: String,
      required: [true, 'Publisher is required'],
      trim: true,
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: 1000,
      max: new Date().getFullYear() + 1,
    },

    // Language and Edition
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Others'],
      default: 'English',
    },
    edition: {
      type: String,
      default: '1st',
    },

    // Inventory Management
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Total copies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    borrowedCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    damagedCopies: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Location and Organization
    shelfLocation: {
      floor: Number,
      section: String,
      rack: String,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Media
    coverImage: {
      type: String,
      default: null,
    },

    // Additional Information
    pages: Number,
    weight: Number, // in grams
    dimensions: {
      height: Number,
      width: Number,
      depth: Number,
    },

    // Pricing and Rights
    price: {
      type: Number,
      default: 0,
    },
    replacementCost: {
      type: Number,
      required: [true, 'Replacement cost is required'],
    },

    // Status
    status: {
      type: String,
      enum: Object.values(BOOK_STATUS),
      default: BOOK_STATUS.AVAILABLE,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Ratings and Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ availableCopies: 1 });

// ============= VIRTUAL FIELDS =============

bookSchema.virtual('isAvailable').get(function() {
  return this.availableCopies > 0;
});

bookSchema.virtual('borrowPercentage').get(function() {
  return (this.borrowedCopies / this.totalCopies) * 100;
});

bookSchema.set('toJSON', { virtuals: true });

// ============= MIDDLEWARE =============

// Update borrowed copies based on available copies
bookSchema.pre('save', function() {
  this.borrowedCopies = this.totalCopies - this.availableCopies - this.damagedCopies;
});

// ============= METHODS =============

/**
 * Check if book has available copies
 * @returns {Boolean} - True if available copies > 0
 */
bookSchema.methods.hasAvailableCopies = function() {
  return this.availableCopies > 0;
};

/**
 * Decrease available copies when book is borrowed
 * @param {Number} count - Number of copies to decrease
 * @returns {Boolean} - True if successful
 */
bookSchema.methods.decreaseAvailableCopies = function(count = 1) {
  if (this.availableCopies >= count) {
    this.availableCopies -= count;
    return true;
  }
  return false;
};

/**
 * Increase available copies when book is returned
 * @param {Number} count - Number of copies to increase
 */
bookSchema.methods.increaseAvailableCopies = function(count = 1) {
  this.availableCopies += count;
  // Ensure available copies don't exceed total copies
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
};

export default mongoose.model('Book', bookSchema);
