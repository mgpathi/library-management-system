/**
 * Sidebar Component
 * Navigation sidebar
 */

import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../store/slices/uiSlice';
// import {
//   HomeIcon,
//   BookOpenIcon,
//   UsersIcon,
//   CogIcon,
//   LogOutIcon,
// } from '@heroicons/react/24/outline';

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Books', path: '/books', icon: '📚' },
    { name: 'My Books', path: '/my-books', icon: '📖' },
    ...(user?.role === 'admin' || user?.role === 'librarian'
      ? [{ name: 'Users', path: '/users', icon: '👥' }]
      : []),
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && (
          <h1 className="text-xl font-bold">LibMS</h1>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 hover:bg-gray-700 rounded"
        >
          ☰
        </button>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            title={!sidebarOpen ? item.name : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && <span className="ml-4">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
          <span className="text-xl">🚪</span>
          {sidebarOpen && <span className="ml-4">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
