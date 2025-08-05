import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, hasPermission } = useAuth();
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulated API calls - replace with actual API endpoints
      const usersResponse = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const eventsResponse = await fetch('http://localhost:8080/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

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
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.firstName} {user?.lastName}</p>
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
                <button className="action-btn create-event" onClick={() => setShowEventForm(!showEventForm)}>
                  {showEventForm ? 'Close Form' : '+ New Event'}
                </button>
              )}
            </div>
          </div>

          {showEventForm && (
            <form className="event-form">
              <h3>Create New Event</h3>
              <input type="text" placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea placeholder="Event Description" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}></textarea>
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
              <input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} />
              <input type="number" placeholder="Max Participants" value={newEvent.maxParticipants} onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})} />
              <button type="submit" className="action-btn">Create Event</button>
            </form>
          )}

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
    </div>
  );
};

export default AdminDashboard;
