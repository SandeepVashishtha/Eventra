import React from "react";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaDiscord,
  FaCode,
  FaLaptopCode,
  FaBrain,
} from "react-icons/fa";
import { SiHackaday } from "react-icons/si";

const iconList = [
  { icon: <FaGithub />,     color: "#333"    },
  { icon: <FaTwitter />,    color: "#1DA1F2" },
  { icon: <FaLinkedin />,   color: "#0A66C2" },
  { icon: <FaDiscord />,    color: "#5865F2" },
  { icon: <FaCode />,       color: "#10B981" },
  { icon: <FaLaptopCode />, color: "#F59E0B" },
  { icon: <FaBrain />,      color: "#F43F5E" },
  { icon: <SiHackaday />,   color: "#8B5CF6" },
];

const repeatedIcons = [...iconList, ...iconList, ...iconList];

const IconTrain = () => (
  <div
    className="absolute right-8 top-0 h-full flex flex-col items-center justify-start overflow-hidden z-0
                hidden lg:flex"
  >
    <motion.div
      animate={{ y: ["0%", "-100%"] }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      className="flex flex-col gap-6"
    >
      {repeatedIcons.map((item, idx) => (
        <motion.div
          key={idx}
          className="rounded-full p-3 shadow-lg flex items-center justify-center bg-white dark:bg-gray-800"
          animate={{ x: [0, 8, -8, 0], rotate: [0, 15, -15, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: idx * 0.2,
          }}
        >
          {React.cloneElement(item.icon, { color: item.color, size: 24 })}
        </motion.div>
      ))}
    </motion.div>
  </div>
);

export default IconTrain;
