/**
 * RotationProgressBar.jsx
 * 
 * A circular progress bar component that displays the countdown until the next
 * barcode token rotation. Used in the DynamicBarcodeCard to show users when
 * the QR code will refresh.
 * 
 * @component
 */

import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Circular progress bar with countdown timer
 * 
 * @param {Object} props - Component props
 * @param {number} [props.secondsLeft=15] - Seconds remaining until rotation
 * @param {number} [props.maxSeconds=15] - Maximum seconds in the rotation interval
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {number} [props.size=7] - Size of the progress circle in rem units
 * @param {string} [props.color='indigo'] - Color theme (indigo, purple, emerald, amber, etc.)
 * @returns {JSX.Element} - Progress bar component
 */
const RotationProgressBar = ({
  secondsLeft = 15,
  maxSeconds = 15,
  className = '',
  size = 7,
  color = 'indigo'
}) => {
  // Calculate percentage completed (inverse since we're counting down)
  const percent = Math.round((secondsLeft / maxSeconds) * 100);
  const strokeDashoffset = 100 - percent;
  
  // Color classes for different themes
  const colorClasses = {
    indigo: {
      stroke: 'text-indigo-600 dark:text-indigo-400',
      icon: 'text-indigo-500'
    },
    purple: {
      stroke: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500'
    },
    emerald: {
      stroke: 'text-emerald-600 dark:text-emerald-400',
      icon: 'text-emerald-500'
    },
    amber: {
      stroke: 'text-amber-600 dark:text-amber-400',
      icon: 'text-amber-500'
    },
    red: {
      stroke: 'text-red-600 dark:text-red-400',
      icon: 'text-red-500'
    },
    blue: {
      stroke: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-500'
    }
  };
  
  const currentColor = colorClasses[color] || colorClasses.indigo;
  
  // Determine animation speed based on remaining time
  const isAboutToRotate = secondsLeft <= 3;
  
  return (
    <div 
      className={`flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 ${className}`}
      role="timer"
      aria-label={`QR code refreshes in ${secondsLeft} seconds`}
      aria-live="polite"
    >
      {/* Circular Progress Indicator */}
      <div className={`relative w-${size} h-${size} flex items-center justify-center`}>
        <svg 
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          {/* Background circle */}
          <path
            className="text-gray-200 dark:text-gray-800"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          
          {/* Progress circle */}
          <path
            className={`${currentColor.stroke} transition-all duration-1000 ease-linear`}
            strokeDasharray="100, 100"
            strokeDashoffset={strokeDashoffset}
            strokeWidth="4"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{
              transitionDuration: isAboutToRotate ? '200ms' : '1000ms'
            }}
          />
        </svg>
        
        {/* Time display */}
        <span 
          className={`absolute font-mono text-[10px] font-bold ${isAboutToRotate ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-gray-700 dark:text-gray-300'}`}
          aria-hidden="true"
        >
          {secondsLeft}s
        </span>
      </div>
      
      {/* Label */}
      <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
        <RefreshCw 
          className={`w-3 h-3 ${currentColor.icon} ${isAboutToRotate ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">Auto-rotating QR</span>
        <span className="sm:hidden">Rotating</span>
      </span>
    </div>
  );
};

RotationProgressBar.propTypes = {
  secondsLeft: PropTypes.number,
  maxSeconds: PropTypes.number,
  className: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.oneOf(['indigo', 'purple', 'emerald', 'amber', 'red', 'blue'])
};

export default RotationProgressBar;
