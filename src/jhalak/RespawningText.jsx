import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RespawningText = ({ texts = ["Discover & Join"], typingSpeed = 150, deletingSpeed = 100, pauseTime = 2000 }) => {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    
    const handleTyping = () => {
      const fullText = texts[textIndex];
      
      setCurrentText((prev) => {
        if (!isDeleting) {
          const nextText = fullText.substring(0, prev.length + 1);
          if (nextText === fullText) {
            timeout = setTimeout(() => setIsDeleting(true), pauseTime);
          } else {
            timeout = setTimeout(handleTyping, typingSpeed);
          }
          return nextText;
        } else {
          const nextText = fullText.substring(0, prev.length - 1);
          if (nextText === "") {
            setIsDeleting(false);
            setTextIndex((i) => (i + 1) % texts.length);
            timeout = setTimeout(handleTyping, typingSpeed);
          } else {
            timeout = setTimeout(handleTyping, deletingSpeed);
          }
          return nextText;
        }
      });
    };

    timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className="relative inline-block">
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block w-1 h-8 sm:h-12 md:h-16 lg:h-20 bg-black dark:bg-white ml-1 align-middle"
        style={{ marginBottom: '0.1em' }}
      />
    </span>
  );
};

export default RespawningText;
