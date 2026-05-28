export const DRAFT_KEY = "eventra_create_event_draft";

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

export const initialFormData = {
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
};

export const todayString = new Date().toISOString().split("T")[0];