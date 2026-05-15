import React from "react";
import { motion } from "framer-motion";
import { HiPlus, HiArrowRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HeroButtons = ({ scrollToCard }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/submit-project");
    }
  };

  return (
    <div className="flex justify-center gap-6 mb-16">
      {/* Submit Project Button */}
      <motion.button
        onClick={handleSubmit}
        className="bg-pink-100 text-black px-7 py-3 rounded-2xl font-semibold flex items-center gap-3 shadow-md hover:bg-pink-200 hover:shadow-lg transition-all duration-300 dark:bg-pink-500/20 dark:text-pink-100 dark:ring-1 dark:ring-pink-300/25 dark:hover:bg-pink-500/30"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        initial="rest"
        data-aos="zoom-in"
        data-aos-delay="400"
      >
        <motion.span
          variants={{
            rest:  { y: 0, scale: 1 },
            hover: { y: -3, scale: 1.2 },
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center"
        >
          <HiPlus className="text-xl" />
        </motion.span>
        Submit Project
      </motion.button>

      {/* Explore Projects Button */}
      <motion.button
        className="bg-yellow-100 text-black px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-md hover:bg-yellow-200 hover:shadow-lg transition-all duration-300 dark:bg-amber-300/20 dark:text-amber-100 dark:ring-1 dark:ring-amber-200/25 dark:hover:bg-amber-300/30"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={scrollToCard}
        data-aos="zoom-in"
        data-aos-delay="600"
      >
        Explore Projects
        <motion.span whileHover={{ x: 5, scale: 1.2 }} className="flex items-center">
          <HiArrowRight className="text-lg" />
        </motion.span>
      </motion.button>
    </div>
  );
};

export default HeroButtons;
