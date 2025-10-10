import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import './faq.css';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  Zap,
  Shield,
  MessageCircle,
  BookOpen,
  Rocket,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import FAQCTA from "./FaqCTA";

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const controls = useAnimation();

  const faqData = [
    {
      id: 1,
      category: "Getting Started",
      icon: <Rocket className="w-5 h-5" />,
      question: "How do I register for a hackathon or event?",
      answer: "Registering for events on Eventra is simple! Browse available events on our Events or Hackathons pages, click on the event you're interested in, and click the 'Register' or 'Join Event' button. You'll need to create an account if you don't have one. Follow the registration prompts, provide any required information, and you're all set! You'll receive a confirmation email with event details and check-in instructions."
    },
    {
      id: 2,
      category: "Event Creation",
      icon: <Calendar className="w-5 h-5" />,
      question: "How can I create and host my own event on Eventra?",
      answer: "Creating your own event is easy! Sign up for an account, navigate to your dashboard, and click 'Create Event' or 'Host Event'. Choose your event type (workshop, hackathon, conference, etc.), fill in the event details like title, description, date, location, and capacity. You can customize registration requirements, add team collaboration features, and set up check-in options. Once published, your event will be visible to the community and you'll have access to management tools and analytics."
    },
    {
      id: 3,
      category: "Event Types",
      icon: <BookOpen className="w-5 h-5" />,
      question: "What is the difference between a workshop and a hackathon?",
      answer: "Workshops are typically educational or skill-building sessions focused on learning specific topics, tools, or techniques. They're usually shorter (a few hours to a full day) and more structured. Hackathons are competitive coding events where participants work in teams to build projects within a limited timeframe (usually 24-48 hours). Hackathons emphasize innovation, collaboration, and rapid prototyping, often with prizes and judging involved."
    },
    {
      id: 4,
      category: "Pricing",
      icon: <Zap className="w-5 h-5" />,
      question: "Is it free to participate in or create an event?",
      answer: "Yes! Eventra is an open-source platform that's completely free to use for both participants and event organizers. You can join events, create your own events, and access most features without any cost. Some premium features for large-scale events or enterprise users may have associated costs, but the core platform remains free for communities, educational institutions, and individual organizers."
    },
    {
      id: 5,
      category: "Community",
      icon: <Users className="w-5 h-5" />,
      question: "How do the community links (Discord, Telegram, etc.) work?",
      answer: "Our community links connect you to various chat platforms where Eventra users gather to discuss events, share opportunities, network, and collaborate. These external communities are managed by volunteers and provide spaces for ongoing conversations beyond individual events. You can join these communities to stay updated on upcoming events, find team members for hackathons, get help with the platform, and connect with like-minded people in your area or field of interest."
    },
    {
      id: 6,
      category: "Account Management",
      icon: <Shield className="w-5 h-5" />,
      question: "How do I edit my profile and manage my account?",
      answer: "After logging in, click on your profile picture in the top navigation bar and select 'Edit Profile' or access your 'Dashboard'. From there, you can update your personal information, profile picture, bio, interests, and notification preferences. You can also view your event history, manage your created events, and track your participation in the community leaderboard."
    },
    {
      id: 7,
      category: "Technical Support",
      icon: <MessageCircle className="w-5 h-5" />,
      question: "What should I do if I encounter technical issues?",
      answer: "If you experience technical problems, first try refreshing your browser or clearing your cache. For persistent issues, you can contact our support team through the Contact page, join our community Discord for real-time help from other users, or check our documentation page for troubleshooting guides. Since we're open-source, you can also report bugs or request features on our GitHub repository."
    },
    {
      id: 8,
      category: "Event Features",
      icon: <Globe className="w-5 h-5" />,
      question: "Can I host virtual or hybrid events?",
      answer: "Absolutely! Eventra supports in-person, virtual, and hybrid events. When creating an event, you can specify the format and add relevant details like meeting links, platform requirements, or special instructions for virtual attendees. Our platform handles registration and check-ins for all event types, making it easy to manage diverse event formats."
    },
    {
      id: 9,
      category: "Event Management",
      icon: <Calendar className="w-5 h-5" />,
      question: "How do I manage attendees and check-ins?",
      answer: "Event organizers have access to a comprehensive dashboard with attendee management tools. You can view registration lists, send announcements to participants, generate QR codes for quick check-ins, track attendance in real-time, and export attendee data. The platform also provides analytics on registration patterns, no-shows, and engagement metrics to help you improve future events."
    },
    {
      id: 10,
      category: "Privacy & Security",
      icon: <Shield className="w-5 h-5" />,
      question: "How is my personal data protected?",
      answer: "We take privacy and security seriously. Eventra follows industry-standard security practices including data encryption, secure user authentication, and GDPR compliance. Your personal information is only used for platform functionality and event coordination. We never sell user data to third parties. You can review our full privacy policy for detailed information about data handling and your rights as a user."
    }
  ];

  const categories = [...new Set(faqData.map(faq => faq.category))];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  useEffect(() => {
    // Retain Framer Motion for hero entrance (above the fold)
    controls.start("show");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [controls]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section 
        className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden"
        // AOS Implementation on Hero (in addition to Framer Motion for immediate load)
        data-aos="fade-down"
        data-aos-once="true"
        data-aos-duration="1000"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={container}
            initial="hidden"
            animate={controls}
            className="text-center"
          >
            <motion.div variants={item} className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-6 question-icon">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                  Questions
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Everything you need to know about using Eventra, from getting started 
                to hosting your own events. Can't find what you're looking for? 
                Reach out to our community!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        className="py-20 bg-gray-50 dark:bg-gray-900"
        // AOS Implementation
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-offset="150"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            // Removing Framer Motion scroll-related animation on this main list
            // variants={container}
            // initial="hidden"
            // animate={controls}
            className="space-y-6"
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={faq.id}
                // Removing Framer Motion item animation
                // variants={item}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                // AOS Implementation on individual FAQs
                data-aos="zoom-in-up"
                data-aos-delay={index * 100}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-2xl transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {faq.icon}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                          {faq.category}
                        </span>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mt-1">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {openFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
                
                {openFAQ === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6"
                  >
                    <div className="ml-16 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
      <FAQCTA></FAQCTA>
    </div>
  );
};

export default FAQPage;