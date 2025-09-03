import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Community = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start('show');
  }, [controls]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const buttonItem = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    }
  };

  return (
    <section className="relative bg-white py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="text-center mb-20"
        >
          <motion.h2
            variants={item}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            <span className="block">Connect, collaborate, and</span>
            <span className="text-transparent bg-clip-text bg-indigo-600">
              create amazing events together.
            </span>
          </motion.h2>

          <motion.p
            variants={item}
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-10"
          >
            Join our community of event organizers, share best practices, and get support for your events.
          </motion.p>

          <motion.div
            variants={container}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div variants={buttonItem}>
              <a
                href="https://t.me/eventra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Join our Telegram group
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </motion.div>
            <motion.div variants={buttonItem}>
              <a
                href="#discord"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Join Discord
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="bg-indigo-50 rounded-2xl p-8 sm:p-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            show: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.4
              }
            }
          }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to create your first event?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations using Eventra for their events
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Create your profile
            </Link>
            <Link 
              to="/events" 
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Browse hackathons
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Community;
