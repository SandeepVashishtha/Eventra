import { motion } from 'framer-motion';
import { Search, Check, MessageCircle } from 'lucide-react';

const NetworkingSection = ({
  filteredNetworking,
  searchQuery,
  setSearchQuery,
  prefersReducedMotion,
}) => {
  return (
    <div className="networking-section">
      <div className="section-header flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Networking Requests</h2>
      </div>

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
                <button className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1" aria-label={`Accept connection request from ${request.name}`}>
                  <Check size={14} aria-hidden="true" /> Accept
                </button>
                <button className="px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all" aria-label={`Send message to ${request.name}`}>
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
  );
};

export default NetworkingSection;
