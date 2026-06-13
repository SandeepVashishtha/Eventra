import { motion, AnimatePresence } from 'framer-motion';
import { X, BriefcaseIcon, DollarSign, Calendar, Users, Send } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const OpportunityDetailModal = ({
  selectedOpportunity,
  setSelectedOpportunity,
  applicationText,
  setApplicationText,
  proposalFile,
  setProposalFile,
  handleApplySubmit,
  safeFormatDate,
}) => {
  return (
    <AnimatePresence>
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOpportunity(null)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] z-10"
          >
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-[10px] tracking-wider uppercase mb-1.5">
              <BriefcaseIcon size={12} />
              <span>Collaboration Opportunity</span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
              {selectedOpportunity.title}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={selectedOpportunity.status} />
              <span className="text-xs text-slate-400">By <strong>{selectedOpportunity.organizer}</strong></span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/60 mb-5">
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                {selectedOpportunity.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl text-center">
                <DollarSign className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <span className="block text-[9px] uppercase font-bold text-slate-400">Budget</span>
                <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOpportunity.budget}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl text-center">
                <Calendar className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <span className="block text-[9px] uppercase font-bold text-slate-400">Deadline</span>
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {safeFormatDate(selectedOpportunity.deadline)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl text-center">
                <Users className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <span className="block text-[9px] uppercase font-bold text-slate-400">Applicants</span>
                <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOpportunity.applicants}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Required Core Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedOpportunity.skills) && selectedOpportunity.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-500/10">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-500" />
                <span>Submit Partnership Proposal</span>
              </h4>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="proposal-message" className="text-[10px] font-bold text-slate-400 uppercase">Your Pitch / Proposal Message *</label>
                <textarea
                  id="proposal-message"
                  rows="3"
                  value={applicationText}
                  onChange={(e) => setApplicationText(e.target.value)}
                  placeholder="Briefly pitch your team, event management experience, and why you are the perfect partner..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Attach Pitch Deck / Document (Optional)</label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setProposalFile(e.target.files[0] ? e.target.files[0].name : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {proposalFile ? `Attached: ${proposalFile}` : "Drag and drop or click to upload PDF/PPTX"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OpportunityDetailModal;
