export const DRAFT_KEY = "eventra_create_event_draft";
export const DUPLICATED_DRAFT_KEY = "eventra_duplicate_event_draft";
export const CREATION_STEPS = { FORM: "form", PREVIEW: "preview" };

export const categories = [
  { label: "Conference", value: "CONFERENCE" },
  { label: "Workshop", value: "WORKSHOP" },
  { label: "Meetup", value: "MEETUP" },
  { label: "Webinar", value: "WEBINAR" },
  { label: "Social", value: "SOCIAL" },
  { label: "Sports", value: "SPORTS" },
  { label: "Cultural", value: "CULTURAL" },
  { label: "Business", value: "BUSINESS" },
  { label: "Charity", value: "CHARITY" },
  { label: "Other", value: "OTHER" },
];

export const mockAttendees = [
  {
    name: "John Doe",
    email: "john@example.com",
    registrationDate: "2026-08-15",
    ticketType: "VIP",
  },
  {
    name: "Sarah Smith",
    email: "sarah@example.com",
    registrationDate: "2026-08-16",
    ticketType: "General",
  },
  {
    name: "Alex Johnson",
    email: "alex@example.com",
    registrationDate: "2026-08-17",
    ticketType: "Workshop",
  },
];

// 🔥 FIX 1: Global State Mutation Bug
// Exported a factory function to generate fresh default state.
// Passing a static object with nested arrays (tags) to React state causes global mutation bugs.
export const getDefaultFormData = () => ({
  title: "",
  description: "",
  category: "",
  isMultiDay: false,
  date: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  location: {
    name: "",
    address: "",
    coordinates: { latitude: "", longitude: "" },
  },
  isVirtual: false,
  virtualLink: "",
  capacity: "",
  isPublic: true,
  requiresApproval: false,
  registrationStart: "",
  registrationEnd: "",
  tags: [],
  ticketTiers: [
    {
      name: "General Admission",
      price: 0,
      capacity: "",
      description: "Standard event access",
    },
  ],
  banner: null,
  bannerPreview: null,
});

// Legacy fallback for backward compatibility
export const initialFormData = getDefaultFormData();

// 🔥 FIX 2: UTC Off-By-One-Day Bug & Stale Date Bug
// toISOString() returns UTC time, which outputs yesterday's date in Asia/Oceania timezones.
// Also converted to a function so the date evaluates fresh when called, not frozen at app load.
export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Legacy fallback for backward compatibility
export const todayString = getTodayString();