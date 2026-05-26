import React, { useState } from "react";

const TeamMatchmaking = () => {
  const [showForm, setShowForm] = useState(false);

  const [teamRequests, setTeamRequests] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    hackathon: "",
    role: "",
    level: "Beginner",
    contact: "",
    idea: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.hackathon ||
      !formData.role
    ) {
      return;
    }

    const newRequest = {
      ...formData,
      id: Date.now(),
    };

    setTeamRequests([newRequest, ...teamRequests]);

    setFormData({
      name: "",
      hackathon: "",
      role: "",
      level: "Beginner",
      contact: "",
      idea: "",
    });

    setShowForm(false);
  };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">

        {/* TOP SECTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm">

          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-3">
            🤝 Team Matchmaking
          </span>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            Find Your Perfect Hackathon Team
          </h2>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-3 max-w-3xl leading-relaxed">
            Connect with developers, designers, AI engineers,
            and open-source contributors for upcoming hackathons.
          </p>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            {showForm ? "Close Form" : "Find Teammates"}
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="mt-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
              Create Team Request
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-4"
            >

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                name="hackathon"
                value={formData.hackathon}
                onChange={handleChange}
                placeholder="Hackathon Name"
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Looking For (Frontend, UI/UX...)"
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="LinkedIn / GitHub URL"
                className="md:col-span-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                name="idea"
                value={formData.idea}
                onChange={handleChange}
                placeholder="Project Idea..."
                rows="3"
                className="md:col-span-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="md:col-span-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
              >
                Submit Team Request
              </button>

            </form>
          </div>
        )}

        {/* USER POSTS */}
        {teamRequests.length > 0 && (
          <div className="mt-8">

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Community Team Requests
              </h3>

              <span className="text-sm text-slate-500">
                {teamRequests.length} Requests
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {teamRequests.map((team) => (
                <div
                  key={team.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >

                  <div className="flex items-center justify-between mb-3">

                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      {team.level}
                    </span>

                    <span className="text-xs text-slate-500">
                      {team.hackathon}
                    </span>

                  </div>

                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {team.name}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Looking for: {team.role}
                  </p>

                  <p className="text-sm text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                    {team.idea}
                  </p>

                  <a
                    href={team.contact}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline"
                  >
                    Contact →
                  </a>

                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default TeamMatchmaking;