/**
 * Google Calendar utility functions
 * These functions help create Google Calendar event URLs for adding events to Google Calendar
 */

/**
 * Generates a Google Calendar event URL based on event data
 * @param {Object} eventData - The event data
 * @param {string} eventData.title - The title of the event
 * @param {string} eventData.description - The description of the event
 * @param {string} eventData.location - The location of the event
 * @param {string} eventData.startDate - The start date of the event in ISO format (YYYY-MM-DD)
 * @param {string} eventData.endDate - The end date of the event in ISO format (YYYY-MM-DD)
 * @param {string} eventData.startTime - The start time of the event (optional)
 * @param {string} eventData.endTime - The end time of the event (optional)
 * @returns {string} The Google Calendar URL
 */
export const generateGoogleCalendarUrl = (eventData) => {
  // Base URL for Google Calendar
  const baseUrl = 'https://calendar.google.com/calendar/render';
  
  // Convert dates to the format Google Calendar expects
  let startDateTime, endDateTime;
  
  if (eventData.startTime) {
    // If we have a start time, combine date and time
    const [hours, minutes] = eventData.startTime.split(':');
    const startDate = new Date(eventData.startDate);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    startDateTime = startDate.toISOString().replace(/-|:|\.\d+/g, '');
  } else {
    // If no time, use the date only (all day event)
    startDateTime = eventData.startDate.replace(/-/g, '');
  }

  // Handle end date/time
  if (eventData.endDate) {
    if (eventData.endTime) {
      // If we have an end time, combine date and time
      const [hours, minutes] = eventData.endTime.split(':');
      const endDate = new Date(eventData.endDate);
      endDate.setHours(parseInt(hours), parseInt(minutes), 0);
      endDateTime = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    } else {
      // If no time, use the date only (all day event)
      endDateTime = eventData.endDate.replace(/-/g, '');
    }
  } else {
    // If no end date, use the start date
    endDateTime = startDateTime;
  }
  
  // Parameters for the Google Calendar URL
  const params = {
    action: 'TEMPLATE',
    text: encodeURIComponent(eventData.title || ''),
    details: encodeURIComponent(eventData.description || ''),
    location: encodeURIComponent(eventData.location || ''),
    dates: `${startDateTime}/${endDateTime}`
  };

  // Build the URL with parameters
  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${baseUrl}?${queryString}`;
};

/**
 * Convenience function to generate a Google Calendar URL for an event
 */
export const addEventToGoogleCalendar = (event) => {
  // Extract time from the event time string if available
  let startTime = null;
  if (event.time) {
    // Assuming time format like "10:00 AM"
    const timeParts = event.time.match(/(\d+):(\d+)\s*([APap][Mm])/);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // Calculate end time (assuming events are 2 hours long if not specified)
  const eventEndDate = event.endDate || event.date;
  
  return generateGoogleCalendarUrl({
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    startDate: event.date || event.startDate,
    endDate: eventEndDate,
    startTime: startTime,
    endTime: startTime ? calculateEndTime(startTime) : null
  });
};

/**
 * Calculate end time based on start time (default: 2 hours later)
 * @param {string} startTime - Start time in 24-hour format (HH:MM)
 * @param {number} durationHours - Duration in hours
 * @returns {string} End time in 24-hour format (HH:MM)
 */
const calculateEndTime = (startTime, durationHours = 2) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  // Create a date object to handle hour/minute calculations
  const date = new Date();
  date.setHours(hours, minutes, 0);
  
  // Add duration hours
  date.setHours(date.getHours() + durationHours);
  
  // Format to HH:MM
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Convenience function to generate a Google Calendar URL for a hackathon
 */
export const addHackathonToGoogleCalendar = (hackathon) => {
  return generateGoogleCalendarUrl({
    title: hackathon.title,
    description: hackathon.description || '',
    location: hackathon.location || '',
    startDate: hackathon.startDate,
    endDate: hackathon.endDate
  });
};