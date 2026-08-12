/**
 * Main App Component
 * Routes and layout setup
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from './store/slices/authSlice';
import authService from './services/authService';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BooksListPage from './pages/books/BooksListPage';
import BookDetailPage from './pages/books/BookDetailPage';
import BookFormPage from './pages/books/BookFormPage';
import BookBorrowPage from './pages/books/BookBorrowPage';
import BookReturnPage from './pages/books/BookReturnPage';
import UsersListPage from './pages/users/UsersListPage';
import ProfilePage from './pages/profile/ProfilePage';
import MyBooksPage from './pages/books/MyBooksPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          dispatch(loginSuccess({
            user: response.data.user,
            token,
            refreshToken: localStorage.getItem('refreshToken'),
          }));
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BooksListPage />} />
        <Route path="/books/new" element={<BookFormPage />} />
        <Route path="/books/edit/:id" element={<BookFormPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/books/borrow/:id" element={<BookBorrowPage />} />
        <Route path="/books/return/:id" element={<BookReturnPage />} />
        <Route path="/my-books" element={<MyBooksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={<UsersListPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
