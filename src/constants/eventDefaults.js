export const DRAFT_KEY = "eventra_create_event_draft";
export const DUPLICATED_DRAFT_KEY = "eventra_duplicate_event_draft";
export const CREATION_STEPS = { FORM: "form", PREVIEW: "preview" };

export const categories = [
  { id: "CONFERENCE", label: "Conference", value: "CONFERENCE", color: "bg-blue-500" },
  { id: "WORKSHOP", label: "Workshop", value: "WORKSHOP", color: "bg-green-500" },
  { id: "MEETUP", label: "Meetup", value: "MEETUP", color: "bg-purple-500" },
  { id: "WEBINAR", label: "Webinar", value: "WEBINAR", color: "bg-indigo-500" },
  { id: "SOCIAL", label: "Social", value: "SOCIAL", color: "bg-pink-500" },
  { id: "SPORTS", label: "Sports", value: "SPORTS", color: "bg-orange-500" },
  { id: "CULTURAL", label: "Cultural", value: "CULTURAL", color: "bg-teal-500" },
  { id: "BUSINESS", label: "Business", value: "BUSINESS", color: "bg-emerald-500" },
  { id: "CHARITY", label: "Charity", value: "CHARITY", color: "bg-rose-500" },
  { id: "TECH", label: "Tech", value: "TECH", color: "bg-blue-600" },
  { id: "MUSIC", label: "Music", value: "MUSIC", color: "bg-pink-600" },
  { id: "FOOD", label: "Food", value: "FOOD", color: "bg-red-500" },
  { id: "OTHER", label: "Other", value: "OTHER", color: "bg-gray-500" },
];

// Helper function to get category by value
export const getCategoryByValue = (value) => {
  return categories.find(cat => cat.value === value || cat.id === value);
};

// Helper function to get color for a category value
export const getCategoryColor = (categoryValue) => {
  const category = getCategoryByValue(categoryValue);
  return category ? category.color : "bg-gray-500";
};

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

// Factory function - always returns a fresh object so callers never share
// references to nested arrays/objects across form sessions.
export const getInitialFormData = () => ({
  title: "",
  description: "",
  categories: [],
  category: "", // Backward compatibility - keep single category field
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
      id: crypto.randomUUID(),
      name: "General Admission",
      price: 0,
      capacity: "",
      description: "Standard event access",
    },
  ],
  banner: null,
  bannerPreview: null,
  gallery: [],
  galleryPreviews: [],
});

// Backward-compatible factory - each call returns a fresh copy
export const getInitialFormDataSnapshot = () => getInitialFormData();

// Backward-compatible alias - callers use initialFormData()
export const initialFormData = () => getInitialFormData();

// Computed on every call so date validations stay accurate across midnight
// on long-running sessions without a page refresh.
export const getTodayString = () => new Date().toISOString().split("T")[0];

// Backward-compatible alias - callers use todayString()
export const todayString = () => getTodayString();