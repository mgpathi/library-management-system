/**
 * Dashboard Service
 * Dashboard-related API calls
 */

import apiClient from './apiClient';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  getRecentTransactions: async (limit = 10) => {
    const response = await apiClient.get('/dashboard/transactions', {
      params: { limit },
    });
    return response.data;
  },

  getPopularBooks: async (limit = 5) => {
    const response = await apiClient.get('/dashboard/books/popular', {
      params: { limit },
    });
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/dashboard/users/stats');
    return response.data;
  },

  getBorrowStats: async () => {
    const response = await apiClient.get('/dashboard/borrow/stats');
    return response.data;
  },

  getFineStats: async () => {
    const response = await apiClient.get('/dashboard/fines/stats');
    return response.data;
  },
};

export default dashboardService;
