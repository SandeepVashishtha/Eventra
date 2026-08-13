export const organizers = [
  {
    id: 1,
    name: "Organizer 1",
    email: "organizer1@example.com",
    verified: true,
  },
  {
    id: 2,
    name: "Organizer 2",
    email: "organizer2@example.com",
    verified: false,
  },
  {
    id: 3,
    name: "Organizer 3",
    email: "organizer3@example.com",
    verified: true,
  },
  {
    id: 4,
    name: "Organizer 4",
    email: "organizer4@example.com",
    verified: false,
  },
  {
    id: 5,
    name: "Organizer 5",
    email: "organizer5@example.com",
    verified: true,
  },
  {
    id: 6,
    name: "Organizer 6",
    email: "organizer6@example.com",
    verified: false,
  },
  {
    id: 7,
    name: "Organizer 7",
    email: "organizer7@example.com",
    verified: true,
  },
  {
    id: 8,
    name: "Organizer 8",
    email: "organizer8@example.com",
    verified: false,
  },
  {
    id: 9,
    name: "Organizer 9",
    email: "organizer9@example.com",
    verified: true,
  },
  {
    id: 10,
    name: "Organizer 10",
    email: "organizer10@example.com",
    verified: false,
  },
  {
    id: 11,
    name: "Organizer 11",
    email: "organizer11@example.com",
    verified: true,
  },
  {
    id: 12,
    name: "Organizer 12",
    email: "organizer12@example.com",
    verified: false,
  },
  {
    id: 13,
    name: "Organizer 13",
    email: "organizer13@example.com",
    verified: true,
  },
  {
    id: 14,
    name: "Organizer 14",
    email: "organizer14@example.com",
    verified: false,
  },
  {
    id: 15,
    name: "Organizer 15",
    email: "organizer15@example.com",
    verified: true,
  },
];

export const events = [
  {
    id: 1,
    title: "Tech Summit 1",
    organizerId: 1,
    capacity: 100,
    status: "published",
  },
  {
    id: 2,
    title: "Tech Summit 2",
    organizerId: 2,
    capacity: 200,
    status: "published",
  },
  {
    id: 3,
    title: "Tech Summit 3",
    organizerId: 3,
    capacity: 300,
    status: "draft",
  },
  {
    id: 4,
    title: "Tech Summit 4",
    organizerId: 4,
    capacity: 400,
    status: "published",
  },
  {
    id: 5,
    title: "Tech Summit 5",
    organizerId: 5,
    capacity: 500,
    status: "cancelled",
  },
  {
    id: 6,
    title: "Tech Summit 6",
    organizerId: 6,
    capacity: 600,
    status: "published",
  },
  {
    id: 7,
    title: "Tech Summit 7",
    organizerId: 7,
    capacity: 700,
    status: "published",
  },
  {
    id: 8,
    title: "Tech Summit 8",
    organizerId: 8,
    capacity: 800,
    status: "draft",
  },
  {
    id: 9,
    title: "Tech Summit 9",
    organizerId: 9,
    capacity: 900,
    status: "published",
  },
  {
    id: 10,
    title: "Tech Summit 10",
    organizerId: 10,
    capacity: 1000,
    status: "published",
  },
];

export const attendees = [
  {
    id: 1,
    name: "Attendee 1",
    email: "attendee1@example.com",
  },
  {
    id: 2,
    name: "Attendee 2",
    email: "attendee2@example.com",
  },
  {
    id: 3,
    name: "Attendee 3",
    email: "attendee3@example.com",
  },
  {
    id: 4,
    name: "Attendee 4",
    email: "attendee4@example.com",
  },
  {
    id: 5,
    name: "Attendee 5",
    email: "attendee5@example.com",
  },
  {
    id: 6,
    name: "Attendee 6",
    email: "attendee6@example.com",
  },
  {
    id: 7,
    name: "Attendee 7",
    email: "attendee7@example.com",
  },
  {
    id: 8,
    name: "Attendee 8",
    email: "attendee8@example.com",
  },
  {
    id: 9,
    name: "Attendee 9",
    email: "attendee9@example.com",
  },
  {
    id: 10,
    name: "Attendee 10",
    email: "attendee10@example.com",
  },
];

export const registrations = [
  {
    id: 1,
    eventId: 1,
    attendeeId: 1,
    status: "confirmed",
  },
  {
    id: 2,
    eventId: 2,
    attendeeId: 2,
    status: "pending",
  },
  {
    id: 3,
    eventId: 3,
    attendeeId: 3,
    status: "confirmed",
  },
  {
    id: 4,
    eventId: 4,
    attendeeId: 4,
    status: "cancelled",
  },
  {
    id: 5,
    eventId: 5,
    attendeeId: 5,
    status: "confirmed",
  },
  {
    id: 6,
    eventId: 6,
    attendeeId: 6,
    status: "pending",
  },
  {
    id: 7,
    eventId: 7,
    attendeeId: 7,
    status: "confirmed",
  },
  {
    id: 8,
    eventId: 8,
    attendeeId: 8,
    status: "confirmed",
  },
  {
    id: 9,
    eventId: 9,
    attendeeId: 9,
    status: "pending",
  },
  {
    id: 10,
    eventId: 10,
    attendeeId: 10,
    status: "confirmed",
  },
];

export const sponsors = [
  {
    id: 1,
    name: "Sponsor 1",
    tier: "Gold",
  },
  {
    id: 2,
    name: "Sponsor 2",
    tier: "Silver",
  },
  {
    id: 3,
    name: "Sponsor 3",
    tier: "Bronze",
  },
  {
    id: 4,
    name: "Sponsor 4",
    tier: "Gold",
  },
  {
    id: 5,
    name: "Sponsor 5",
    tier: "Silver",
  },
];

export const hackathons = [
  {
    id: 1,
    title: "Hackathon 1",
    prizePool: 10000,
  },
  {
    id: 2,
    title: "Hackathon 2",
    prizePool: 15000,
  },
  {
    id: 3,
    title: "Hackathon 3",
    prizePool: 20000,
  },
];

export const feedbackRecords = [
  {
    id: 1,
    eventId: 1,
    rating: 5,
    comment: "Excellent event",
  },
  {
    id: 2,
    eventId: 2,
    rating: 4,
    comment: "Very informative",
  },
  {
    id: 3,
    eventId: 3,
    rating: 5,
    comment: "Amazing speakers",
  },
  {
    id: 4,
    eventId: 4,
    rating: 3,
    comment: "Could be improved",
  },
  {
    id: 5,
    eventId: 5,
    rating: 5,
    comment: "Outstanding experience",
  },
];