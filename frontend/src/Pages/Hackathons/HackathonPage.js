import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HackathonHub = () => {
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const mockHackathons = [
      {
        id: 1,
        title: "AI Innovation Challenge 2025",
        status: "live",
        startDate: "2025-02-01",
        endDate: "2025-02-03",
        timeLeft: "2 days 14 hours",
        participants: 1250,
        teams: 315,
        prize: "$50,000",
        description: "Build innovative AI solutions that can solve real-world problems.",
        rules: [
          "Teams of 2-4 members",
          "Must use provided API endpoints",
          "Submit working prototype with documentation",
          "Open source code required"
        ],
        techStack: ["Python", "TensorFlow", "React", "Node.js"],
        organizer: "TechCorp Inc.",
        difficulty: "Advanced",
        location: "Virtual",
        submissions: 89
      },
      {
        id: 2,
        title: "Green Tech Hackathon",
        status: "upcoming",
        startDate: "2025-03-15",
        endDate: "2025-03-17",
        timeLeft: "45 days",
        participants: 0,
        teams: 0,
        prize: "$25,000",
        description: "Create sustainable technology solutions for environmental challenges.",
        rules: [
          "Individual or team participation",
          "Focus on sustainability",
          "Working demo required",
          "Present to judges"
        ],
        techStack: ["Any", "IoT", "Mobile", "Web"],
        organizer: "EcoTech Foundation",
        difficulty: "Intermediate",
        location: "San Francisco, CA",
        submissions: 0
      },
      {
        id: 3,
        title: "FinTech Innovation Sprint",
        status: "completed",
        startDate: "2024-12-01",
        endDate: "2024-12-03",
        timeLeft: "Completed",
        participants: 800,
        teams: 200,
        prize: "$30,000",
        description: "Revolutionary financial technology solutions for the future.",
        rules: [
          "Teams of 3-5 members",
          "Financial domain focus",
          "Security compliance required",
          "Business plan submission"
        ],
        techStack: ["Blockchain", "React", "Node.js", "Python"],
        organizer: "FinTech Alliance",
        difficulty: "Advanced",
        location: "New York, NY",
        submissions: 156,
        winner: "CryptoWallet Pro Team"
      }
    ];
    setHackathons(mockHackathons);
  }, []);

  const filteredHackathons = hackathons.filter(hackathon => {
    if (activeTab === 'all') return true;
    return hackathon.status === activeTab;
  });

  const HackathonCard = ({ hackathon }) => (
    <motion.div
      className="hackathon-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hackathon-header">
        <div className="hackathon-status">
          <span className={`status-indicator ${hackathon.status}`}></span>
          <span className="status-text">{hackathon.status.toUpperCase()}</span>
        </div>
        <div className="hackathon-prize">{hackathon.prize}</div>
      </div>

      <h3 className="hackathon-title">{hackathon.title}</h3>
      <p className="hackathon-description">{hackathon.description}</p>

      <div className="hackathon-meta">
        <div className="meta-item">
          <span className="label">Duration:</span>
          <span>{hackathon.startDate} - {hackathon.endDate}</span>
        </div>
        <div className="meta-item">
          <span className="label">Location:</span>
          <span>{hackathon.location}</span>
        </div>
        <div className="meta-item">
          <span className="label">Difficulty:</span>
          <span className={`difficulty ${hackathon.difficulty.toLowerCase()}`}>
            {hackathon.difficulty}
          </span>
        </div>
        <div className="meta-item">
          <span className="label">Organizer:</span>
          <span>{hackathon.organizer}</span>
        </div>
      </div>

      {hackathon.status === 'live' && (
        <div className="live-stats">
          <div className="stat">
            <span className="stat-number">{hackathon.participants}</span>
            <span className="stat-label">Participants</span>
          </div>
          <div className="stat">
            <span className="stat-number">{hackathon.teams}</span>
            <span className="stat-label">Teams</span>
          </div>
          <div className="stat">
            <span className="stat-number">{hackathon.submissions}</span>
            <span className="stat-label">Submissions</span>
          </div>
          <div className="time-left">
            <span className="time-label">Time Left:</span>
            <span className="time-value">{hackathon.timeLeft}</span>
          </div>
        </div>
      )}

      {hackathon.status === 'completed' && hackathon.winner && (
        <div className="winner-announcement">
          <span className="winner-label">🏆 Winner:</span>
          <span className="winner-name">{hackathon.winner}</span>
        </div>
      )}

      <div className="tech-stack">
        <span className="tech-label">Tech Stack:</span>
        <div className="tech-tags">
          {hackathon.techStack.map((tech, index) => (
            <span key={index} className="tech-tag">{tech}</span>
          ))}
        </div>
      </div>

      <div className="hackathon-rules">
        <h4>Rules & Requirements:</h4>
        <ul>
          {hackathon.rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>

      <div className="hackathon-actions">
        {hackathon.status === 'live' && (
          <>
            <button className="btn-primary">Join Now</button>
            <button className="btn-secondary">Submit Project</button>
          </>
        )}
        {hackathon.status === 'upcoming' && (
          <>
            <button className="btn-primary">Register</button>
            <button className="btn-outline">Set Reminder</button>
          </>
        )}
        {hackathon.status === 'completed' && (
          <>
            <button className="btn-secondary">View Results</button>
            <button className="btn-outline">Download Resources</button>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="hackathon-hub">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Hackathon Hub</h1>
          <p>Join virtual and physical hackathons, compete with the best, and win amazing prizes</p>
        </motion.div>

        <div className="hackathon-tabs">
          <button
            className={activeTab === 'live' ? 'active' : ''}
            onClick={() => setActiveTab('live')}
          >
            Live Hackathons
          </button>
          <button
            className={activeTab === 'upcoming' ? 'active' : ''}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={activeTab === 'completed' ? 'active' : ''}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            All Hackathons
          </button>
        </div>

        <div className="hackathon-grid">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="no-hackathons">
            <h3>No hackathons found</h3>
            <p>Check back later for exciting new challenges!</p>
          </div>
        )}

        <div className="hackathon-cta">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h3>Want to organize a hackathon?</h3>
            <p>Contact us to host your own hackathon on Eventra platform</p>
            <button className="btn-primary">Contact Organizers</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HackathonHub;
