import { useState } from 'react';
import { getGoogleCalendarUrl, generateRawICSContent } from '../utils/calendarLinks';

const AddToCalendarDropdown = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadICS = (e) => {
    e.preventDefault();
    const icsString = generateRawICSContent(event);
    
    // Create a client-side virtual blob to force immediate browser download
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `event_${event.id || 'details'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{
          cursor: 'pointer',
          padding: '10px 16px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        📅 Add to Calendar ▾
      </button>

      {isOpen && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          listStyle: 'none',
          padding: '6px 0',
          margin: '6px 0 0 0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          minWidth: '180px'
        }}>
          <li>
            <a 
              href={getGoogleCalendarUrl(event)} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'block', padding: '8px 16px', color: '#374151', textDecoration: 'none', fontSize: '14px' }}
              onClick={() => setIsOpen(false)}
            >
              Google Calendar
            </a>
          </li>
          <li style={{ borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
            <a 
              href="#"
              onClick={handleDownloadICS}
              style={{ display: 'block', padding: '8px 16px', color: '#374151', textDecoration: 'none', fontSize: '14px' }}
            >
              Apple / Outlook (.ics)
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default AddToCalendarDropdown;