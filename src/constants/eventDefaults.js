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

// Factory function — always returns a fresh object so callers never share
// references to nested arrays/objects across form sessions.
export const getInitialFormData = () => ({
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

// Backward-compatible alias for existing callers — each access returns a new copy
export const initialFormData = getInitialFormData();

// Computed on every call so date validations stay accurate across midnight
// on long-running sessions without a page refresh.
export const getTodayString = () => new Date().toISOString().split("T")[0];

// Backward-compatible alias — evaluates fresh on access via getter
export const todayString = getTodayString();