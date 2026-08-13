/**
 * SubtitleDisplay Component for Real-Time Multilingual AR Subtitles
 * 
 * This component provides:
 * - Real-time subtitle display with customizable styling
 * - Support for both standard and AR display modes
 * - Smooth animations and transitions
 * - Language indicator and confidence display
 * - Accessibility features
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  useActiveSubtitle,
  useSubtitleList,
  useSubtitleSettings,
  useSubtitleControls,
  SUBTITLE_CONFIG,
} from "../../context/RealTimeSubtitleContext.jsx";
import { SUBTITLE_STATE } from "../../context/RealTimeSubtitleContext.jsx";
import { translationService } from "../../services/translationService.js";

/**
 * Subtitle display animation presets
 */
const ANIMATION_PRESETS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slide: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.3 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
    transition: {},
  },
};

/**
 * SubtitleDisplay Component
 * 
 * Displays real-time subtitles with customizable styling and animations.
 */
const SubtitleDisplay = forwardRef(({
  // Display mode
  mode = "standard", // "standard", "ar", "compact", "full"
  
  // Position
  position = "bottom", // "top", "bottom", "center"
  
  // Custom styling
  className = "",
  style = {},
  
  // Display options
  showOriginal = false,
  showLanguage = true,
  showConfidence = false,
  showTimestamp = false,
  
  // Animation
  animation = "fade",
  
  // Performance
  maxSubtitles = 3,
  
  // Callbacks
  onSubtitleChange,
  onClick,
  
  // AR-specific props
  arDistance = 2,
  arAnchor = "center",
  arOpacity = 0.9,
  
  ...props
}, ref) => {
  const { t } = useTranslation();
  const activeSubtitle = useActiveSubtitle();
  const subtitleList = useSubtitleList();
  const { displaySettings, arSettings } = useSubtitleSettings();
  const { isEnabled, isARMode } = useSubtitleControls();
  
  // State
  const [displayedSubtitles, setDisplayedSubtitles] = useState([]);
  const containerRef = useRef(null);
  
  // Merge display settings with props
  const mergedSettings = useMemo(() => {
    return {
      fontSize: displaySettings.fontSize || SUBTITLE_CONFIG.DEFAULT_FONT_SIZE,
      fontFamily: displaySettings.fontFamily || SUBTITLE_CONFIG.DEFAULT_FONT_FAMILY,
      color: displaySettings.color || SUBTITLE_CONFIG.DEFAULT_COLOR,
      background: displaySettings.background || SUBTITLE_CONFIG.DEFAULT_BACKGROUND,
      position: position || displaySettings.position || SUBTITLE_CONFIG.DEFAULT_POSITION,
      animation: animation || displaySettings.animation || SUBTITLE_CONFIG.DEFAULT_ANIMATION,
    };
  }, [displaySettings, position, animation]);
  
  // Get animation preset
  const animationPreset = useMemo(() => {
    return ANIMATION_PRESETS[mergedSettings.animation] || ANIMATION_PRESETS.fade;
  }, [mergedSettings.animation]);
  
  // Process subtitles for display
  useEffect(() => {
    if (!activeSubtitle) {
      setDisplayedSubtitles([]);
      return;
    }
    
    // Update displayed subtitles
    setDisplayedSubtitles(prev => {
      const newSubtitles = [...prev];
      
      // Check if active subtitle is already displayed
      const exists = newSubtitles.some(sub => sub.id === activeSubtitle.id);
      
      if (!exists) {
        newSubtitles.push(activeSubtitle);
      }
      
      // Limit the number of displayed subtitles
      if (newSubtitles.length > maxSubtitles) {
        return newSubtitles.slice(-maxSubtitles);
      }
      
      return newSubtitles;
    });
    
    // Call onSubtitleChange callback
    if (onSubtitleChange) {
      onSubtitleChange(activeSubtitle);
    }
  }, [activeSubtitle, maxSubtitles, onSubtitleChange]);
  
  // AR mode effect
  useEffect(() => {
    if (isARMode && typeof window !== "undefined") {
      // Add AR-specific CSS classes or styles
      document.body.classList.add("ar-mode");
      return () => {
        document.body.classList.remove("ar-mode");
      };
    }
  }, [isARMode]);
  
  // Get container position classes
  const getPositionClasses = useCallback(() => {
    const classes = [];
    
    switch (mergedSettings.position) {
      case "top":
        classes.push("top-4");
        break;
      case "center":
        classes.push("inset-y-1/2", "-translate-y-1/2");
        break;
      case "bottom":
      default:
        classes.push("bottom-4");
        break;
    }
    
    // AR mode positioning
    if (isARMode || mode === "ar") {
      classes.push("ar-subtitle-container");
    }
    
    return classes.join(" ");
  }, [mergedSettings.position, isARMode, mode]);
  
  // Format subtitle text with optional metadata
  const formatSubtitle = useCallback((subtitle) => {
    if (!subtitle) return "";
    
    let text = subtitle.translatedText || subtitle.text || "";
    
    // Add language indicator
    if (showLanguage && subtitle.language) {
      const languageName = translationService.getLanguageName(subtitle.language);
      text = `${text} [${languageName}]`;
    }
    
    // Add confidence indicator
    if (showConfidence && subtitle.confidence) {
      const confidencePct = Math.round(subtitle.confidence * 100);
      text = `${text} (${confidencePct}%)`;
    }
    
    // Add original text
    if (showOriginal && subtitle.text && subtitle.text !== subtitle.translatedText) {
      text = `${subtitle.text} → ${subtitle.translatedText}`;
    }
    
    return text;
  }, [showLanguage, showConfidence, showOriginal]);
  
  // Handle click on subtitle
  const handleClick = useCallback((subtitle) => {
    if (onClick) {
      onClick(subtitle);
    }
  }, [onClick]);
  
  // Render subtitle item
  const renderSubtitleItem = useCallback((subtitle, index) => {
    const isActive = subtitle.id === activeSubtitle?.id;
    
    return (
      <motion.div
        key={subtitle.id}
        {...animationPreset}
        custom={index}
        onClick={() => handleClick(subtitle)}
        className={`
          subtitle-item
          ${isActive ? "subtitle-active" : "subtitle-inactive"}
          ${showOriginal ? "subtitle-with-original" : ""}
          cursor-pointer
          select-text
        `}
        style={{
          fontSize: `${mergedSettings.fontSize}px`,
          fontFamily: mergedSettings.fontFamily,
          color: mergedSettings.color,
          background: mergedSettings.background,
          padding: "8px 12px",
          borderRadius: "4px",
          margin: "4px 0",
          wordBreak: "break-word",
          ...style,
        }}
      >
        {formatSubtitle(subtitle)}
        
        {/* Timestamp (optional) */}
        {showTimestamp && (
          <div className="subtitle-timestamp" style={{
            fontSize: `${mergedSettings.fontSize * 0.75}px`,
            opacity: 0.7,
            marginTop: "4px",
          }}>
            {new Date(subtitle.timestamp).toLocaleTimeString()}
          </div>
        )}
      </motion.div>
    );
  }, [activeSubtitle, animationPreset, formatSubtitle, handleClick, mergedSettings, showOriginal, showTimestamp, style]);
  
  // Render AR mode subtitle
  const renderARSubtitle = useCallback(() => {
    if (!activeSubtitle) return null;
    
    return (
      <motion.div
        {...animationPreset}
        className="ar-subtitle"
        style={{
          fontSize: `${arSettings.fontSize || SUBTITLE_CONFIG.AR_FONT_SIZE}px`,
          fontFamily: mergedSettings.fontFamily,
          color: mergedSettings.color,
          background: mergedSettings.background,
          opacity: arSettings.opacity || SUBTITLE_CONFIG.AR_OPACITY,
          padding: "12px 16px",
          borderRadius: "8px",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          // AR-specific styles
          transform: `translateZ(${-arSettings.distance || -SUBTITLE_CONFIG.AR_DISTANCE}px)`,
          ...style,
        }}
        data-ar-anchor={arSettings.anchor || SUBTITLE_CONFIG.AR_ANCHOR}
      >
        {formatSubtitle(activeSubtitle)}
      </motion.div>
    );
  }, [activeSubtitle, animationPreset, arSettings, formatSubtitle, mergedSettings, style]);
  
  // Render standard mode subtitles
  const renderStandardSubtitles = useCallback(() => {
    return (
      <div
        ref={containerRef}
        className={`
          subtitle-container
          ${getPositionClasses()}
          ${className}
          ${isARMode ? "ar-mode" : ""}
        `}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: mergedSettings.position === "center" ? "center" : "flex-start",
          justifyContent: mergedSettings.position === "center" ? "center" : "flex-end",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          zIndex: 9999,
          pointerEvents: "auto",
          ...style,
        }}
        {...props}
      >
        <AnimatePresence mode="popLayout">
          {displayedSubtitles.map((subtitle, index) => (
            renderSubtitleItem(subtitle, index)
          ))}
        </AnimatePresence>
      </div>
    );
  }, [className, displayedSubtitles, getPositionClasses, mergedSettings.position, props, renderSubtitleItem, style]);
  
  // Render compact mode (single subtitle only)
  const renderCompactSubtitle = useCallback(() => {
    if (!activeSubtitle) return null;
    
    return (
      <motion.div
        {...animationPreset}
        className={`
          subtitle-compact
          ${getPositionClasses()}
          ${className}
        `}
        style={{
          fontSize: `${mergedSettings.fontSize}px`,
          fontFamily: mergedSettings.fontFamily,
          color: mergedSettings.color,
          background: mergedSettings.background,
          padding: "8px 12px",
          borderRadius: "4px",
          zIndex: 9999,
          pointerEvents: "auto",
          ...style,
        }}
        onClick={() => handleClick(activeSubtitle)}
      >
        {formatSubtitle(activeSubtitle)}
      </motion.div>
    );
  }, [activeSubtitle, animationPreset, className, formatSubtitle, getPositionClasses, handleClick, mergedSettings, style]);
  
  // Render full mode (with history)
  const renderFullMode = useCallback(() => {
    return (
      <div
        ref={containerRef}
        className={`
          subtitle-full-container
          ${getPositionClasses()}
          ${className}
        `}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          zIndex: 9999,
          pointerEvents: "auto",
          ...style,
        }}
        {...props}
      >
        {/* Active subtitle (highlighted) */}
        {activeSubtitle && (
          <motion.div
            {...animationPreset}
            className="subtitle-active-container"
            style={{
              marginBottom: "8px",
            }}
          >
            {renderSubtitleItem(activeSubtitle, 0)}
          </motion.div>
        )}
        
        {/* History subtitles */}
        <div className="subtitle-history-container">
          <AnimatePresence mode="popLayout">
            {subtitleList
              .filter(sub => sub.id !== activeSubtitle?.id)
              .slice(-maxSubtitles)
              .map((subtitle, index) => (
                renderSubtitleItem(subtitle, index + 1)
              ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }, [activeSubtitle, animationPreset, className, getPositionClasses, maxSubtitles, props, renderSubtitleItem, style, subtitleList]);
  
  // Main render based on mode
  if (!isEnabled) {
    return null;
  }
  
  // AR mode override
  if (isARMode || mode === "ar") {
    return renderARSubtitle();
  }
  
  // Render based on mode prop
  switch (mode) {
    case "compact":
      return renderCompactSubtitle();
    case "full":
      return renderFullMode();
    case "ar":
      return renderARSubtitle();
    case "standard":
    default:
      return renderStandardSubtitles();
  }
});

