// CreateEventPage.js
import React from 'react';
import { useTheme } from '../ThemeContext'; 
import EventCreationForm from '../components/EventCreationForm';
import './CreateEvent.css';

const CreateEventPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`create-event-page ${theme === 'dark' ? 'create-event-dark' : 'create-event-light'}`}>
      {/* Page Header */}
      <div className="create-event-header">
        <div className="container">
          <div className="header-content">
            <h1 className="page-title">Create New Event</h1>
            <p className="page-subtitle">
              Bring your community together with an amazing event
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="create-event-content">
        <div className="container">
          <EventCreationForm />
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;