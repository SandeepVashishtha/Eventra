import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, hasPermission } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Simulated API calls - replace with actual API endpoints
      const userEventsResponse = await fetch('http://localhost:8080/api/user/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const availableEventsResponse = await fetch('http://localhost:8080/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (userEventsResponse.ok) {
        const userEventsData = await userEventsResponse.json();
        setUserEvents(userEventsData);
      }

      if (availableEventsResponse.ok) {
        const availableEventsData = await availableEventsResponse.json();
        setAvailableEvents(availableEventsData);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh data after joining
        fetchUserData();
      } else {
        setError('Failed to join event');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, {user?.firstName} {user?.lastName}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>My Events</h3>
          <p className="stat-number">{userEvents.length}</p>
        </div>
        <div className="stat-card">
          <h3>Available Events</h3>
          <p className="stat-number">{availableEvents.length}</p>
        </div>
        <div className="stat-card">
          <h3>Profile Status</h3>
          <p className="stat-text">Active</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Event Activities</h2>
        <div className="action-buttons">
          <Link to="/events" className="action-btn browse-events">
            Browse Events
          </Link>
          <button className="action-btn my-registrations">
            My Registrations
          </button>
          <button className="action-btn profile-settings">
            Profile Settings
          </button>
        </div>
      </div>

      {userEvents.length > 0 && (
        <div className="dashboard-section">
          <h2>My Events</h2>
          <div className="events-grid">
            {userEvents.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                <p className="event-description">{event.description}</p>
                <div className="event-actions">
                  <button className="btn-small">View Details</button>
                  {hasPermission('CREATE_FEEDBACK') && (
                    <button className="btn-small">Leave Feedback</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Available Events</h2>
        {availableEvents.length > 0 ? (
          <div className="events-grid">
            {availableEvents.slice(0, 6).map(event => (
              <div key={event.id} className="event-card available">
                <h3>{event.title}</h3>
                <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                <p className="event-description">{event.description}</p>
                <div className="event-actions">
                  <button className="btn-small">View Details</button>
                  {hasPermission('PARTICIPATE_EVENT') && (
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => joinEvent(event.id)}
                    >
                      Join Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No events available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
