import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Hero.css';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';



const Hero = () => {
  const { theme } = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className={`hero ${theme === 'dark' ? 'hero-dark' : 'hero-light'}`} ref={ref}>
      <div className="hero-background">
        <div className="hero-gradient"></div>
      </div>

      <div className="container">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h1 variants={itemVariants} className="hero-title">
            Modern Event Management
            <br />
            <span className="text-gradient">for Communities</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-subtitle">
            Create, manage, and track events with ease. A comprehensive open-source platform
            designed for communities, colleges, and organizations worldwide.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-actions">
            <Link to="/create-event" className="btn-primary hero-btn">
              Create Event
            </Link>
            <a href="#learn-more" className="btn-secondary hero-btn">
              View Demo
             </a>
          </motion.div>
         </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="floating-cards">
            <div className="card card-1">
              <div className="card-header">
                <div className="card-icon">💡</div>
                <span>Innovation</span>
              </div>
            </div>
            <div className="card card-2">
              <div className="card-header">
                <div className="card-icon">🚀</div>
                <span>Launch</span>
              </div>
            </div>
            <div className="card card-3">
              <div className="card-header">
                <div className="card-icon">🏆</div>
                <span>Victory</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
