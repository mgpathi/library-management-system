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
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Books', value: stats?.totalBooks || 0, color: 'bg-blue-500' },
    { label: 'Available Books', value: stats?.availableBooks || 0, color: 'bg-green-500' },
    { label: 'Borrowed Books', value: stats?.borrowedBooks || 0, color: 'bg-yellow-500' },
    { label: 'Overdue Books', value: stats?.overdueBooks || 0, color: 'bg-red-500' },
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-purple-500' },
    { label: 'Active Users', value: stats?.activeUsers || 0, color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} text-white p-6 rounded-lg shadow-lg`}
          >
            <p className="text-sm opacity-90 mb-2">{card.label}</p>
            <p className="text-4xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Unpaid Fines</p>
            <p className="text-2xl font-bold text-red-600">Rs. {stats?.unpaidFinesAmount || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Membership</p>
            <p className="text-2xl font-bold text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
