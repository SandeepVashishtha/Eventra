import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Features.css';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';


const Features = () => {
  const { theme } = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const features = [
    {
      icon: "�",
      title: "Event Management",
      description: "Create one-off or recurring events, set capacities, ticket tiers, and registration windows. Complete control over your event lifecycle.",
      cta: "Create Event",
      highlight: true
    },
    {
      icon: "�",
      title: "RSVP & Attendees",
      description: "Public/Private RSVP management, waiting-list automation, real-time attendee counts and seamless registration experience.",
      cta: "Manage Attendees",
      highlight: false
    },
    {
      icon: "📱",
      title: "QR Check-in System",
      description: "QR-code generation, mobile scan interface, offline fallback list. Streamlined check-in process for any event size.",
      cta: "Try Check-in",
      highlight: true
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Role-aware analytics for organizers, volunteers, and admins. Real-time insights and post-event feedback collection.",
      cta: "View Analytics",
      highlight: false
    }
  ];

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
    <section className={`features section-padding ${theme === 'dark' ? 'dark-theme' : ''}`} ref={ref}>
      <div className="container">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="features-title">
            Complete Event Management <span className="text-gradient">Solution</span>.
          </h2>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`feature-card ${feature.highlight ? 'feature-highlight' : ''}`}
              variants={itemVariants}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>

              {feature.cta === 'Create Event' ? (
                <Link to="/create-event" className="feature-cta">
                  {feature.cta}
                  <span className="cta-arrow">→</span>
                </Link>
              ) : (
                <button
                  className="feature-cta"
                  onClick={() => console.log(feature.cta)}
                >
                  {feature.cta}
                  <span className="cta-arrow">→</span>
                </button>
              )}

            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