// Add display name for debugging
SubtitleDisplay.displayName = "SubtitleDisplay";

/**
 * SubtitleDisplayWithControls Component
 * 
 * Subtitle display with built-in controls for language selection, etc.
 */
export function SubtitleDisplayWithControls({
  mode,
  position,
  className = "",
  style = {},
  showControls = true,
  ...props
}) {
  const { t } = useTranslation();
  const {
    isEnabled,
    isARMode,
    toggleSubtitles,
    toggleARMode,
    changeLanguage,
    currentLanguage,
    sourceLanguage,
  } = useSubtitleControls();
  
  const { displaySettings, updateDisplaySettings } = useSubtitleSettings();
  const { getSupportedLanguages, getLanguageName } = translationService;
  const supportedLanguages = getSupportedLanguages();
  
  // Toggle subtitle display
  const handleToggle = useCallback(() => {
    toggleSubtitles(!isEnabled);
  }, [isEnabled, toggleSubtitles]);
  
  // Toggle AR mode
  const handleToggleAR = useCallback(() => {
    toggleARMode(!isARMode);
  }, [isARMode, toggleARMode]);
  
  // Change target language
  const handleLanguageChange = useCallback((e) => {
    const lang = e.target.value;
    changeLanguage(lang);
  }, [changeLanguage]);
  
  // Change source language
  const handleSourceLanguageChange = useCallback((e) => {
    updateDisplaySettings({ sourceLanguage: e.target.value });
  }, [updateDisplaySettings]);
  
  // Get current display mode
  const currentMode = isARMode ? "ar" : mode || "standard";
  
  return (
    <div
      className={`subtitle-display-with-controls ${className}`}
      style={style}
    >
      {/* Subtitle display */}
      <SubtitleDisplay
        mode={currentMode}
        position={position}
        {...props}
      />
      
      {/* Controls panel */}
      {showControls && (
        <div className="subtitle-controls" style={{
          position: "fixed",
          [position === "top" ? "top" : "bottom"]: position === "top" ? "calc(100% - 40px)" : "40px",
          left: position === "center" ? "50%" : "16px",
          transform: position === "center" ? "translateX(-50%)" : "none",
          zIndex: 10000,
          display: "flex",
          gap: "8px",
          padding: "8px",
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "8px",
          backdropFilter: "blur(4px)",
        }}>
          {/* Power button */}
          <button
            onClick={handleToggle}
            title={isEnabled ? t("disableSubtitles") || "Disable subtitles" : t("enableSubtitles") || "Enable subtitles"}
            style={{
              padding: "4px 8px",
              border: "none",
              borderRadius: "4px",
              background: isEnabled ? "#4CAF50" : "#666",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isEnabled ? "🔊" : "🔇"}
          </button>
          
          {/* AR mode toggle */}
          <button
            onClick={handleToggleAR}
            title={isARMode ? t("disableARMode") || "Disable AR mode" : t("enableARMode") || "Enable AR mode"}
            style={{
              padding: "4px 8px",
              border: "none",
              borderRadius: "4px",
              background: isARMode ? "#2196F3" : "#666",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isARMode ? "🕶️" : "📱"}
          </button>
          
          {/* Language selector */}
          <select
            value={currentLanguage}
            onChange={handleLanguageChange}
            disabled={!isEnabled}
            style={{
              padding: "4px",
              borderRadius: "4px",
              border: "none",
              background: "#444",
              color: "white",
            }}
          >
            {supportedLanguages.map(lang => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>
          
          {/* Settings button (optional) */}
          <button
            onClick={() => {
              // Open settings modal
              if (props.onSettingsClick) {
                props.onSettingsClick();
              }
            }}
            title={t("settings") || "Settings"}
            style={{
              padding: "4px 8px",
              border: "none",
              borderRadius: "4px",
              background: "#666",
              color: "white",
              cursor: "pointer",
            }}
          >
            ⚙️
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * SubtitleDisplayAR Component
 * 
 * Specialized component for AR subtitle display
 */
export function SubtitleDisplayAR({
  distance = SUBTITLE_CONFIG.AR_DISTANCE,
  anchor = SUBTITLE_CONFIG.AR_ANCHOR,
  opacity = SUBTITLE_CONFIG.AR_OPACITY,
  fontSize = SUBTITLE_CONFIG.AR_FONT_SIZE,
  className = "",
  style = {},
  ...props
}) {
  return (
    <SubtitleDisplay
      mode="ar"
      arDistance={distance}
      arAnchor={anchor}
      arOpacity={opacity}
      style={{
        ...style,
        fontSize: `${fontSize}px`,
      }}
      className={`ar-subtitle-display ${className}`}
      {...props}
    />
  );
}

/**
 * SubtitleDisplayMobile Component
 * 
 * Optimized component for mobile subtitle display
 */
export function SubtitleDisplayMobile({
  position = "bottom",
  className = "",
  style = {},
  ...props
}) {
  return (
    <SubtitleDisplay
      mode="compact"
      position={position}
      animation="slideUp"
      maxSubtitles={2}
      className={`mobile-subtitle-display ${className}`}
      style={{
        ...style,
        fontSize: "14px",
        maxWidth: "90vw",
      }}
      {...props}
    />
  );
}

// Export main component
export default SubtitleDisplay;
