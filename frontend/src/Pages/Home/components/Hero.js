import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const controls = useAnimation();

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
        delay: 0.3
      }
    }
  };

  useEffect(() => {
    controls.start('show');
  }, [controls]);

  return (
    <section
      className="relative overflow-hidden bg-indigo-50/80 py-20 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="text-center"
        >
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            <span className="block">Discover & Join</span>
            <span className="text-transparent bg-clip-text bg-indigo-600">
              Amazing Tech Events
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10"
          >
            Connect with developers, learn new skills, and grow your network at the best tech events,
            hackathons, and workshops in your area.
          </motion.p>

          <motion.div
            variants={container}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div variants={buttonItem}>
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Explore Events
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
            <motion.div variants={buttonItem}>
              <Link
                to="/hackathons"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Join Hackathons
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12"
          >
            <div className="flex items-center justify-center space-x-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 20}.jpg`}
                    alt="User avatar"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">
                  Join <span className="font-medium text-indigo-600">1000+</span> developers
                </p>
                <p className="text-xs text-gray-500">Already registered for our events</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div
        className="hidden lg:block absolute top-24 right-0 -mr-48 -mt-8 opacity-70"
      >
        <svg
          className="h-96 w-96 text-indigo-100"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <path d="M100,20c44.2,0,80,35.8,80,80s-35.8,80-80,80s-80-35.8-80-80S55.8,20,100,20z M100,30c-38.7,0-70,31.3-70,70s31.3,70,70,70s70-31.3,70-70S138.7,30,100,30z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;