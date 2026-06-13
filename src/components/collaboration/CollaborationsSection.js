import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const CollaborationsSection = ({
  myCollaborations,
  setActiveSection,
  safeFormatDate,
  prefersReducedMotion,
}) => {
  return (
    <div className="my-collaborations-section">
      <div className="section-header flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Active Collaborations</h2>
        <button
          onClick={() => setActiveSection('create-request')}
          aria-label="Create a new collaboration request"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <Plus size={14} aria-hidden="true" />
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
                <span>Next Meeting: {safeFormatDate(collab.nextMeeting)}</span>
              </div>
              <div className="progress-bar w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full bg-indigo-650"
                  style={{ width: `${collab.progress}%` }}
                />
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
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all" aria-label={`View details for ${collab.title}`}>
                View Details
              </button>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all" aria-label={`Schedule a meeting for ${collab.title}`}>
                Schedule Meeting
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CollaborationsSection;
