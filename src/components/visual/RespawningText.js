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
    <span className="relative mb-1 inline-block whitespace-normal">
      <span className="inline-flex items-center pr-6 leading-snug">{currentText}</span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: prefersReducedMotion ? 1 : [1, 0] }}
        transition={
          prefersReducedMotion
            ? { duration: 0 } // Disable blinking cursor if motion is reduced
            : { duration: 0.8, repeat: Infinity, ease: "linear" }
        }
        className="absolute top-1/2 left-full ml-1 h-4 w-1 -translate-y-1/2 bg-black sm:h-6 md:h-8 lg:h-10 dark:bg-white"
      />
    </span>
  );
};

export default RespawningText;