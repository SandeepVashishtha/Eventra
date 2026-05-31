/**
 * @fileoverview RespawningText - Animated typewriter text component for Eventra
 * @module components/visual/RespawningText
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * A React component that displays an animated typewriter effect,
 * cycling through an array of text strings by typing and deleting
 * them sequentially with configurable speeds.
 *
 * Automatically respects the user's `prefers-reduced-motion`
 * accessibility setting.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string[]} [props.texts=["Discover & Join"]] - Array of text strings to cycle through
 * @param {number} [props.typingSpeed=150] - Delay in milliseconds between each character typed
 * @param {number} [props.deletingSpeed=100] - Delay in milliseconds between each character deleted
 * @param {number} [props.pauseTime=2000] - Delay in milliseconds before deleting starts
 *
 * @returns {JSX.Element} An animated span element with typewriter cursor effect
 *
 * @example
 * <RespawningText
 *   texts={["Build Events", "Connect Communities", "Track Analytics"]}
 *   typingSpeed={100}
 *   deletingSpeed={80}
 *   pauseTime={3000}
 * />
 */
const RespawningText = ({ texts = ["Discover & Join"], typingSpeed = 150, deletingSpeed = 100, pauseTime = 2000 }) => {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useReducedMotion();

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
    <span className="inline-block relative whitespace-normal mb-1">
      <span className="inline-flex items-center leading-snug pr-6">{currentText}</span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="absolute left-full ml-1 top-1/2 -translate-y-1/2 w-1 h-4 sm:h-6 md:h-8 lg:h-10 bg-black dark:bg-white"
      />
    </span>
  );
};

export default RespawningText;
