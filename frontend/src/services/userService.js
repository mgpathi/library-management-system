/**
 * User Service
 * User-related API calls
 */

import apiClient from './apiClient';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await apiClient.get(`/users?${params}`);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  searchUsers: async (searchTerm, limit = 10) => {
    const response = await apiClient.get('/users/search', {
      params: { q: searchTerm, limit },
    });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiClient.put(`/users/${userId}/status`, { status });
    return response.data;
  },

  suspendUser: async (userId) => {
    const response = await apiClient.put(`/users/${userId}/suspend`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await apiClient.put(`/users/${userId}/activate`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  getBorrowStats: async (userId = null) => {
    const url = userId ? `/users/${userId}/borrow-stats` : '/users/borrow-stats';
    const response = await apiClient.get(url);
    return response.data;
  },
};

export default userService;
