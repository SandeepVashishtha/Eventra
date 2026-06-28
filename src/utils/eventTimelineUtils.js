// Helper to generate chronological timeline events for a given event
export const getTimelineEvents = (eventTitle) => {
  return [
    { id: 1, t: -24.0, type: "registration", title: "Attendee Registered", desc: "Alice Chen registered for the event (Early Bird)", ticket: "Early Bird", user: "Alice Chen" },
    { id: 2, t: -22.5, type: "registration", title: "Attendee Registered", desc: "Bob Smith registered for the event (General)", ticket: "General Admission", user: "Bob Smith" },
    { id: 3, t: -20.0, type: "registration", title: "Attendee Registered", desc: "Charlie Davis registered for the event (VIP)", ticket: "VIP", user: "Charlie Davis" },
    { id: 4, t: -18.0, type: "registration", title: "Attendee Registered", desc: "David Lee registered for the event (General)", ticket: "General Admission", user: "David Lee" },
    { id: 5, t: -15.5, type: "registration", title: "Attendee Registered", desc: "Emma Watson registered for the event (Early Bird)", ticket: "Early Bird", user: "Emma Watson" },
    { id: 6, t: -12.0, type: "registration", title: "Attendee Registered", desc: "Frank Miller registered for the event (General)", ticket: "General Admission", user: "Frank Miller" },
    { id: 7, t: -9.5, type: "registration", title: "Attendee Registered", desc: "Grace Hopper registered for the event (VIP)", ticket: "VIP", user: "Grace Hopper" },
    { id: 8, t: -6.0, type: "registration", title: "Attendee Registered", desc: "Henry Cavill registered for the event (General)", ticket: "General Admission", user: "Henry Cavill" },
    { id: 9, t: -4.0, type: "registration", title: "Attendee Registered", desc: "Ivy League registered for the event (General)", ticket: "General Admission", user: "Ivy League" },
    { id: 10, t: -2.0, type: "registration", title: "Attendee Registered", desc: "Jack Ryan registered for the event (VIP)", ticket: "VIP", user: "Jack Ryan" },
    
    // Check-ins starting slightly before event (T-1h)
    { id: 11, t: -1.0, type: "checkin", title: "Early Check-in", desc: "Alice Chen checked in at the registration desk", user: "Alice Chen" },
    { id: 12, t: -0.8, type: "checkin", title: "Early Check-in", desc: "Emma Watson checked in at the registration desk", user: "Emma Watson" },
    { id: 13, t: -0.5, type: "checkin", title: "Attendee Checked In", desc: "Bob Smith checked in at the registration desk", user: "Bob Smith" },
    { id: 14, t: -0.4, type: "checkin", title: "Attendee Checked In", desc: "Grace Hopper checked in at the registration desk", user: "Grace Hopper" },
    
    // Event Starts (t=0)
    { id: 15, t: 0.0, type: "announcement", title: "Event Live", desc: `Welcome to ${eventTitle}! The venue is now open.` },
    { id: 16, t: 0.1, type: "announcement", title: "Opening Keynote", desc: "Opening Keynote starts in 15 minutes in Main Hall A." },
    { id: 17, t: 0.2, type: "checkin", title: "Attendee Checked In", desc: "Charlie Davis checked in at the registration desk", user: "Charlie Davis" },
    { id: 18, t: 0.25, type: "session", title: "Opening Keynote Started", desc: "Session 'Opening Keynote & Future Vision' is now live (Main Hall A)", sessionName: "Opening Keynote & Future Vision", action: "start", venue: "Main Hall A", attendees: 85 },
    { id: 19, t: 0.3, type: "registration", title: "Last Minute Registration", desc: "Kate Beckinsale registered for the event (Last Minute)", ticket: "General Admission", user: "Kate Beckinsale" },
    { id: 20, t: 0.4, type: "checkin", title: "Attendee Checked In", desc: "David Lee checked in at the registration desk", user: "David Lee" },
    { id: 21, t: 0.5, type: "checkin", title: "Attendee Checked In", desc: "Kate Beckinsale checked in at the registration desk", user: "Kate Beckinsale" },
    
    // Keynote ends, Feedback starts
    { id: 22, t: 1.25, type: "session", title: "Opening Keynote Finished", desc: "Session 'Opening Keynote & Future Vision' has concluded", sessionName: "Opening Keynote & Future Vision", action: "end", venue: "Main Hall A" },
    { id: 23, t: 1.3, type: "feedback", title: "Session Feedback Received", desc: "Alice Chen rated 'Opening Keynote': Excellent session! (5/5)", rating: 5, user: "Alice Chen" },
    { id: 24, t: 1.4, type: "feedback", title: "Session Feedback Received", desc: "Bob Smith rated 'Opening Keynote': Inspiring vision and good examples. (4/5)", rating: 4, user: "Bob Smith" },
    
    // Parallel Tracks start (t=1.5)
    { id: 25, t: 1.5, type: "session", title: "Track A Session Started", desc: "Session 'Advanced Deep-Dive' has started (Room 101)", sessionName: "Advanced Deep-Dive", action: "start", venue: "Room 101", attendees: 45 },
    { id: 26, t: 1.5, type: "session", title: "Track B Session Started", desc: "Session 'Design Patterns & Systems' has started (Room 102)", sessionName: "Design Patterns & Systems", action: "start", venue: "Room 102", attendees: 35 },
    { id: 27, t: 1.8, type: "checkin", title: "Late Check-in", desc: "Henry Cavill checked in at the registration desk", user: "Henry Cavill" },
    { id: 28, t: 2.0, type: "announcement", title: "Refreshments Available", desc: "Tea and snacks are served at the cafeteria." },
    
    // Parallel Tracks end, Feedback
    { id: 29, t: 2.5, type: "session", title: "Track A Session Finished", desc: "Session 'Advanced Deep-Dive' has concluded", sessionName: "Advanced Deep-Dive", action: "end", venue: "Room 101" },
    { id: 30, t: 2.5, type: "session", title: "Track B Session Finished", desc: "Session 'Design Patterns & Systems' has concluded", sessionName: "Design Patterns & Systems", action: "end", venue: "Room 102" },
    { id: 31, t: 2.6, type: "feedback", title: "Session Feedback Received", desc: "Charlie Davis rated 'Advanced Deep-Dive': Very technical, loved the code. (5/5)", rating: 5, user: "Charlie Davis" },
    { id: 32, t: 2.7, type: "feedback", title: "Session Feedback Received", desc: "David Lee rated 'Design Patterns': Clean slides and layout logic. (4/5)", rating: 4, user: "David Lee" },
    
    // Lunch break announcement (t=3.0)
    { id: 33, t: 3.0, type: "announcement", title: "Lunch Break", desc: "Buffet lunch is now open in the Dining Hall. Network and enjoy!" },
    { id: 34, t: 3.5, type: "checkin", title: "Late Check-in", desc: "Frank Miller checked in at the registration desk", user: "Frank Miller" },
    
    // Afternoon sessions start (t=4.0)
    { id: 35, t: 4.0, type: "announcement", title: "Sessions Resuming", desc: "Afternoon sessions starting in 5 minutes." },
    { id: 36, t: 4.25, type: "session", title: "Track A Session Started", desc: "Session 'AI Integration' has started (Room 101)", sessionName: "AI Integration", action: "start", venue: "Room 101", attendees: 50 },
    { id: 37, t: 4.25, type: "session", title: "Track B Session Started", desc: "Session 'Testing & Performance' has started (Room 102)", sessionName: "Testing & Performance", action: "start", venue: "Room 102", attendees: 30 },
    
    // Sessions end
    { id: 38, t: 5.25, type: "session", title: "Track A Session Finished", desc: "Session 'AI Integration' has concluded", sessionName: "AI Integration", action: "end", venue: "Room 101" },
    { id: 39, t: 5.25, type: "session", title: "Track B Session Finished", desc: "Session 'Testing & Performance' has concluded", sessionName: "Testing & Performance", action: "end", venue: "Room 102" },
    { id: 40, t: 5.4, type: "feedback", title: "Session Feedback Received", desc: "Emma Watson rated 'AI Integration': Incredibly informative. (5/5)", rating: 5, user: "Emma Watson" },
    { id: 41, t: 5.5, type: "feedback", title: "Session Feedback Received", desc: "Frank Miller rated 'Testing & Performance': Very practical examples. (4/5)", rating: 4, user: "Frank Miller" },
    
    // Final Panel Discussion (t=6.0)
    { id: 42, t: 5.8, type: "announcement", title: "Closing Panel", desc: "Don't miss the Future of Tech Panel in the Main Hall in 10 minutes." },
    { id: 43, t: 6.0, type: "session", title: "Panel Discussion Started", desc: "Session 'Panel: Future of Tech' is now live (Main Hall A)", sessionName: "Panel: Future of Tech", action: "start", venue: "Main Hall A", attendees: 90 },
    { id: 44, t: 7.0, type: "session", title: "Panel Discussion Finished", desc: "Session 'Panel: Future of Tech' has concluded", sessionName: "Panel: Future of Tech", action: "end", venue: "Main Hall A" },
    
    // Event Feedback & Conclusion
    { id: 45, t: 7.1, type: "feedback", title: "General Feedback Received", desc: "Grace Hopper rated Event: Outstanding event! (5/5)", rating: 5, user: "Grace Hopper" },
    { id: 46, t: 7.3, type: "announcement", title: "Event Closing", desc: "Thank you for joining us! Please fill out the overall event feedback." },
    { id: 47, t: 7.5, type: "feedback", title: "General Feedback Received", desc: "Jack Ryan rated Event: Well organized, great sessions. (4/5)", rating: 4, user: "Jack Ryan" },
    { id: 48, t: 7.8, type: "feedback", title: "General Feedback Received", desc: "Ivy League rated Event: Learned a lot. (5/5)", rating: 5, user: "Ivy League" },
    { id: 49, t: 8.0, type: "announcement", title: "Event Concluded", desc: `${eventTitle} has officially concluded. See you next time!` }
  ];
};

