import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const OpportunitiesSection = ({
  filteredOpportunities,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  setSelectedOpportunity,
  safeFormatDate,
  prefersReducedMotion,
}) => {
  return (
    <div className="opportunities-section">
      <div className="section-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Collaboration Opportunities</h2>
        <div className="filter-buttons flex gap-2 flex-wrap">
          {['All', 'Sponsorship', 'Content Partnership', 'Venue Partnership'].map((type) => (
            <button
              key={type}
              aria-pressed={filterType === type}
              aria-label={`Filter by ${type}`}
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
                {Array.isArray(opportunity.skills) && opportunity.skills.map((skill) => (
                  <span key={`${skill}-${index}`} className="skill-tag">{skill}</span>
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
                  {safeFormatDate(opportunity.deadline)}
                </span>
              </div>
            </div>

            <div className="opportunity-actions flex gap-2 pt-2">
              <button
                onClick={() => setSelectedOpportunity(opportunity)}
                aria-label={`Apply now for ${opportunity.title}`}
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
  );
};

export default OpportunitiesSection;
