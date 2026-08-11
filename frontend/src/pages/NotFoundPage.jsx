import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
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

export default NotFoundPage;
