import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Consolidated lucide-react imports for code cleanliness
import { Facebook, Linkedin, MessageCircle, Send, Share2, Copy, Mail, Check } from 'lucide-react';
import { generateSharingUrl, copyToClipboard } from '../../../utils/shareUtils';
import { toast } from 'react-toastify';
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
  const timeoutRef = useRef(null); // Ref to track timeouts and prevent memory leaks

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
    
    // Clear any existing timeouts to prevent memory leaks
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Reset copied status after 2 seconds safely
    timeoutRef.current = setTimeout(() => {
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
      .catch((err) => {
        // Ignore AbortError caused by users intentionally closing the native share dialog
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          toast.error("Failed to share event", { autoClose: 2000 });
        }
      });
      return;
    }
    if (platform === 'copy') {
      copyToClipboard(url);
      setCopied(true);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      return;
    }

    if (!url) {
      return;
    }
    
    // Open URL in a new window for social platforms
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };
  
  // Handle component unmount memory leak cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
          <span className="flex items-center justify-center rounded-full bg-white p-2.5 text-gray-700 shadow-sm transition-all hover:shadow-md active:shadow-inner dark:bg-gray-800 dark:text-gray-200">
            <Share2 className="h-4 w-4" aria-hidden="true" />
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
            <div className="w-64 py-2">
              {/* Native System Share (Only shows if browser supports it) */}
              {navigator.share && (
                <button
                onClick={() => handleShare('system')}
                role="menuitem"
                className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <Share2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400"/>
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
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
               aria-label="Copy link to clipboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Mail className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
              </button>
              
              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
              </button>
              
              {/* Twitter/X */}
              <button
                onClick={() => handleShare('twitter')}
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-gray-700">
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
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
              </button>
              
              {/* LinkedIn */}
              <button
                onClick={() => handleShare('linkedin')}
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Linkedin className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</span>
              </button>
              
              {/* Telegram */}
              <button
                onClick={() => handleShare('telegram')}
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Send className="h-4 w-4 text-blue-500 dark:text-blue-400" />
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