import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiUtils } from '../../config/api';
import ConfirmationModal from '../common/ConfirmationModal'; // ADD THIS IMPORT
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxParticipants: ''
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ADD THIS LINE

  // REPLACE THE EXISTING handleLogout FUNCTION WITH THESE 3 FUNCTIONS:
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch users and events data
      const usersResponse = await apiUtils.get(API_ENDPOINTS.ADMIN.USERS, token);
      const eventsResponse = await apiUtils.get(API_ENDPOINTS.ADMIN.EVENTS, token);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard bg-gray-50 dark:bg-black">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.firstName} {user?.lastName}</p>
        {/* CHANGE ONLY THIS BUTTON */}
        <button className="logout-button" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'overview' && (
        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Events</h3>
              <p className="stat-number">{events.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active Sessions</h3>
              <p className="stat-number">-</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="dashboard-content">
          <div className="dashboard-actions">
            <h2>Event Management</h2>
            <div className="action-buttons">
              {hasPermission('CREATE_EVENT') && (
                <button className="action-btn create-event"  onClick={() => navigate("/create-event")}>
                  + New Event
                </button>
              )}
            </div>
          </div>

          <div className="events-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.participantCount || 0}</td>
                    <td>{event.status || 'Active'}</td>
                    <td>
                      {hasPermission('EDIT_EVENT') && (
                        <button className="btn-small">Edit</button>
                      )}
                      {hasPermission('DELETE_EVENT') && (
                        <button className="btn-small btn-danger">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-content">
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.roles?.join(', ') || 'USER'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {hasPermission('EDIT_USER') && (
                        <button className="btn-small">Edit</button>
                      )}
                      {hasPermission('DELETE_USER') && (
                        <button className="btn-small btn-danger">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD THIS MODAL AT THE BOTTOM */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />
    </div>
  );
};

export default AdminDashboard;