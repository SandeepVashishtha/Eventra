import React from "react";
import { motion } from "framer-motion";

const floatingShapes = [
  { size: 34, x: 50,   y: 200,  color: "#dbeafe", delay: 0   },
  { size: 48, x: 300,  y: 500,  color: "#bfdbfe", delay: 1   },
  { size: 24, x: 700,  y: 350,  color: "#dcfce7", delay: 0.5 },
  { size: 38, x: 1100, y: 600,  color: "#fde68a", delay: 1.5 },
  { size: 40, x: 1100, y: 1000, color: "#fecdd3", delay: 1.5 },
  { size: 64, x: 1000, y: 100,  color: "#fed7aa", delay: 0.8 },
  { size: 28, x: 150,  y: 80,   color: "#c7d2fe", delay: 0.2 },
  { size: 30, x: 520,  y: 160,  color: "#bbf7d0", delay: 0.7 },
  { size: 22, x: 880,  y: 260,  color: "#fde68a", delay: 1.1 },
  { size: 26, x: 220,  y: 760,  color: "#fbcfe8", delay: 0.4 },
  { size: 24, x: 620,  y: 860,  color: "#bae6fd", delay: 1.2 },
  { size: 20, x: 980,  y: 720,  color: "#fed7aa", delay: 1.4 },
];

const FloatingShapes = () => (
  <>
    {floatingShapes.map((shape, idx) => (
      <motion.div
        key={idx}
        initial={{ y: 800, x: shape.x, opacity: 0 }}
        animate={{
          y: [shape.y, shape.y - 30, shape.y],
          opacity: [0.35, 0.7, 0.45],
          rotate: [0, 15, -15, 0],
          scale: [0.8, 1.1, 0.9, 1],
        }}
        transition={{ duration: 5.8, delay: shape.delay, repeat: Infinity }}
        className="absolute rounded-full"
        style={{ width: shape.size, height: shape.size, backgroundColor: shape.color }}
      />
    ))}
  </>
);

export default FloatingShapes;
