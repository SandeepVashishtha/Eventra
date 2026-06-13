import CharacterCounter from '../common/CharacterCounter';

const CreateRequestForm = ({ newRequest, handleRequestChange, handleRequestSubmit }) => {
  return (
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
          />
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
          >
            <option value="">Select type</option>
            <option value="Sponsorship">Sponsorship</option>
            <option value="Content Partnership">Content Partnership</option>
            <option value="Venue Partnership">Venue Partnership</option>
            <option value="Technical Support">Technical Support</option>
          </select>
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
            />
            <div className="flex justify-end">
              <CharacterCounter current={newRequest.description.length} max={300} />
            </div>
          </div>
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
            >
              <option value="">Select budget</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000+">$25,000+</option>
              <option value="Revenue Share">Revenue Share</option>
            </select>
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
            />
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
          />
        </div>

        <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all" aria-label="Submit and create collaboration request">
          Create Collaboration Request
        </button>
      </form>
    </div>
  );
};

export default CreateRequestForm;
