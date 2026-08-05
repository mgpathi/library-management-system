/**
 * Book Service
 * Book-related API calls
 */

import apiClient from './apiClient';

export const bookService = {
  createBook: async (data) => {
    const response = await apiClient.post('/books', data);
    return response.data;
  },

  getAllBooks: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await apiClient.get(`/books?${params}`);
    return response.data;
  },

  getBookById: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },

  updateBook: async (id, data) => {
    const response = await apiClient.put(`/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
  },

  searchBooks: async (searchTerm, limit = 10) => {
    const response = await apiClient.get('/books/search', {
      params: { q: searchTerm, limit },
    });
    return response.data;
  },

  getBooksByCategory: async (categoryId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/books/category/${categoryId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getTopBorrowedBooks: async (limit = 10) => {
    const response = await apiClient.get('/books/popular', {
      params: { limit },
    });
    return response.data;
  },

  getBookStats: async () => {
    const response = await apiClient.get('/books/stats');
    return response.data;
  },
};

export default bookService;
