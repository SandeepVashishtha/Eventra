import StatusBadge from "./common/StatusBadge";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { toast } from 'react-toastify';
import './components.css';
import CharacterCounter from "../../components/common/CharacterCounter";
import { sanitizeInputText } from "../utils/inputSanitization";
import EventMaterials from "./common/EventMaterials";
import { Plus, Search, Check, X, Briefcase as BriefcaseIcon, DollarSign, Calendar, Users, Send } from 'lucide-react';
import CollaborativeWhiteboard from './common/CollaborativeWhiteboard';


const CollaborationHub = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');

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

  const [collaborationOpportunities, setCollaborationOpportunities] = useState(() => {
    let saved;
    try {
      saved = localStorage.getItem('eventra_collaboration_opportunities');
    } catch {
      // localStorage unavailable (private browsing, quota exceeded, etc.)
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && typeof item === 'object');
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
  const query = searchQuery.toLowerCase();

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
    <div className="collaboration-hub bg-gray-50 dark:bg-black min-h-screen pb-12">
      <div className="collaboration-header py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="collaboration-title"
        >
          Collaboration Hub 🤝
        </motion.h1>
        <p className="collaboration-subtitle text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Connect, collaborate, and create amazing events together in a unified network.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="collaboration-tabs max-w-4xl mx-auto flex gap-2 justify-center mb-10 p-2 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
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
            className={`tab-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === tab.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => {
              setActiveSection(tab.id);
              setSearchQuery('');
            }}
          >
            <span>{tab.icon}</span>
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
          <div className="materials-section max-w-4xl mx-auto px-4" style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem" }}>
            <EventMaterials materials={mockMaterials} />
          </div>
        )}

        {activeSection === 'whiteboard' && (
          <div className="whiteboard-section max-w-4xl mx-auto px-4" style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem" }}>
            <CollaborativeWhiteboard />
          </div>
        )}


        {activeSection === 'opportunities' && (
          <div className="opportunities-section">
            <div className="section-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Collaboration Opportunities</h2>
              
              {/* Dynamic Filter buttons */}
              <div className="filter-buttons flex gap-2 flex-wrap">
                {['All', 'Sponsorship', 'Content Partnership', 'Venue Partnership'].map((type) => (
                  <button
                    key={type}
                    className={`filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterType === type 
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by keywords, skills, or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-xs"
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
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="opportunity-details grid grid-cols-2 gap-3 mb-5 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <div className="detail-item">
                      <span className="label block text-[10px] text-slate-400 font-bold uppercase">Budget</span>
                      <span className="value text-xs font-black text-slate-800 dark:text-slate-200">{opportunity.budget}</span>
                    </div>
                    <div className="detail-item text-right">
                      <span className="label block text-[10px] text-slate-400 font-bold uppercase">Deadline</span>
                      <span className="value text-xs font-black text-slate-800 dark:text-slate-200">
                        {/* 🔥 FIX: Replaced raw Date parse */}
                        {safeFormatDate(opportunity.deadline)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="opportunity-actions flex gap-2 pt-2">
                    <button 
                      onClick={() => setSelectedOpportunity(opportunity)}
                      className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all text-center"
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
            <div className="section-header flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Active Collaborations</h2>
              <button 
                onClick={() => setActiveSection('create-request')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={14} />
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
                  <div className="collaboration-header flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{collab.title}</h3>
                    <StatusBadge status={collab.status} />
                  </div>
                  
                  <p className="partner text-xs text-slate-500 dark:text-slate-400 mb-4">🤝 Partner: {collab.partner}</p>
                  
                  <div className="progress-section mb-4">
                    <div className="progress-header flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Progress: {collab.progress}%</span>
                      {/* 🔥 FIX: Replaced raw Date parse */}
                      <span>Next Meeting: {safeFormatDate(collab.nextMeeting, undefined)}</span>
                    </div>
                    <div className="progress-bar w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="progress-fill h-full bg-indigo-650" 
                        style={{ width: `${collab.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="tasks-section mb-5">
                    <strong className="block text-[10px] uppercase text-slate-400 mb-2">Upcoming Tasks:</strong>
                    <ul className="tasks-list space-y-1.5">
                      {collab.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="task-item text-xs text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-indigo-500 rounded-full shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="collaboration-actions flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all" aria-label="button">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all" aria-label="button">
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
            <div className="section-header flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Networking Requests</h2>
            </div>

            {/* Networking Search Bar */}
            <div className="search-bar-container relative mb-8 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by developer name, role, company or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-xs"
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
                      <button className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1" aria-label="button">
                        <Check size={14} /> Accept Connection
                      </button>
                      <button className="px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all" aria-label="button">
                        Message
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
          <div className="create-request-section max-w-2xl mx-auto" role="region" aria-labelledby="form-heading">
            <h2 id="form-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Collaboration Request</h2>
            <form onSubmit={handleRequestSubmit} className="request-form p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="collab-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Title *</label>
                <input 
                  id="collab-title"
                  type="text" 
                  name="title"
                  value={newRequest.title}
                  onChange={handleRequestChange}
                  placeholder="Enter your collaboration project title" 
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
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
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
              
              <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-2">
                  <label htmlFor="collab-budget" className="text-xs font-bold text-slate-700 dark:text-slate-300">Budget Range</label>
                  <select 
                    id="collab-budget"
                    name="budget"
                    value={newRequest.budget}
                    onChange={handleRequestChange}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                  aria-describedby="skills-hint"
                />
                <span id="skills-hint" className="sr-only">Comma separated list of required skills</span>
              </div>
              
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all" aria-label="button">
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
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] z-10"
            >
              <button 
                onClick={() => setSelectedOpportunity(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-[10px] tracking-wider uppercase mb-1.5">
                <BriefcaseIcon size={12} />
                <span>Collaboration Opportunity</span>
              </div>
              
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                {selectedOpportunity.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-4">
                <StatusBadge status={selectedOpportunity.status} />
                <span className="text-xs text-slate-400">By <strong>{selectedOpportunity.organizer}</strong></span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/60 mb-5">
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                  {selectedOpportunity.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl text-center">
                  <DollarSign className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Budget</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOpportunity.budget}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl text-center">
                  <Calendar className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Deadline</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {/* 🔥 FIX: Replaced raw Date parse */}
                    {safeFormatDate(selectedOpportunity.deadline)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl text-center">
                  <Users className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Applicants</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOpportunity.applicants}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Required Core Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {/* 🔥 FIX: Protected map */}
                  {Array.isArray(selectedOpportunity.skills) && selectedOpportunity.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-500/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proposal Submission Form */}
              <form onSubmit={handleApplySubmit} className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-indigo-500" />
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Attach Pitch Deck / Document (Optional)</label>
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      onChange={(e) => setProposalFile(e.target.files[0] ? e.target.files[0].name : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
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
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                   aria-label="button">
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