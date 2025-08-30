import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// This is the main ProjectGallery component which manages state and renders the cards.
const ProjectGallery = () => {
  const [projects, setProjects] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Using useEffect to simulate fetching project data on component mount.
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        title: "AI-Powered Task Manager",
        description: "Smart task management app that uses AI to prioritize and schedule tasks automatically. Features natural language processing and intelligent deadline suggestions.",
        author: "Sarah Chen",
        contributors: ["Mike Johnson", "Alex Rodriguez"],
        stars: 234,
        forks: 67,
        category: "AI/ML",
        techStack: ["React", "Python", "TensorFlow", "Node.js"],
        githubUrl: "https://github.com/sarahchen/ai-task-manager",
        liveDemo: "https://ai-taskmanager-demo.com",
        image: "https://placehold.co/400x200/5C6BC0/FFFFFF?text=AI+Task+Manager",
        createdAt: "2025-01-15",
        lastUpdated: "2025-01-28",
        status: "Active",
        difficulty: "Intermediate",
        openIssues: 8,
        pullRequests: 3
      },
      {
        id: 2,
        title: "Blockchain Voting System",
        description: "Decentralized voting platform ensuring transparency and security. Built with smart contracts and modern web technologies.",
        author: "David Kim",
        contributors: ["Lisa Wang", "Tom Anderson", "Maria Garcia"],
        stars: 189,
        forks: 45,
        category: "Blockchain",
        techStack: ["Solidity", "React", "Web3.js", "Hardhat"],
        githubUrl: "https://github.com/davidkim/blockchain-voting",
        liveDemo: "https://blockchain-vote-demo.com",
        image: "https://placehold.co/400x200/42A5F5/FFFFFF?text=Blockchain+Voting",
        createdAt: "2024-12-20",
        lastUpdated: "2025-01-25",
        status: "Active",
        difficulty: "Advanced",
        openIssues: 12,
        pullRequests: 7
      },
      {
        id: 3,
        title: "Climate Data Visualizer",
        description: "Interactive dashboard for visualizing climate change data with real-time updates and predictive analytics.",
        author: "Emma Thompson",
        contributors: ["John Smith", "Ana Rodrigues"],
        stars: 156,
        forks: 34,
        category: "Data Science",
        techStack: ["Python", "D3.js", "Django", "PostgreSQL"],
        githubUrl: "https://github.com/emmathompson/climate-viz",
        liveDemo: "https://climate-data-viz.com",
        image: "https://placehold.co/400x200/66BB6A/FFFFFF?text=Climate+Data+Viz",
        createdAt: "2024-11-10",
        lastUpdated: "2025-01-20",
        status: "Active",
        difficulty: "Intermediate",
        openIssues: 5,
        pullRequests: 2
      },
      {
        id: 4,
        title: "Real-time Chat Application",
        description: "Modern chat application with end-to-end encryption, file sharing, and video calling capabilities.",
        author: "Alex Rodriguez",
        contributors: ["Sophie Martin", "James Wilson"],
        stars: 312,
        forks: 89,
        category: "Web Development",
        techStack: ["Socket.io", "React", "Node.js", "MongoDB"],
        githubUrl: "https://github.com/alexrodriguez/realtime-chat",
        liveDemo: "https://secure-chat-demo.com",
        image: "https://placehold.co/400x200/9575CD/FFFFFF?text=Chat+App",
        createdAt: "2024-10-05",
        lastUpdated: "2025-01-30",
        status: "Active",
        difficulty: "Beginner",
        openIssues: 3,
        pullRequests: 1
      },
      {
        id: 5,
        title: "IoT Smart Garden Monitor",
        description: "IoT solution for monitoring garden conditions with automated watering and mobile notifications.",
        author: "Roberto Silva",
        contributors: ["Linda Zhang"],
        stars: 98,
        forks: 23,
        category: "IoT",
        techStack: ["Arduino", "React Native", "Firebase", "C++"],
        githubUrl: "https://github.com/robertosilva/smart-garden",
        liveDemo: null,
        image: "https://placehold.co/400x200/E57373/FFFFFF?text=IoT+Garden",
        createdAt: "2024-09-15",
        lastUpdated: "2024-12-10",
        status: "Maintenance",
        difficulty: "Advanced",
        openIssues: 15,
        pullRequests: 0
      }
    ];
    setProjects(mockProjects);
  }, []);

  const categories = ['all', 'AI/ML', 'Blockchain', 'Web Development', 'Data Science', 'IoT', 'Mobile'];

  // Filters and sorts the projects based on the current state.
  const filteredAndSortedProjects = projects
    .filter(project => filterCategory === 'all' || project.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'stars':
          return b.stars - a.stars;
        case 'forks':
          return b.forks - a.forks;
        default:
          return 0;
      }
    });

  // This is the ProjectCard component, now with the original class names but enhanced structure.
  const ProjectCard = ({ project }) => {
    // Bug fix: Filter out the author from the contributors list to avoid duplication.
    const uniqueContributors = project.contributors.filter(
      (contributor) => contributor !== project.author
    );

    return (
      <motion.div
        className="project-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5 }}
      >
        <div className="project-image">
          <img
            src={project.image}
            alt={project.title}
          />
          <div className="project-status">
            <span className={`status-badge ${project.status.toLowerCase()}`}>
              {project.status}
            </span>
          </div>
        </div>

        <div className="project-content">
          <div className="project-header">
            <h3>{project.title}</h3>
            <div className="project-stats">
              <div className="stat">
                <span className="icon">⭐</span>
                <span>{project.stars}</span>
              </div>
              <div className="stat">
                <span className="icon">🍴</span>
                <span>{project.forks}</span>
              </div>
            </div>
          </div>

          <p className="project-description">{project.description}</p>

          {/* This section is a structural enhancement, using existing classes. */}
          <div className="project-meta-badges">
            <span className="category-tag">{project.category}</span>
            <span className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
              {project.difficulty}
            </span>
          </div>

          <div className="project-meta">
            <div className="author">
              <span className="label">By:</span>
              <span className="author-name">{project.author}</span>
            </div>
          </div>

          <div className="tech-stack">
            {project.techStack.map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
          </div>

          <div className="contributors">
            <span className="contributors-label">Contributors:</span>
            <div className="contributor-list">
              {/* Use the filtered uniqueContributors array */}
              {uniqueContributors.length > 0 ? (
                uniqueContributors.map((contributor, index) => (
                  <span key={index} className="contributor">{contributor}</span>
                ))
              ) : (
                <span className="contributor">No other contributors yet</span>
              )}
            </div>
          </div>

          <div className="project-activity">
            <div className="activity-item">
              <span className="icon">🔄</span>
              <span>Updated {project.lastUpdated}</span>
            </div>
            <div className="activity-item">
              <span className="icon">🐛</span>
              <span>{project.openIssues} open issues</span>
            </div>
            <div className="activity-item">
              <span className="icon">📥</span>
              <span>{project.pullRequests} pull requests</span>
            </div>
          </div>

          <div className="project-actions">
            <button
              className="btn-primary"
              onClick={() => window.open(project.githubUrl, '_blank')}
            >
              View on GitHub
            </button>
            {project.liveDemo && (
              <button
                className="btn-secondary"
                onClick={() => window.open(project.liveDemo, '_blank')}
              >
                Live Demo
              </button>
            )}
            <button className="btn-outline">⭐ Star</button>
            <button className="btn-outline">🍴 Fork</button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="project-gallery">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Project Gallery</h1>
          <p>Discover, contribute to, and showcase amazing open-source projects</p>
        </motion.div>

        <div className="gallery-controls">
          <div className="filter-section">
            <label>Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-section">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Recently Updated</option>
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
            </select>
          </div>

          <button className="btn-primary submit-project">
            Submit Your Project
          </button>
        </div>

        <div className="projects-grid">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredAndSortedProjects.length === 0 && (
          <div className="no-projects">
            <h3>No projects found</h3>
            <p>Try adjusting your filters or be the first to submit a project in this category!</p>
          </div>
        )}

        <div className="contribution-cta">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h3>Ready to contribute?</h3>
            <p>Join our community of developers and start contributing to open-source projects today!</p>
            <div className="cta-actions">
              <button className="btn-primary">Submit Project</button>
              <button className="btn-secondary">Browse Issues</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectGallery;
