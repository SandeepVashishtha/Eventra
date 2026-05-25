import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      textAlign: "center",
      padding: "24px"
    }}>
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ fontSize: "8rem", fontWeight: "bold", color: "white", margin: "0" }}
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ fontSize: "2rem", color: "white", marginTop: "10px" }}
      >
        Page Not Found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{ color: "rgba(255,255,255,0.85)", marginTop: "16px", maxWidth: "400px" }}
      >
        Sorry, the page you are looking for does not exist or has been moved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: "32px",
            padding: "12px 30px",
            borderRadius: "8px",
            backgroundColor: "white",
            color: "#764ba2",
            fontWeight: "600",
            textDecoration: "none",
            fontSize: "1rem"
          }}
        >
          Go Back Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;