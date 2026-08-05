/**
 * Fine Service
 * Fine-related API calls
 */

import apiClient from './apiClient';

export const fineService = {
  getUserFines: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get('/fines/my-fines', { params });
    return response.data;
  },

  getFineById: async (id) => {
    const response = await apiClient.get(`/fines/${id}`);
    return response.data;
  },

  payFine: async (fineId, amount, paymentMethod, transactionId = null) => {
    const response = await apiClient.post(`/fines/${fineId}/pay`, {
      amount,
      paymentMethod,
      ...(transactionId && { transactionId }),
    });
    return response.data;
  },

  getAllFines: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get('/fines', { params });
    return response.data;
  },

  waiveFine: async (fineId, amount, reason) => {
    const response = await apiClient.post(`/fines/${fineId}/waive`, {
      amount,
      reason,
    });
    return response.data;
  },

  getFineStats: async () => {
    const response = await apiClient.get('/fines/stats');
    return response.data;
  },
};

export default fineService;
