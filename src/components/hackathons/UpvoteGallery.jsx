import React, { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import ProjectCard from "./ProjectCard";
import "./upvote-gallery.css";

export default function UpvoteGallery() {
  const [projects, setProjects] = useState([
    { id: 1, title: "ZKP Anonymous Feedback Engine", votes: 42, tech: ["React", "Spring Boot"], description: "Zero knowledge proof submission validation loops." },
    { id: 2, title: "Low-Bandwidth Assets Proxy", votes: 35, tech: ["Service Worker", "Cache"], description: "Aggressive offline-first caching for busy festivals." },
    { id: 3, title: "Seat Reservation Realtime Designer", votes: 28, tech: ["WebRTC", "Canvas"], description: "Drag and drop seating layout configurations." }
  ]);

  const handleVote = (id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
  };

  const sortedProjects = [...projects].sort((a, b) => b.votes - a.votes);

  return (
    <div className="upvote-gallery-container p-6 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-yellow-500 w-5 h-5" />
            Hackathon Submission Gallery
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review community submissions and cast your votes live</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onVote={() => handleVote(project.id)} />
        ))}
      </div>
    </div>
  );
}
