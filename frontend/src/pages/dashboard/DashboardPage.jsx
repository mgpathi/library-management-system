/**
 * Dashboard Page
 */

import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useCustom';
import dashboardService from '../../services/dashboardService';

function DashboardPage() {
  const { makeRequest } = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await makeRequest(() => dashboardService.getDashboardStats(), {
          showError: false,
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
        <span className="fs-5 text-secondary">Loading...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Total Books', value: stats?.totalBooks || 0, color: 'bg-primary', icon: 'bi-book' },
    { label: 'Available Books', value: stats?.availableBooks || 0, color: 'bg-success', icon: 'bi-check-circle' },
    { label: 'Borrowed Books', value: stats?.borrowedBooks || 0, color: 'bg-warning', icon: 'bi-journal-arrow-up' },
    { label: 'Overdue Books', value: stats?.overdueBooks || 0, color: 'bg-danger', icon: 'bi-exclamation-triangle' },
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-purple', icon: 'bi-people' },
    { label: 'Active Users', value: stats?.activeUsers || 0, color: 'bg-info', icon: 'bi-person-check' },
  ];

  return (
    <div>
      <h1 className="h2 fw-bold mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {cards.map((card) => (
          <div key={card.label} className="col-12 col-md-6 col-lg-4">
            <div className={`card border-0 shadow-sm text-white ${card.color}`}>
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <p className="small opacity-75 mb-2">{card.label}</p>
                  <p className="display-6 fw-bold mb-0">{card.value}</p>
                </div>
                <i className={`bi ${card.icon} display-5 opacity-50`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h5 fw-semibold mb-3">Quick Stats</h2>
          <div className="row g-4">
            <div className="col-6">
              <p className="text-secondary mb-1">Unpaid Fines</p>
              <p className="h4 fw-bold text-danger mb-0">Rs. {stats?.unpaidFinesAmount || 0}</p>
            </div>
            <div className="col-6">
              <p className="text-secondary mb-1">Membership</p>
              <p className="h4 fw-bold text-success mb-0">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
