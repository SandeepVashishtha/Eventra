import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import QAPanel from '../../components/events/QAPanel';
import LivePollPanel from '../../components/events/LivePollPanel';
import QuizPanel from '../../components/events/QuizPanel';

/**
 * Minimal Live Interaction Hub.
 * Provides three tabs: Q&A, Polls, Quizzes.
 * Uses existing Tailwind classes and Framer Motion for smooth transitions.
 */
const LiveInteractionHub = () => {
  const tabs = ['Q&A', 'Polls', 'Quizzes'];
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6">
      <div className="mx-auto max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex p-2 space-x-2">
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none ${selected ? 'bg-indigo-600' : 'bg-white/20 hover:bg-white/30'}`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6">
            <AnimatePresence exitBeforeEnter>
              {selectedIndex === 0 && (
                <motion.div
                  key="qa"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QAPanel />
                </motion.div>
              )}
              {selectedIndex === 1 && (
                <motion.div
                  key="poll"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LivePollPanel poll={{ question: 'Sample poll?', options: [{ id: 1, text: 'Option A', votes: 0 }, { id: 2, text: 'Option B', votes: 0 }], duration: 60 }} onVote={() => {}} />
                </motion.div>
              )}
              {selectedIndex === 2 && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuizPanel quiz={{ questions: [{ id: 1, text: 'Sample question?', options: [{ id: 'a', text: 'Ans A' }, { id: 'b', text: 'Ans B' }], correctOptionId: 'a' }] }} onComplete={() => {}} />
                </motion.div>
              )}
            </AnimatePresence>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default LiveInteractionHub;
