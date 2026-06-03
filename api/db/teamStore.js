// api/db/teamStore.js

export const teamTasks = [
  { id: "tk-1", text: "Create Vite React boilerplate with Tailwind CSS", done: true },
  { id: "tk-2", text: "Design database schemas (PostgreSQL & Prisma)", done: true },
  { id: "tk-3", text: "Implement live collaborative whiteboard component", done: false },
  {
    id: "tk-4",
    text: "Hook up server-sent events for real-time team synchronization",
    done: false,
  },
];

export const teamPins = [
  {
    id: "pin-1",
    text: "Opening ceremony keynotes start tomorrow morning at 09:00 AM! Be there on Discord.",
    tag: "Organizers",
    time: "2 hours ago",
  },
  {
    id: "pin-2",
    text: "GitHub repository submission deadline is locked for Sunday 11:59 PM. No late commits accepted.",
    tag: "Rules",
    time: "4 hours ago",
  },
  {
    id: "pin-3",
    text: "Mentors are available in the support queue for routing assistance in React, Node, and AWS.",
    tag: "Mentors",
    time: "1 day ago",
  },
];

export const teamChatHistory = [
  {
    id: 1,
    sender: "Alex Rivera",
    text: "Just pushed the initial database schema to main! Let me know if you run into migration issues.",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "Sophia Chen",
    text: "Awesome! I am updating the Figma prototype for our landing layout. I'll drop notes on the whiteboard.",
    time: "10:32 AM",
  },
];

export const sseClients = new Set();
