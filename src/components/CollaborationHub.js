import StatusBadge from "./common/StatusBadge";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useDebounce from '../hooks/useDebounce.js';
import { toast } from 'react-toastify';
import './components.css';
import CharacterCounter from "../../components/common/CharacterCounter";
import { sanitizeInputText } from "../utils/inputSanitization";
import EventMaterials from "./common/EventMaterials";
import { Plus, Search, Check, X, Briefcase as BriefcaseIcon, DollarSign, Calendar, Users, Send, MessageCircle } from 'lucide-react';
import CollaborativeWhiteboard from './common/CollaborativeWhiteboard';
import { safeJsonParse } from "../utils/safeJsonParse";


const CollaborationHub = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const mockMaterials = [
    { id: 'slides-1', title: 'Tech Summit 2025 Keynote Presentation', type: 'ppt', size: '14.2 MB', url: '#' },
    { id: 'code-1', title: 'Collaboration Hub Prototype Core Source', type: 'doc', size: '42.5 MB', url: '#' },
    { id: 'deps-1', title: 'Hackathon Node Modules Pre-packaged Bundle', type: 'pdf', size: '84.1 MB', url: '#' }
  ];
  const [filterType, setFilterType] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicationText, setApplicationText] = useState('');
  const [proposalFile, setProposalFile] = useState(null);

  const [newRequest, setNewRequest] = useState({
    title: '',
    type: '',
    description: '',
    budget: '',
    deadline: '',
    skills: ''
  });

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  const OPPORTUNITY_SCHEMA = {
    id: "number", title: "string", organizer: "string", type: "string",
    description: "string", skills: "array", budget: "string",
    deadline: "string", applicants: "number", status: "string",
  };

  const validateOpportunity = (item) => {
    if (!item || typeof item !== "object") return null;
    const valid = {};
    for (const [key, type] of Object.entries(OPPORTUNITY_SCHEMA)) {
      const val = item[key];
      if (val === undefined || val === null) continue;
      if (type === "number") { valid[key] = Number(val); if (isNaN(valid[key])) valid[key] = 0; }
      else if (type === "array") { valid[key] = Array.isArray(val) ? val : []; }
      else if (type === "string") { valid[key] = String(val); }
      else { valid[key] = val; }
    }
    return valid;
  };

  const [collaborationOpportunities, setCollaborationOpportunities] = useState(() => {
    let saved;
    try {
      saved = localStorage.getItem('eventra_collaboration_opportunities');
    } catch {
      // localStorage unavailable (private browsing, quota exceeded, etc.)
    }
    if (saved) {
      try {
        const parsed = safeJsonParse(saved, {});
        if (Array.isArray(parsed)) {
          return parsed.map(validateOpportunity).filter(Boolean);
        }
      } catch (e) {
        console.error("Failed to parse collaboration opportunities from localStorage", e);
      }
    }
    return [
      {
        id: 1,
        title: "Tech Summit 2025 Partnership",
        organizer: "TechCorp Inc.",
        type: "Sponsorship",
        description: "Looking for event technology partners for our annual tech summit. Great exposure opportunity.",
        skills: ["Event Management", "Technology", "Marketing"],
        budget: "$10,000 - $25,000",
        deadline: "2025-08-15",
        applicants: 12,
        status: "open"
      },
      {
        id: 2,
        title: "Design Workshop Collaboration",
        organizer: "Creative Studios",
        type: "Content Partnership",
        description: "Seeking design experts to co-host a series of UX/UI workshops for designers.",
        skills: ["UX Design", "Teaching", "Workshop Facilitation"],
        budget: "Revenue Share",
        deadline: "2025-08-20",
        applicants: 8,
        status: "open"
      },
      {
        id: 3,
        title: "Startup Pitch Event",
        organizer: "Innovation Hub",
        type: "Venue Partnership",
        description: "Partner with us to provide venue and networking space for monthly startup pitch events.",
        skills: ["Venue Management", "Networking", "Startup Ecosystem"],
        budget: "$5,000 - $8,000",
        deadline: "2025-08-10",
        applicants: 15,
        status: "urgent"
      }
    ];
  });

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.type || !newRequest.description.trim()) {
      toast.error('Please fill in all required fields (Title, Type, and Description)');
      return;
    }

    const sanitizedTitle = sanitizeInputText(newRequest.title);
    const sanitizedDescription = sanitizeInputText(newRequest.description);
    const sanitizedBudget = newRequest.budget ? sanitizeInputText(newRequest.budget) : "Not Specified";

    const skillsArray = newRequest.skills
      ? newRequest.skills.split(',').map(s => sanitizeInputText(s)).filter(s => s.length > 0)
      : [];

    const newOpp = {
      id: Date.now(),
      title: sanitizedTitle,
      organizer: "You (Organizer)",
      type: newRequest.type,
      description: sanitizedDescription,
      skills: skillsArray,
      budget: sanitizedBudget,
      deadline: newRequest.deadline || new Date().toISOString().split('T')[0],
      applicants: 0,
      status: "open"
    };

    const updatedOpportunities = [newOpp, ...collaborationOpportunities];
    setCollaborationOpportunities(updatedOpportunities);
    localStorage.setItem('eventra_collaboration_opportunities', JSON.stringify(updatedOpportunities));

    toast.success('Collaboration request created successfully!');
    setNewRequest({
      title: '',
      type: '',
      description: '',
      budget: '',
      deadline: '',
      skills: ''
    });
    setActiveSection('opportunities');
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicationText.trim()) {
      toast.error('Please enter a proposal message.');
      return;
    }

    // Sanitize user proposal pitch text
    toast.success('Your partnership proposal has been submitted successfully!');
    setApplicationText('');
    setProposalFile(null);
    setSelectedOpportunity(null);
  };

  const myCollaborations = [
    {
      id: 1,
      title: "AI Conference Series",
      partner: "DataTech Solutions",
      status: "active",
      nextMeeting: "2025-08-05",
      progress: 75,
      tasks: ["Finalize speakers", "Marketing campaign", "Venue setup"]
    },
    {
      id: 2,
      title: "Coding Bootcamp",
      partner: "EduTech Academy",
      status: "planning",
      nextMeeting: "2025-08-08",
      progress: 45,
      tasks: ["Curriculum design", "Instructor recruitment", "Platform setup"]
    }
  ];

  const networkingRequests = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Event Coordinator",
      company: "Global Events Ltd.",
      message: "Hi! I'd love to connect and discuss potential collaboration opportunities.",
      skills: ["Project Management", "Corporate Events", "International Relations"],
      avatar: "👩‍💼"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Tech Entrepreneur",
      company: "StartupLab",
      message: "Interested in partnering for tech-focused events in the Asia-Pacific region.",
      skills: ["Technology", "Startups", "Innovation"],
      avatar: "👨‍💻"
    }
  ];

  // 🔥 FIX: Added safe date formatter to prevent RangeError crashes
  const safeFormatDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString(undefined, options);
  };

  // Filtering opportunities dynamically
  const query = debouncedSearchQuery.toLowerCase();

  const filteredOpportunities = collaborationOpportunities.filter((opp) => {
    const matchesSearch =
      (opp.title?.toLowerCase() || "").includes(query) ||
      (opp.description?.toLowerCase() || "").includes(query) ||
      (opp.organizer?.toLowerCase() || "").includes(query) ||
      (Array.isArray(opp.skills) && opp.skills.some(skill => skill?.toLowerCase().includes(query)));

    const matchesType = filterType === 'All' || opp.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filtering networking requests dynamically
  const filteredNetworking = networkingRequests.filter((req) => {
    return (
      (req.name?.toLowerCase() || "").includes(query) ||
      (req.role?.toLowerCase() || "").includes(query) ||
      (req.company?.toLowerCase() || "").includes(query) ||
      (Array.isArray(req.skills) && req.skills.some(skill => skill?.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="collaboration-hub min-h-screen bg-gray-50 pb-12 dark:bg-black">
      <div className="collaboration-header py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="collaboration-title"
        >
          Collaboration Hub 🤝
        </motion.h1>
        <p className="collaboration-subtitle mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
          Connect, collaborate, and create amazing events together in a unified network.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Collaboration Hub sections"
        className="collaboration-tabs mx-auto mb-10 flex max-w-4xl justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-900/60"
      >
        {[
          { id: 'opportunities', name: 'Opportunities', icon: '🎯' },
          { id: 'my-collaborations', name: 'My Collaborations', icon: '🤝' },
          { id: 'networking', name: 'Networking', icon: '🌐' },
          { id: 'materials', name: 'Shared Materials', icon: '📚' },
          { id: 'whiteboard', name: 'Collaborative Whiteboard', icon: '🎨' },
          { id: 'create-request', name: 'Create Request', icon: '➕' }

        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeSection === tab.id}
            aria-label={`${tab.name} section`}
            className={`tab-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            onClick={() => {
              setActiveSection(tab.id);
              setSearchQuery('');
            }}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className="tab-content"
      >
        {activeSection === 'materials' && (
          <div className="materials-section mx-auto max-w-4xl px-4" style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem" }}>
            <EventMaterials materials={mockMaterials} />
          </div>
        )}

        {activeSection === 'whiteboard' && (
          <div className="whiteboard-section mx-auto max-w-4xl px-4" style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem" }}>
            <CollaborativeWhiteboard />
          </div>
        )}


        {activeSection === 'opportunities' && (
          <div className="opportunities-section">
            <div className="section-header mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Collaboration Opportunities</h2>

              {/* Dynamic Filter buttons */}
              <div className="filter-buttons flex flex-wrap gap-2">
                {['All', 'Sponsorship', 'Content Partnership', 'Venue Partnership'].map((type) => (
                  <button
                    key={type}
                    aria-pressed={filterType === type}
                    aria-label={`Filter by ${type}`}
                    title={`Filter by ${type}`}
                    className={`filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type
                        ? 'bg-indigo-650 dark:bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-300'
                      }`}
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Search Bar */}
            <div className="search-bar-container relative mb-8 max-w-lg">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by keywords, skills, or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs text-slate-900 transition-colors outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="opportunities-grid">
              {filteredOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
                  className="opportunity-card"
                >
                  <div className="opportunity-header">
                    <h3 className="opportunity-title">{opportunity.title}</h3>

                    <StatusBadge status={opportunity.status} />

                  </div>

                  <div className="opportunity-meta">
                    <span className="organizer">🏢 {opportunity.organizer}</span>
                    <span className="type">📋 {opportunity.type}</span>
                  </div>

                  <p className="opportunity-description">{opportunity.description}</p>

                  <div className="opportunity-skills">
                    <strong>Required Skills:</strong>
                    <div className="skills-tags">
                      {/* 🔥 FIX: Protected map */}
                      {Array.isArray(opportunity.skills) && opportunity.skills.map((skill) => (
                        <span key={`${skill}-${index}`} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="opportunity-details mb-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                    <div className="detail-item">
                      <span className="label block text-[10px] font-bold text-slate-400 uppercase">Budget</span>
                      <span className="value text-xs font-black text-slate-800 dark:text-slate-200">{opportunity.budget}</span>
                    </div>
                    <div className="detail-item text-right">
                      <span className="label block text-[10px] font-bold text-slate-400 uppercase">Deadline</span>
                      <span className="value text-xs font-black text-slate-800 dark:text-slate-200">
                        {/* 🔥 FIX: Replaced raw Date parse */}
                        {safeFormatDate(opportunity.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className="opportunity-actions flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedOpportunity(opportunity)}
                      aria-label={`Apply now for ${opportunity.title}`}
                      title={`Apply now for ${opportunity.title}`}
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-center text-xs font-bold text-white transition-all hover:bg-indigo-700"
                    >
                      Apply Now
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredOpportunities.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
                  No opportunities match your filter or search query.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'my-collaborations' && (
          <div className="my-collaborations-section">
            <div className="section-header mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Active Collaborations</h2>
              <button
                onClick={() => setActiveSection('create-request')}
                aria-label="Create a new collaboration request"
                title="Create a new collaboration request"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Plus size={14} aria-hidden="true" />
                New Collaboration
              </button>
            </div>

            <div className="collaborations-list space-y-4">
              {myCollaborations.map((collab, index) => (
                <motion.div
                  key={collab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
                  className="collaboration-card"
                >
                  <div className="collaboration-header mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{collab.title}</h3>
                    <StatusBadge status={collab.status} />
                  </div>

                  <p className="partner mb-4 text-xs text-slate-500 dark:text-slate-400">🤝 Partner: {collab.partner}</p>

                  <div className="progress-section mb-4">
                    <div className="progress-header mb-1.5 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Progress: {collab.progress}%</span>
                      {/* 🔥 FIX: Replaced raw Date parse */}
                      <span>Next Meeting: {safeFormatDate(collab.nextMeeting, undefined)}</span>
                    </div>
                    <div className="progress-bar h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="progress-fill bg-indigo-650 h-full"
                        style={{ width: `${collab.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="tasks-section mb-5">
                    <strong className="mb-2 block text-[10px] text-slate-400 uppercase">Upcoming Tasks:</strong>
                    <ul className="tasks-list space-y-1.5">
                      {collab.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="task-item text-slate-650 dark:text-slate-350 flex items-center gap-1.5 text-xs">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="collaboration-actions flex gap-2">
                    <button className="text-slate-850 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200" aria-label={`View details for ${collab.title}`} title={`View details for ${collab.title}`}>
                      View Details
                    </button>
                    <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Schedule a meeting for ${collab.title}`} title={`Schedule a meeting for ${collab.title}`}>
                      Schedule Meeting
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'networking' && (
          <div className="networking-section">
            <div className="section-header mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Networking Requests</h2>
            </div>

            {/* Networking Search Bar */}
            <div className="search-bar-container relative mb-8 max-w-lg">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by developer name, role, company or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs text-slate-900 transition-colors outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="networking-requests">
              {filteredNetworking.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
                  className="networking-card"
                >
                  <div className="networking-header">
                    <div className="profile-info">
                      <span className="avatar">{request.avatar}</span>
                      <div className="name-role">
                        <h3>{request.name}</h3>
                        <p>{request.role} at {request.company}</p>
                      </div>
                    </div>

                    <div className="networking-actions flex gap-2">
                      <button className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700" aria-label={`Accept connection request from ${request.name}`} title={`Accept connection request from ${request.name}`}>
                        <Check size={14} aria-hidden="true" /> Accept Connection
                      </button>
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Send message to ${request.name}`} title={`Send message to ${request.name}`}>
                        <MessageCircle size={14} aria-hidden="true" /> Message
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredNetworking.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
                  No networking matches found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'create-request' && (
          <div className="create-request-section mx-auto max-w-2xl" role="region" aria-labelledby="form-heading">
            <h2 id="form-heading" className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Create Collaboration Request</h2>
            <form onSubmit={handleRequestSubmit} className="request-form space-y-5 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="collab-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Title *</label>
                <input
                  id="collab-title"
                  type="text"
                  name="title"
                  value={newRequest.title}
                  onChange={handleRequestChange}
                  placeholder="Enter your collaboration project title"
                  className="dark:bg-slate-955 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                  required
                  aria-required="true"
                  aria-invalid={newRequest.title.trim() === '' ? "true" : "false"}
                  aria-describedby="title-hint"
                />
                <span id="title-hint" className="sr-only">Please enter a descriptive title for your project</span>
              </div>

              <div className="form-group flex flex-col gap-2">
                <label htmlFor="collab-type" className="text-xs font-bold text-slate-700 dark:text-slate-300">Collaboration Type *</label>
                <select
                  id="collab-type"
                  name="type"
                  value={newRequest.type}
                  onChange={handleRequestChange}
                  className="dark:bg-slate-955 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                  required
                  aria-required="true"
                  aria-invalid={newRequest.type === '' ? "true" : "false"}
                  aria-describedby="type-hint"
                >
                  <option value="">Select type</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Content Partnership">Content Partnership</option>
                  <option value="Venue Partnership">Venue Partnership</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
                <span id="type-hint" className="sr-only">Select the type of collaboration partnership</span>
              </div>

              <div className="form-group flex flex-col gap-2">
                <label htmlFor="collab-desc" className="text-xs font-bold text-slate-700 dark:text-slate-300">Description *</label>
                <div className="space-y-2">
                  <textarea
                    id="collab-desc"
                    name="description"
                    value={newRequest.description}
                    onChange={handleRequestChange}
                    rows="4"
                    maxLength={300}
                    placeholder="Describe partnership goals / Sponsorship details / Collaboration ideas..."
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    aria-required="true"
                    aria-invalid={newRequest.description.trim() === '' ? "true" : "false"}
                    aria-describedby="desc-hint"
                  ></textarea>
                  <div className="flex justify-end">
                    <CharacterCounter
                      current={newRequest.description.length}
                      max={300}
                    />
                  </div>
                </div>
                <span id="desc-hint" className="sr-only">Provide context and objectives of the collaboration. Maximum 300 characters.</span>
              </div>

              <div className="form-row grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group flex flex-col gap-2">
                  <label htmlFor="collab-budget" className="text-xs font-bold text-slate-700 dark:text-slate-300">Budget Range</label>
                  <select
                    id="collab-budget"
                    name="budget"
                    value={newRequest.budget}
                    onChange={handleRequestChange}
                    className="dark:bg-slate-955 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                    aria-describedby="budget-hint"
                  >
                    <option value="">Select budget</option>
                    <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000+">$25,000+</option>
                    <option value="Revenue Share">Revenue Share</option>
                  </select>
                  <span id="budget-hint" className="sr-only">Select the financial budget range if applicable</span>
                </div>

                <div className="form-group flex flex-col gap-2">
                  <label htmlFor="collab-deadline" className="text-xs font-bold text-slate-700 dark:text-slate-300">Deadline</label>
                  <input
                    id="collab-deadline"
                    type="date"
                    name="deadline"
                    value={newRequest.deadline}
                    onChange={handleRequestChange}
                    className="dark:bg-slate-955 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                    aria-describedby="deadline-hint"
                  />
                  <span id="deadline-hint" className="sr-only">Select target completion date</span>
                </div>
              </div>

              <div className="form-group flex flex-col gap-2">
                <label htmlFor="collab-skills" className="text-xs font-bold text-slate-700 dark:text-slate-300">Required Skills</label>
                <input
                  id="collab-skills"
                  type="text"
                  name="skills"
                  value={newRequest.skills}
                  onChange={handleRequestChange}
                  placeholder="e.g., Event Management, Marketing, Design"
                  className="dark:bg-slate-955 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                  aria-describedby="skills-hint"
                />
                <span id="skills-hint" className="sr-only">Comma separated list of required skills</span>
              </div>

              <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700" aria-label="Submit and create collaboration request">
                Create Collaboration Request
              </button>
            </form>
          </div>
        )}
      </motion.div>

      {/* Interactive Detail & Proposal Application Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOpportunity(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                onClick={() => setSelectedOpportunity(null)}
                title="Close"
                className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={16} aria-hidden="true" />
              </button>

              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-indigo-500 uppercase">
                <BriefcaseIcon size={12} />
                <span>Collaboration Opportunity</span>
              </div>

              <h2 className="mb-2 text-xl leading-snug font-extrabold text-slate-900 dark:text-white">
                {selectedOpportunity.title}
              </h2>

              <div className="mb-4 flex items-center gap-2">
                <StatusBadge status={selectedOpportunity.status} />
                <span className="text-xs text-slate-400">By <strong>{selectedOpportunity.organizer}</strong></span>
              </div>

              <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
                <p className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed">
                  {selectedOpportunity.description}
                </p>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-950/30">
                  <DollarSign className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Budget</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOpportunity.budget}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-950/30">
                  <Calendar className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Deadline</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {/* 🔥 FIX: Replaced raw Date parse */}
                    {safeFormatDate(selectedOpportunity.deadline)}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-950/30">
                  <Users className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Applicants</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOpportunity.applicants}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">Required Core Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {/* 🔥 FIX: Protected map */}
                  {Array.isArray(selectedOpportunity.skills) && selectedOpportunity.skills.map((skill, index) => (
                    <span key={`${skill}-${index}`} className="rounded-full border border-indigo-500/10 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proposal Submission Form */}
              <form onSubmit={handleApplySubmit} className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800/80">
                <h4 className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                  <Send className="h-4 w-4 text-indigo-500" />
                  <span>Submit Partnership Proposal</span>
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="proposal-message" className="text-[10px] font-bold text-slate-400 uppercase">Your Pitch / Proposal Message *</label>
                  <textarea
                    id="proposal-message"
                    rows="3"
                    value={applicationText}
                    onChange={(e) => setApplicationText(e.target.value)}
                    placeholder="Briefly pitch your team, event management experience, and why you are the perfect partner..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Attach Pitch Deck / Document (Optional)</label>
                  <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-4 text-center transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/40">
                    <input
                      type="file"
                      onChange={(e) => setProposalFile(e.target.files[0] ? e.target.files[0].name : null)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {proposalFile ? `Attached: ${proposalFile}` : "Drag and drop or click to upload PDF/PPTX"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOpportunity(null)}
                    aria-label="Cancel and close proposal form"
                    className="dark:text-slate-350 flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    aria-label="Submit partnership proposal"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationHub;