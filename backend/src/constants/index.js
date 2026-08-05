/**
 * Constants for Role-Based Access Control
 */

export const ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  STUDENT: 'student',
};

export const ROLE_PERMISSIONS = {
  admin: ['all'],
  librarian: [
    'view_books',
    'add_books',
    'edit_books',
    'delete_books',
    'issue_books',
    'return_books',
    'view_users',
    'view_reports',
    'manage_fines',
    'view_borrowing_history',
  ],
  student: [
    'view_books',
    'view_own_profile',
    'borrow_books',
    'return_books',
    'view_own_borrowing_history',
  ],
};

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

export const BOOK_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  RESERVED: 'reserved',
  DAMAGED: 'damaged',
  LOST: 'lost',
};

export const BORROW_STATUS = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const FINE_CONFIG = {
  DAILY_FINE: 10, // in currency units
  MAX_DAYS_ALLOWED: 14,
};

export default {
  ROLES,
  ROLE_PERMISSIONS,
  MEMBERSHIP_STATUS,
  BOOK_STATUS,
  BORROW_STATUS,
  PAGINATION,
  FINE_CONFIG,
};
