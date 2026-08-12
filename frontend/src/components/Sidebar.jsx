/**
 * Sidebar Component
 * Navigation sidebar
 */

import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../store/slices/uiSlice';

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2' },
    { name: 'Books', path: '/books', icon: 'bi-book' },
    { name: 'My Books', path: '/my-books', icon: 'bi-journal-bookmark' },
    ...(user?.role === 'admin' || user?.role === 'librarian'
      ? [{ name: 'Users', path: '/users', icon: 'bi-people' }]
      : []),
    { name: 'Profile', path: '/profile', icon: 'bi-person-circle' },
    { name: 'Settings', path: '/settings', icon: 'bi-gear' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className="d-flex flex-column bg-dark text-white border-end border-secondary"
      style={{ width: sidebarOpen ? '16rem' : '5rem', transition: 'width 0.3s ease' }}
    >
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
        {sidebarOpen && <h1 className="h5 fw-bold mb-0">Wild Geese</h1>}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="btn btn-dark border-0 p-2"
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
      </div>

      <nav className="nav flex-column mt-3 flex-grow-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-0 ${
              isActive(item.path) ? 'active bg-primary text-white' : 'text-white-50'
            }`}
            title={!sidebarOpen ? item.name : ''}
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            {sidebarOpen && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary">
        <button
          type="button"
          className="btn btn-dark border-0 w-100 d-flex align-items-center gap-3 px-3 py-2 text-white-50"
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
