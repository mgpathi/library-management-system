/**
 * Header Component
 * Top navigation bar
 */

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/uiSlice';
import authService from '../services/authService';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <header className="d-flex align-items-center justify-content-between bg-dark text-white px-4 py-3 border-bottom border-secondary">
      <div className="flex-grow-1">
        <h2 className="h5 fw-semibold mb-0">Library Management System</h2>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          className="btn btn-dark border-0 rounded-circle p-2"
          title="Toggle theme"
        >
          <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'} fs-5`}></i>
        </button>

        {/* User Menu */}
        {user && (
          <div className="d-flex align-items-center gap-2">
            <div className="text-end">
              <p className="fw-medium mb-0">
                {user.firstName} {user.lastName}
              </p>
              <p className="small text-white-50 text-capitalize mb-0">{user.role}</p>
            </div>
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-secondary border border-2 border-primary"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="bi bi-person-fill fs-5"></i>
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-danger d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
