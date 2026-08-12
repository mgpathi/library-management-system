/**
 * Placeholder Pages
 */

import { useNavigate } from 'react-router-dom';

export function BookDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-1 text-decoration-none">
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="h2 fw-bold mb-3">Book Details</h1>
        <p className="text-secondary mb-0">Book details page - to be implemented</p>
      </div>
    </div>
  );
}

export function MyBooksPage() {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h1 className="h2 fw-bold mb-3">My Books</h1>
        <p className="text-secondary mb-0">My books page - to be implemented</p>
      </div>
    </div>
  );
}

export function UsersListPage() {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h1 className="h2 fw-bold mb-3">Users</h1>
        <p className="text-secondary mb-0">Users management page - to be implemented</p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h1 className="h2 fw-bold mb-3">Profile</h1>
        <p className="text-secondary mb-0">Profile page - to be implemented</p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold mb-3">404</h1>
        <p className="fs-4 text-secondary mb-4">Page not found</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-house"></i>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
