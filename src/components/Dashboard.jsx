import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import UserDashboard from './user/UserDashboard';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  // Show admin dashboard if user is admin
  if (isAdmin()) {
    return <AdminDashboard />;
  }

  // Otherwise show regular user dashboard
  return <UserDashboard />;
};

export default Dashboard;