// Generate Chart Data Points at regular intervals of relativeHours
export const getChartDataPoints = () => {
  return [
    { timeLabel: "Day -1, 10:00 AM", t: -24.0, registrations: 1, checkins: 0 },
    { timeLabel: "Day -1, 02:00 PM", t: -20.0, registrations: 3, checkins: 0 },
    { timeLabel: "Day -1, 06:00 PM", t: -16.0, registrations: 5, checkins: 0 },
    { timeLabel: "Day -1, 10:00 PM", t: -12.0, registrations: 6, checkins: 0 },
    { timeLabel: "Day of, 02:00 AM", t: -8.0, registrations: 8, checkins: 0 },
    { timeLabel: "Day of, 06:00 AM", t: -4.0, registrations: 9, checkins: 0 },
    { timeLabel: "Day of, 08:00 AM", t: -2.0, registrations: 10, checkins: 0 },
    { timeLabel: "Day of, 09:00 AM", t: -1.0, registrations: 10, checkins: 2 },
    { timeLabel: "Day of, 09:30 AM", t: -0.5, registrations: 10, checkins: 4 },
    { timeLabel: "Day of, 10:00 AM", t: 0.0, registrations: 10, checkins: 4 },
    { timeLabel: "Day of, 11:00 AM", t: 1.0, registrations: 11, checkins: 6 },
    { timeLabel: "Day of, 12:00 PM", t: 2.0, registrations: 11, checkins: 7 },
    { timeLabel: "Day of, 01:00 PM", t: 3.0, registrations: 11, checkins: 7 },
    { timeLabel: "Day of, 02:00 PM", t: 4.0, registrations: 11, checkins: 8 },
    { timeLabel: "Day of, 03:00 PM", t: 5.0, registrations: 11, checkins: 8 },
    { timeLabel: "Day of, 04:00 PM", t: 6.0, registrations: 11, checkins: 8 },
    { timeLabel: "Day of, 05:00 PM", t: 7.0, registrations: 11, checkins: 8 },
    { timeLabel: "Day of, 06:00 PM", t: 8.0, registrations: 11, checkins: 8 }
  ];
};

// Convert Slider Value (0 to 100) to Relative Hours (-24 to +8)
export const sliderToHours = (val) => {
  return -24 + 32 * (val / 100);
};

// Helper to format simulated timestamp
export const getFormattedSimTime = (relativeHours, eventDate, eventTime) => {
  const [year, month, day] = eventDate.split("-").map(Number);
  // Parse time like "10:00 AM"
  const [timeStr, modifier] = eventTime.split(" ");
  let [hours, minutes] = timeStr.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const baseDate = new Date(year, month - 1, day, hours, minutes, 0);
  const simDate = new Date(baseDate.getTime() + relativeHours * 60 * 60 * 1000);

  return simDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};
