import React, { useState } from "react";
import { UserCheck, Filter, Search } from "lucide-react";
import ProfileCard from "./ProfileCard";
import "./matchmaking.css";

export default function MatchmakingHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

  const [profiles, setProfiles] = useState([
    { id: 1, name: "Siddharth Sharma", skills: ["React", "UI/UX", "Tailwind"], role: "Frontend Dev", experience: "Intermediate" },
    { id: 2, name: "Prerna Gupta", skills: ["Spring Boot", "PostgreSQL", "Docker"], role: "Backend Dev", experience: "Advanced" },
    { id: 3, name: "Rohan Das", skills: ["Figma", "Adobe XD", "Wireframing"], role: "Product Designer", experience: "Beginner" },
    { id: 4, name: "Ananya Sen", skills: ["React Native", "Firebase", "Redux"], role: "Mobile Engineer", experience: "Advanced" }
  ]);

  const handleInvite = (id) => {
    alert(`Invite sent to ${profiles.find((p) => p.id === id).name}!`);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkill === "All" || profile.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="matchmaking-hub-container p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-5xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-indigo-600 dark:text-indigo-400 w-7 h-7" />
            Hackathon Matchmaking Hub
          </h2>
          <p className="text-sm text-slate-500 mt-1">Connect with compatible teammates based on skills and roles</p>
        </div>
      </div>

      <div className="search-filters-bar flex flex-wrap items-center gap-4 bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl mb-6 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Skills</option>
            <option value="React">React</option>
            <option value="Spring Boot">Spring Boot</option>
            <option value="Figma">Figma</option>
            <option value="Tailwind">Tailwind</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium">No matching profiles found.</div>
        ) : (
          filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} onInvite={() => handleInvite(profile.id)} />
          ))
        )}
      </div>
    </div>
  );
}
