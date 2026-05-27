import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, Search, HelpCircle, Code2 } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      textAlign: "center",
      padding: "24px"
    }}>
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ fontSize: "8rem", fontWeight: "bold", color: "white", margin: "0", lineHeight: "1" }}
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ fontSize: "2rem", color: "white", marginTop: "10px", fontWeight: "600" }}
      >
        Lost in the Cloud?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{ color: "rgba(255,255,255,0.85)", marginTop: "16px", maxWidth: "450px", fontSize: "1.1rem" }}
      >
        We can't seem to find the page you're looking for. It might have been removed, renamed, or temporarily unavailable.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{ 
          marginTop: "40px", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: "16px",
          width: "100%",
          maxWidth: "600px" 
        }}
      >
        <Link to="/" className="hover:scale-105 transition-transform" style={btnStyle}>
          <Home size={20} /> Home Page
        </Link>
        <Link to="/events" className="hover:scale-105 transition-transform" style={btnStyle}>
          <Calendar size={20} /> Browse Events
        </Link>
        <Link to="/hackathons" className="hover:scale-105 transition-transform" style={btnStyle}>
          <Code2 size={20} /> Hackathons
        </Link>
        <Link to="/help" className="hover:scale-105 transition-transform" style={btnStyle}>
          <HelpCircle size={20} /> Help Center
        </Link>
      </motion.div>
    </div>
  );
};

const btnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "12px 20px",
  borderRadius: "12px",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  color: "white",
  fontWeight: "600",
  textDecoration: "none",
  fontSize: "1rem",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

export default NotFoundPage;
