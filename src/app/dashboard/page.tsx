'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useSession } from 'next-auth/react';
import DashboardNavWrapper from './DashboardNavWrapper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FiUsers, FiDollarSign, FiPackage, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useCachedFetch } from '@/hooks/useCachedFetch';

interface DashboardStats {
  totalEmployees: number;
  totalSales: number;
  totalProducts: number;
}

// Mock API call to simulate data fetching
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random errors (20% chance)
  if (Math.random() < 0.2) {
    throw new Error('Failed to fetch dashboard data');
  }

  return {
    totalEmployees: 42,
    totalSales: 125000,
    totalProducts: 156,
  };
};



export default function Dashboard() {
  const { data: session } = useSession();
  const { data: stats, isLoading, error, refetch } = useCachedFetch<DashboardStats>({
    key: 'dashboard_stats',
    fetchFn: fetchDashboardStats,
    ttl: 2 * 60 * 1000, // 2 minutes cache
    useLocalStorage: true, // Persist across page refreshes
  });

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard data..." />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center h-64 p-4 bg-red-50 rounded-lg">
          <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Try to get business info from the profile section if available, else fallback to session or default
  // If you have a global context or state for business/profile, use that here
  let businessName = session?.user?.business_name || 'Your Business';
  let businessLogo = session?.user?.business_logo || session?.user?.image || '/default-logo.png';

  return (
    <DashboardNavWrapper>
      <AuthenticatedLayout>
        <div className="flex flex-col gap-6 px-4 md:px-8 max-w-[1128px] mx-auto">
          <div className="bg-white shadow-md rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
                  <p className="mt-2 text-gray-600">Welcome back! Here's your business overview.</p>
                </div>
                <button
                  onClick={refetch}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalEmployees}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-semibold text-gray-900">${stats?.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FiPackage className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </DashboardNavWrapper>
  );
}