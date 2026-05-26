import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Mail, Check } from 'lucide-react';
import { FiFacebook, FiLinkedin } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { generateSharingUrl, copyToClipboard } from '../../../utils/shareUtils';
import './ShareMenu.css';

/**
 * ShareMenu Component
 * @param {Object} props - Component props
 * @param {Object} props.shareData - Data to be shared (title, description, url)
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string} props.position - Position of the menu (top, bottom, left, right)
 * @param {string} props.menuClassName - Additional classNames for the menu
 * @param {string} props.buttonClassName - Additional classNames for the button
 * @param {string} props.className - Additional classNames for the container
 */
const ShareMenu = ({
  shareData,
  children,
  position = 'bottom',
  menuClassName = '',
  buttonClassName = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState('bottom');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      // Calculate the best position when opening the menu
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const menuHeight = 350; // Approximate height of the menu
      const menuWidth = 256; // w-64 = 256px
      
      let bestPosition = position;
      
      // For 'above' position, check if there's enough space above
      if (position === 'above') {
        if (rect.top < menuHeight + 20) {
          // Not enough space above, use bottom
          bestPosition = 'bottom';
        } else {
          bestPosition = 'above';
        }
      }
      
      // For cards where buttons are inside the card (top-2), adjust logic
      if (position === 'above' && rect.top > 50) {
        // If we're positioning inside a card, prefer bottom
        bestPosition = 'bottom';
      }
      
      // For other positions, check viewport boundaries
      if (position === 'bottom' && rect.bottom + menuHeight > viewportHeight - 20) {
        bestPosition = 'top';
      }
      
      if (position === 'right' && rect.right + menuWidth > viewportWidth - 20) {
        bestPosition = 'left';
      }
      
      if (position === 'left' && rect.left - menuWidth < 20) {
        bestPosition = 'right';
      }
      
      setCalculatedPosition(bestPosition);
    }
    setIsOpen(!isOpen);
  };

  const handleCopyLink = () => {
    const url = generateSharingUrl(shareData, 'copy');
    copyToClipboard(url);
    setCopied(true);
    
    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleShare = (platform) => {
    //To generate the URL and data
    const url = generateSharingUrl(shareData, platform);
    
    //Native Share Logic
    if(platform === 'system' && navigator.share) {
      navigator.share({
        title: shareData.title,
        text: shareData.description,
        url: shareData.url || window.location.href,
      })
      .then(()=>setIsOpen(false))
      .catch((err)=>console.error('Error sharing:', err));
      return;
    }
    if (platform === 'copy') {
      copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    
    // Open URL in a new window for social platforms
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleResize = () => {
      if (isOpen) {
        // Recalculate position on window resize
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, menuRef]);
  
  // Determine the position class for the menu
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    above: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'top-full mt-2 right-0' // New position for buttons inside cards
  };

  const currentPosition = calculatedPosition || position;

  return (
    <div className={`relative inline-block z-[200] share-menu-container ${className}`} ref={menuRef}>
      {/* Share Button */}
      <button
        type="button"
        className={`cursor-pointer ${buttonClassName}`}
        onClick={toggleMenu}
        ref={buttonRef}
        aria-label={isOpen ? 'Close sharing options' : 'Open sharing options'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {children || (
          <span className="p-2.5 rounded-full shadow-sm hover:shadow-md active:shadow-inner flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all">
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`share-menu-dropdown absolute z-[9999] ${positionClasses[currentPosition]} shadow-xl rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${menuClassName}`}
            role="menu"
            aria-label="Sharing options"
          >
            <div className="py-2 w-64">
              {/* Native System Share (Only shows if browser supports it) */}
              {navigator.share && (
                <button
                onClick={() => handleShare('system')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400"/>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Share via System
                  </span>
                </button>
              )}

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {copied ? 'Copied!' : 'Copy link to clipboard'}
                </span>
              </button>
              
              {/* Email */}
              <button
                onClick={() => handleShare('email')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
              </button>
              
              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FaWhatsapp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
              </button>
              
              {/* Twitter/X */}
              <button
                onClick={() => handleShare('twitter')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-black dark:bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter/X</span>
              </button>
              
              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiFacebook className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
              </button>
              
              {/* LinkedIn */}
              <button
                onClick={() => handleShare('linkedin')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiLinkedin className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</span>
              </button>
              
              {/* Telegram */}
              <button
                onClick={() => handleShare('telegram')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FaTelegram className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareMenu;
