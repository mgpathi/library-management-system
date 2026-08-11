/**
 * Borrow Service
 * Book borrowing-related API calls
 */

import apiClient from './apiClient';

export const borrowService = {
  borrowBook: async (bookId, userId = null, issuedBy = null) => {
    const response = await apiClient.post('/borrow/borrow', {
      bookId,
      ...(userId && { userId }),
      ...(issuedBy && { issuedBy }),
    });
    return response.data;
  },

  returnBook: async (borrowRecordId, returnCondition = 'good', remarks = '') => {
    const response = await apiClient.post('/borrow/return', {
      borrowRecordId,
      returnCondition,
      remarks,
    });
    return response.data;
  },

  renewBook: async (borrowRecordId) => {
    const response = await apiClient.post('/borrow/renew', { borrowRecordId });
    return response.data;
  },

  getActiveBorrows: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/borrow/my-books', {
      params: { page, limit },
    });
    return response.data;
  },

  getBorrowHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/borrow/my-history', {
      params: { page, limit },
    });
    return response.data;
  },

  getOverdueBooks: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/borrow/overdue', {
      params: { page, limit },
    });
    return response.data;
  },

  sendDueReminders: async () => {
    const response = await apiClient.post('/borrow/send-reminders');
    return response.data;
  },

  getBorrowStats: async () => {
    const response = await apiClient.get('/borrow/stats');
    return response.data;
  },

  getUserActiveBorrows: async (userId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/borrow/${userId}/active`, {
      params: { page, limit },
    });
    return response.data;
  },

  getUserBorrowHistory: async (userId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/borrow/${userId}/history`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default borrowService;
