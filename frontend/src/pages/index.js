/**
 * Placeholder Pages
 */

import { useNavigate } from 'react-router-dom';

export function BookDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4">← Back</button>
      <h1 className="text-3xl font-bold">Book Details</h1>
      <p className="text-gray-600 mt-4">Book details page - to be implemented</p>
    </div>
  );
}

export function MyBooksPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold">My Books</h1>
      <p className="text-gray-600 mt-4">My books page - to be implemented</p>
    </div>
  );
}

export function UsersListPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="text-gray-600 mt-4">Users management page - to be implemented</p>
    </div>
  );
}

export function ProfilePage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-gray-600 mt-4">Profile page - to be implemented</p>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
