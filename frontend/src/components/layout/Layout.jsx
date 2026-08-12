/**
 * Layout Component
 * Main layout wrapper for protected pages
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useSelector } from 'react-redux';

function Layout() {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="d-flex vh-100 overflow-hidden bg-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
