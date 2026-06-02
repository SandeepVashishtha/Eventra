import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const RespawningText = ({ texts = ["Discover & Join"], typingSpeed = 150, deletingSpeed = 100, pauseTime = 2000 }) => {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // 🔥 FIX 2: Accessibility Fast-Fail
  // If the user requires reduced motion, immediately render the first string in full
  // and completely bypass the typing animation engine.
  useEffect(() => {
    if (prefersReducedMotion && texts.length > 0) {
      setCurrentText(texts[0]);
    }
  }, [prefersReducedMotion, texts]);

  useEffect(() => {
    // Abort all timers if reduced motion is enabled
    if (prefersReducedMotion) return;

    let timeoutId;
    const fullText = texts[textIndex];

    const handleTyping = () => {
      // 🔥 FIX 1: Pulled the side-effect (setTimeout) completely out of the state updater.
      // State updaters must be PURE. Spawning timers inside them caused exponential leaks.
      if (!isDeleting) {
        if (currentText !== fullText) {
          setCurrentText(fullText.substring(0, currentText.length + 1));
          timeoutId = setTimeout(handleTyping, typingSpeed);
        } else {
          timeoutId = setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (currentText !== "") {
          setCurrentText(fullText.substring(0, currentText.length - 1));
          timeoutId = setTimeout(handleTyping, deletingSpeed);
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
          // Let the effect re-run for the next word rather than spawning a detached timer
        }
      }
    };

    // Kick off the initial timer for the current cycle
    timeoutId = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeoutId);
  }, [currentText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseTime, prefersReducedMotion]);

  return (
    <span className="inline-block relative whitespace-normal mb-1">
      <span className="inline-flex items-center leading-snug pr-6">{currentText}</span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: prefersReducedMotion ? 1 : [1, 0] }}
        transition={
          prefersReducedMotion
            ? { duration: 0 } // Disable blinking cursor if motion is reduced
            : { duration: 0.8, repeat: Infinity, ease: "linear" }
        }
        className="absolute left-full ml-1 top-1/2 -translate-y-1/2 w-1 h-4 sm:h-6 md:h-8 lg:h-10 bg-black dark:bg-white"
      />
    </span>
  );
};

export default RespawningText;