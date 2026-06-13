import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useDebounce from '../hooks/useDebounce.js';
import toast from 'react-hot-toast';
import './components.css';
import { sanitizeInputText } from "../utils/inputSanitization";
import EventMaterials from "./common/EventMaterials";
import { Plus, Search, BriefcaseIcon } from 'lucide-react';
import CollaborativeWhiteboard from './common/CollaborativeWhiteboard';
import { safeJsonParse } from "../utils/safeJsonParse";
import OpportunitiesSection from './collaboration/OpportunitiesSection';
import CollaborationsSection from './collaboration/CollaborationsSection';
import NetworkingSection from './collaboration/NetworkingSection';
import CreateRequestForm from './collaboration/CreateRequestForm';
import OpportunityDetailModal from './collaboration/OpportunityDetailModal';

const safeFormatDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString(undefined, options);
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
    title: '', type: '', description: '', budget: '', deadline: '', skills: ''
  });

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  const [collaborationOpportunities, setCollaborationOpportunities] = useState(() => {
    let saved;
    try {
      saved = localStorage.getItem('eventra_collaboration_opportunities');
    } catch {}
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
      { id: 1, title: "Tech Summit 2025 Partnership", organizer: "TechCorp Inc.", type: "Sponsorship", description: "Looking for event technology partners for our annual tech summit. Great exposure opportunity.", skills: ["Event Management", "Technology", "Marketing"], budget: "$10,000 - $25,000", deadline: "2025-08-15", applicants: 12, status: "open" },
      { id: 2, title: "Design Workshop Collaboration", organizer: "Creative Studios", type: "Content Partnership", description: "Seeking design experts to co-host a series of UX/UI workshops for designers.", skills: ["UX Design", "Teaching", "Workshop Facilitation"], budget: "Revenue Share", deadline: "2025-08-20", applicants: 8, status: "open" },
      { id: 3, title: "Startup Pitch Event", organizer: "Innovation Hub", type: "Venue Partnership", description: "Partner with us to provide venue and networking space for monthly startup pitch events.", skills: ["Venue Management", "Networking", "Startup Ecosystem"], budget: "$5,000 - $8,000", deadline: "2025-08-10", applicants: 15, status: "urgent" },
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
    setNewRequest({ title: '', type: '', description: '', budget: '', deadline: '', skills: '' });
    setActiveSection('opportunities');
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicationText.trim()) {
      toast.error('Please enter a proposal message.');
      return;
    }
    toast.success('Your partnership proposal has been submitted successfully!');
    setApplicationText('');
    setProposalFile(null);
    setSelectedOpportunity(null);
  };

  const myCollaborations = [
    { id: 1, title: "AI Conference Series", partner: "DataTech Solutions", status: "active", nextMeeting: "2025-08-05", progress: 75, tasks: ["Finalize speakers", "Marketing campaign", "Venue setup"] },
    { id: 2, title: "Coding Bootcamp", partner: "EduTech Academy", status: "planning", nextMeeting: "2025-08-08", progress: 45, tasks: ["Curriculum design", "Instructor recruitment", "Platform setup"] },
  ];

  const networkingRequests = [
    { id: 1, name: "Sarah Johnson", role: "Event Coordinator", company: "Global Events Ltd.", message: "Hi! I'd love to connect and discuss potential collaboration opportunities.", skills: ["Project Management", "Corporate Events", "International Relations"], avatar: "👩‍💼" },
    { id: 2, name: "Michael Chen", role: "Tech Entrepreneur", company: "StartupLab", message: "Interested in partnering for tech-focused events in the Asia-Pacific region.", skills: ["Technology", "Startups", "Innovation"], avatar: "👨‍💻" },
  ];

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

      <div
        role="tablist"
        aria-label="Collaboration Hub sections"
        className="collaboration-tabs max-w-4xl mx-auto flex gap-2 justify-center mb-10 p-2 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800"
      >
        {[
          { id: 'opportunities', name: 'Opportunities', icon: '🎯' },
          { id: 'my-collaborations', name: 'My Collaborations', icon: '🤝' },
          { id: 'networking', name: 'Networking', icon: '🌐' },
          { id: 'materials', name: 'Shared Materials', icon: '📚' },
          { id: 'whiteboard', name: 'Collaborative Whiteboard', icon: '🎨' },
          { id: 'create-request', name: 'Create Request', icon: '➕' },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeSection === tab.id}
            className={`tab-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            onClick={() => { setActiveSection(tab.id); setSearchQuery(''); }}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className="tab-content"
      >
        {activeSection === 'materials' && (
          <div className="materials-section max-w-4xl mx-auto px-4">
            <EventMaterials materials={mockMaterials} />
          </div>
        )}

        {activeSection === 'whiteboard' && (
          <div className="whiteboard-section max-w-4xl mx-auto px-4">
            <CollaborativeWhiteboard />
          </div>
        )}

        {activeSection === 'opportunities' && (
          <OpportunitiesSection
            filteredOpportunities={filteredOpportunities}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            setSelectedOpportunity={setSelectedOpportunity}
            safeFormatDate={safeFormatDate}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {activeSection === 'my-collaborations' && (
          <CollaborationsSection
            myCollaborations={myCollaborations}
            setActiveSection={setActiveSection}
            safeFormatDate={safeFormatDate}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {activeSection === 'networking' && (
          <NetworkingSection
            filteredNetworking={filteredNetworking}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {activeSection === 'create-request' && (
          <CreateRequestForm
            newRequest={newRequest}
            handleRequestChange={handleRequestChange}
            handleRequestSubmit={handleRequestSubmit}
          />
        )}
      </motion.div>

      <OpportunityDetailModal
        selectedOpportunity={selectedOpportunity}
        setSelectedOpportunity={setSelectedOpportunity}
        applicationText={applicationText}
        setApplicationText={setApplicationText}
        proposalFile={proposalFile}
        setProposalFile={setProposalFile}
        handleApplySubmit={handleApplySubmit}
        safeFormatDate={safeFormatDate}
      />
    </div>
  );
};

export default CollaborationHub;
