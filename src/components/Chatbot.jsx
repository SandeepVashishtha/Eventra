import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  Calendar,
  Trophy,
  Code,
  Users,
  Star,
  Heart,
  Clock,
  TrendingUp
} from "lucide-react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Hey there! 👋 I'm Eventra's AI assistant. I can help you find events, answer questions about hackathons, or guide you through the platform. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !showVideoSection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, showVideoSection]);

  const toggleChat = () => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
        setShowVideoSection(false);
      }, 400);
    } else {
      setIsOpen(true);
      setShowVideoSection(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => console.log("Video autoplay prevented:", err));
          }
        }, 100);
      }, 50);
    }
  };

  const handleStartChat = () => {
    setShowVideoSection(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleVideoEnd = () => {
    setShowVideoSection(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const getAIResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("event") || lowerMessage.includes("what events")) {
      return "We have amazing tech events happening regularly! You can explore our Events page to see upcoming workshops, meetups, and conferences. Would you like me to help you find events in a specific category or location?";
    }

    if (lowerMessage.includes("hackathon")) {
      return "Hackathons are one of our most popular offerings! We host various hackathons throughout the year where developers collaborate on innovative projects. Check out our Hackathons page to see upcoming competitions, prizes, and themes. Want to know more about how to participate?";
    }

    if (lowerMessage.includes("project") || lowerMessage.includes("showcase")) {
      return "Our Project Gallery showcases incredible work from our community! You can browse projects built by fellow developers, get inspired, and even submit your own projects. Visit the Projects page to explore or contribute!";
    }

    if (lowerMessage.includes("sign up") || lowerMessage.includes("register") || lowerMessage.includes("join")) {
      return "Getting started is easy! Click on the 'Sign Up' button in the navigation to create your account. Once registered, you'll be able to register for events, participate in hackathons, and join our vibrant community!";
    }

    if (lowerMessage.includes("leaderboard") || lowerMessage.includes("ranking") || lowerMessage.includes("top")) {
      return "Our Community Leaderboard recognizes the most active and impactful contributors! Participate in events, hackathons, and contribute to projects to climb the ranks. Check out the Leaderboard page to see where you stand!";
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("support") || lowerMessage.includes("help")) {
      return "Need assistance? You can reach out through our Contact page or check the Help Center for FAQs. Our team is here to help you with any questions about events, registrations, or platform features!";
    }

    if (lowerMessage.includes("about") || lowerMessage.includes("what is eventra")) {
      return "Eventra is a modern event management platform designed for developers and tech communities! We connect builders through events, hackathons, and workshops. With 1500+ developers and 75+ events organized, we're building the future of tech community engagement!";
    }

    if (lowerMessage.includes("feedback") || lowerMessage.includes("review")) {
      return "We love hearing from our community! You can share your feedback using the Feedback button (floating on the right) or visit our Feedback page. Your insights help us improve the platform for everyone!";
    }

    if (lowerMessage.includes("docs") || lowerMessage.includes("documentation") || lowerMessage.includes("api")) {
      return "Looking for technical documentation? Check out our Documentation page for detailed guides, API references, and integration tutorials. Perfect for developers who want to build on top of Eventra!";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! Great to see you here! 😊 I'm here to help you navigate Eventra and find exactly what you're looking for. What would you like to know about?";
    }

    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return "You're very welcome! If you have any other questions about Eventra, events, or hackathons, feel free to ask. I'm here to help! 🚀";
    }

    if (lowerMessage.includes("how to") || lowerMessage.includes("navigate") || lowerMessage.includes("use")) {
      return "Navigating Eventra is simple! Use the top navigation menu to explore Events, Hackathons, and Projects. You can search for specific content using the search bar on the homepage. Need help with something specific?";
    }

    if (lowerMessage.includes("sponsor") || lowerMessage.includes("partner")) {
      return "We're proud to work with 30+ amazing partners and sponsors who help make our events possible! If you're interested in sponsorship opportunities or partnerships, visit our Contact page to get in touch with our team.";
    }

    return "That's an interesting question! While I'm still learning, I'd recommend exploring our platform to find what you need. You can browse Events, Hackathons, or Projects, or check out our Help Center for more information. Is there something specific I can help you find?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const aiResponse = await getAIResponse(inputValue);

    setIsTyping(false);

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const trendingEvents = [
    { name: "AI Workshop", emoji: "🤖", attendees: "2.5K" },
    { name: "Web3 Summit", emoji: "⛓️", attendees: "1.8K" },
    { name: "React Meetup", emoji: "⚛️", attendees: "3.2K" },
    { name: "DevOps Day", emoji: "🚀", attendees: "1.5K" }
  ];

  const quickActions = [
    { label: "Find Events", query: "Show me upcoming events" },
    { label: "Join Hackathons", query: "How do I join a hackathon?" },
    { label: "Submit Project", query: "How can I submit my project?" },
    { label: "Get Help", query: "I need help with something" },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-indigo-500/50 transition-all duration-300"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <MessageCircle className="w-7 h-7" />
            </motion.div>
            <motion.span
              className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-2 h-2 text-white" />
            </motion.span>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 opacity-75"
              animate={{ scale: [1, 1.2, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {(isOpen || isAnimating) && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-8 right-8 z-50 w-[95vw] sm:w-[400px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{
              maxHeight: 'min(700px, calc(100vh - 120px))',
              height: 'min(700px, calc(100vh - 120px))',
              minHeight: '400px',
            }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative flex justify-between items-center p-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Eventra AI</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/90 text-xs">Online & ready to help</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleChat}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Video/Welcome Section */}
            {showVideoSection && (
              <div
                className="flex flex-col p-4 overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
                style={{
                  flex: '1 1 auto',
                  minHeight: '0',
                }}
              >
                {/* Animated Background Elements */}
                <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full opacity-15 blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Video Container */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="relative w-full mb-3"
                >
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/50 dark:border-gray-700/50 transform hover:scale-[1.02] transition-transform duration-300">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      onEnded={handleVideoEnd}
                      playsInline
                    >
                      <source src="/eventra-intro.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"></div>

                    {/* Overlay Welcome Text */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 1 }}
                      className="absolute bottom-0 left-0 right-0 p-3 text-white text-center"
                    >
                      <h3 className="text-lg font-bold mb-0.5 drop-shadow-2xl">
                        Welcome to Eventra! 🎉
                      </h3>
                      <p className="text-xs opacity-90 drop-shadow-lg">Your tech community starts here</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Trending Events Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.7 }}
                  className="mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                      Trending Events
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">This Week</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {trendingEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="rounded-xl p-2 border bg-white/80 dark:bg-gray-700/60 border-indigo-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600/60 cursor-pointer transition-all"
                        onClick={() => setInputValue(`Tell me about ${event.name}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{event.emoji}</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                              {event.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-indigo-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {event.attendees}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="flex gap-1.5 justify-center mb-3 flex-wrap"
                >
                  <div className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-3 py-1.5 shadow-lg text-xs font-medium">
                    <Calendar className="w-3 h-3 animate-bounce" style={{ animationDuration: '2s' }} />
                    <span>75+ Events</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-3 py-1.5 shadow-lg text-xs font-medium">
                    <Trophy className="w-3 h-3 animate-pulse" />
                    <span>Live Hackathons</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-full px-3 py-1.5 shadow-lg text-xs font-medium">
                    <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>24/7 Support</span>
                  </div>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="grid grid-cols-3 gap-2 mb-3"
                >
                  <div className="rounded-xl p-2 text-center border shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white/90 dark:bg-gray-700/90 border-indigo-200 dark:border-gray-600 cursor-pointer group">
                    <div className="text-2xl mb-0.5 animate-bounce group-hover:animate-none" style={{ animationDuration: '2s' }}>
                      <Calendar className="w-6 h-6 mx-auto text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Events</div>
                  </div>
                  <div className="rounded-xl p-2 text-center border shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white/90 dark:bg-gray-700/90 border-indigo-200 dark:border-gray-600 cursor-pointer group">
                    <div className="text-2xl mb-0.5 animate-bounce group-hover:animate-none" style={{ animationDuration: '2s' }}>
                      <Trophy className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Hackathons</div>
                  </div>
                  <div className="rounded-xl p-2 text-center border shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white/90 dark:bg-gray-700/90 border-indigo-200 dark:border-gray-600 cursor-pointer group">
                    <div className="text-2xl mb-0.5 animate-bounce group-hover:animate-none" style={{ animationDuration: '2s' }}>
                      <Code className="w-6 h-6 mx-auto text-pink-600 dark:text-pink-400" />
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Projects</div>
                  </div>
                </motion.div>

                {/* Info Text */}
                <div className="text-center mb-3 px-2">
                  <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                    ✨ Get personalized event recommendations instantly! ✨
                  </p>
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                  className="mt-auto"
                >
                  <button
                    onClick={handleStartChat}
                    className="relative w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden group text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>Start Exploring Events</span>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </span>
                  </button>
                  <div className="flex items-center justify-center mt-2 space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Join 1,500+ developers
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Messages Container */}
            {!showVideoSection && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start space-x-3 ${
                        message.isUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.isUser
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-600"
                      }`}>
                        {message.isUser ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>

                      <div className={`flex flex-col max-w-xs ${
                        message.isUser ? "items-end" : "items-start"
                      }`}>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          message.isUser
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md shadow-lg"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-md border border-indigo-100 dark:border-gray-700"
                        }`}>
                          <div className="whitespace-pre-wrap">{message.text}</div>
                        </div>
                        <span className="text-xs mt-2 px-2 text-gray-400 dark:text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-600">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl rounded-bl-md shadow-md border bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Finding the best info...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setInputValue(action.query);
                            setTimeout(handleSendMessage, 100);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about events, hackathons..."
                      className="flex-1 px-4 py-3 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all resize-none overflow-hidden"
                      style={{
                        minHeight: '44px',
                        maxHeight: '80px',
                      }}
                      onInput={(e) => {
                        const target = e.target;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                      }}
                      disabled={isTyping}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="text-xs mt-3 text-center flex items-center justify-center space-x-1 text-gray-400 dark:text-gray-500">
                    <Sparkles className="w-3 h-3" />
                    <span>Press Enter to send • Shift+Enter for new line</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;