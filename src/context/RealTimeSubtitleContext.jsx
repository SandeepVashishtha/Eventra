/**
 * Real-Time Subtitle Context for Multilingual AR Subtitles
 * 
 * This context provides:
 * - Real-time subtitle management for live events
 * - Language selection and preference management
 * - Subtitle synchronization with audio
 * - AR display settings and configurations
 * - Performance monitoring and statistics
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { sseMultiplexer } from "../utils/sseMultiplexer.js";
import { audioCaptureService, AUDIO_CAPTURE_STATE } from "../services/audioCaptureService.js";
import { transcriptionService, TRANSCRIPTION_STATE } from "../services/transcriptionService.js";
import { translationService, TRANSLATION_STATE } from "../services/translationService.js";
import { logger } from "../utils/logger.js";

/**
 * Subtitle configuration
 */
export const SUBTITLE_CONFIG = {
  // Display settings
  DEFAULT_FONT_SIZE: 16,
  DEFAULT_FONT_FAMILY: "system-ui, -apple-system, sans-serif",
  DEFAULT_COLOR: "#FFFFFF",
  DEFAULT_BACKGROUND: "rgba(0, 0, 0, 0.7)",
  DEFAULT_POSITION: "bottom", // "top", "bottom", "center"
  DEFAULT_ANIMATION: "fade", // "fade", "slide", "none"
  
  // AR-specific settings
  AR_ENABLED: true,
  AR_OPACITY: 0.9,
  AR_FONT_SIZE: 24,
  AR_DISTANCE: 2, // meters
  AR_ANCHOR: "center", // "center", "top", "bottom"
  
  // Performance settings
  TARGET_LATENCY_MS: 500, // Target end-to-end latency
  MAX_SUBTITLE_LENGTH: 100, // Maximum characters per subtitle
  SUBTITLE_DURATION_MS: 5000, // Default subtitle display duration
  
  // Language settings
  DEFAULT_SOURCE_LANGUAGE: "en",
  DEFAULT_TARGET_LANGUAGE: "en",
  
  // Buffer settings
  SUBTITLE_BUFFER_SIZE: 5, // Number of subtitles to buffer
  HISTORY_SIZE: 20, // Number of past subtitles to keep
  
  // Quality settings
  ENABLE_CONTEXT: true,
  ENABLE_CACHING: true,
  ENABLE_LANGUAGE_DETECTION: true,
};

/**
 * Subtitle states
 */
export const SUBTITLE_STATE = {
  IDLE: "idle",
  CONNECTING: "connecting",
  ACTIVE: "active",
  PAUSED: "paused",
  ERROR: "error",
  UNSUPPORTED: "unsupported",
};

/**
 * Subtitle structure
 */
export class Subtitle {
  constructor(data) {
    this.id = data.id || `subtitle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.text = data.text || "";
    this.translatedText = data.translatedText || data.text || "";
    this.language = data.language || SUBTITLE_CONFIG.DEFAULT_TARGET_LANGUAGE;
    this.sourceLanguage = data.sourceLanguage || SUBTITLE_CONFIG.DEFAULT_SOURCE_LANGUAGE;
    this.timestamp = data.timestamp || Date.now();
    this.startTime = data.startTime || Date.now();
    this.endTime = data.endTime || Date.now() + SUBTITLE_CONFIG.SUBTITLE_DURATION_MS;
    this.confidence = data.confidence || 1.0;
    this.provider = data.provider || "local";
    this.isFinal = data.isFinal || false; // True for final/completed subtitles
    this.displaySettings = data.displaySettings || {};
  }
  
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      translatedText: this.translatedText,
      language: this.language,
      sourceLanguage: this.sourceLanguage,
      timestamp: this.timestamp,
      startTime: this.startTime,
      endTime: this.endTime,
      confidence: this.confidence,
      provider: this.provider,
      isFinal: this.isFinal,
    };
  }
  
  // Calculate if subtitle should be displayed
  shouldDisplay(currentTime = Date.now()) {
    return currentTime >= this.startTime && currentTime <= this.endTime;
  }
  
  // Calculate display duration
  getDuration() {
    return this.endTime - this.startTime;
  }
  
  // Update end time
  extend(durationMs) {
    this.endTime = Date.now() + durationMs;
  }
}

/**
 * RealTimeSubtitleContext
 */
const RealTimeSubtitleContext = createContext(null);

/**
 * RealTimeSubtitleProvider Component
 * 
 * Manages real-time subtitle state and provides it to consumers.
 */
export function RealTimeSubtitleProvider({ children }) {
  const { t, i18n } = useTranslation();
  
  // State management
  const [state, setState] = useState(SUBTITLE_STATE.IDLE);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [stats, setStats] = useState({
    totalSubtitles: 0,
    displayedSubtitles: 0,
    averageLatency: 0,
    lastLatency: 0,
    errors: 0,
  });
  
  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    fontSize: SUBTITLE_CONFIG.DEFAULT_FONT_SIZE,
    fontFamily: SUBTITLE_CONFIG.DEFAULT_FONT_FAMILY,
    color: SUBTITLE_CONFIG.DEFAULT_COLOR,
    background: SUBTITLE_CONFIG.DEFAULT_BACKGROUND,
    position: SUBTITLE_CONFIG.DEFAULT_POSITION,
    animation: SUBTITLE_CONFIG.DEFAULT_ANIMATION,
  });
  
  // AR settings
  const [arSettings, setArSettings] = useState({
    enabled: SUBTITLE_CONFIG.AR_ENABLED,
    opacity: SUBTITLE_CONFIG.AR_OPACITY,
    fontSize: SUBTITLE_CONFIG.AR_FONT_SIZE,
    distance: SUBTITLE_CONFIG.AR_DISTANCE,
    anchor: SUBTITLE_CONFIG.AR_ANCHOR,
  });
  
  // Service references
  const subtitleQueue = useRef([]);
  const latencyMeasurements = useRef([]);
  const startTimeRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  
  // Check if services are supported
  useEffect(() => {
    const checkSupport = () => {
      const audioSupported = audioCaptureService.isSupported();
      if (!audioSupported) {
        setState(SUBTITLE_STATE.UNSUPPORTED);
        logger.warn("[RealTimeSubtitleContext] Audio capture not supported in this browser");
        return;
      }
      
      // Check if we're in a secure context for microphone access
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setState(SUBTITLE_STATE.ERROR);
        logger.warn("[RealTimeSubtitleContext] Microphone access requires a secure context (HTTPS)");
      }
    };
    
    checkSupport();
  }, []);
  
  // Handle language changes from i18n
  useEffect(() => {
    if (i18n.language) {
      setCurrentLanguage(i18n.language);
      translationService.setTargetLanguage(i18n.language);
    }
  }, [i18n.language]);
  
  // Start all services when enabled
  useEffect(() => {
    if (!isEnabled) {
      stopAllServices();
      return;
    }
    
    startAllServices();
    
    return () => {
      stopAllServices();
    };
  }, [isEnabled, currentLanguage]);
  
  // Process subtitles from translation service
  useEffect(() => {
    const handleTranslation = (translation) => {
      if (!translation || !translation.translatedText) return;
      
      const now = Date.now();
      const startTime = startTimeRef.current || now;
      const latency = now - startTime;
      
      // Record latency
      latencyMeasurements.current.push(latency);
      if (latencyMeasurements.current.length > 10) {
        latencyMeasurements.current.shift();
      }
      
      // Calculate average latency
      const avgLatency = latencyMeasurements.current.reduce((sum, l) => sum + l, 0) / 
        latencyMeasurements.current.length;
      
      // Create subtitle
      const subtitle = new Subtitle({
        text: translation.originalText,
        translatedText: translation.translatedText,
        language: translation.targetLanguage,
        sourceLanguage: translation.sourceLanguage,
        confidence: translation.confidence,
        provider: translation.provider,
        startTime: now,
        endTime: now + SUBTITLE_CONFIG.SUBTITLE_DURATION_MS,
      });
      
      // Add to queue
      subtitleQueue.current.push(subtitle);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalSubtitles: prev.totalSubtitles + 1,
        lastLatency: latency,
        averageLatency: avgLatency,
      }));
      
      // If queue exceeds buffer size, process it
      if (subtitleQueue.current.length >= 1) {
        processSubtitleQueue();
      }
      
      logger.log(`[RealTimeSubtitleContext] New subtitle: ${translation.translatedText} (latency: ${latency}ms)`);
    };
    
    translationService.setOnTranslation(handleTranslation);
    
    return () => {
      translationService.setOnTranslation(null);
    };
  }, []);
  
  // Process subtitle queue
  const processSubtitleQueue = useCallback(() => {
    if (subtitleQueue.current.length === 0) return;
    
    const queue = [...subtitleQueue.current];
    subtitleQueue.current = [];
    
    // Get the first subtitle from queue
    const nextSubtitle = queue[0];
    
    // Update active subtitle
    setActiveSubtitle(nextSubtitle);
    
    // Add to subtitles array
    setSubtitles(prev => {
      const newSubtitles = [...prev, nextSubtitle];
      
      // Remove old subtitles (beyond buffer size)
      if (newSubtitles.length > SUBTITLE_CONFIG.SUBTITLE_BUFFER_SIZE) {
        return newSubtitles.slice(-SUBTITLE_CONFIG.SUBTITLE_BUFFER_SIZE);
      }
      
      return newSubtitles;
    });
    
    // Add to history
    setHistory(prev => {
      const newHistory = [...prev, nextSubtitle];
      
      // Keep only most recent history entries
      if (newHistory.length > SUBTITLE_CONFIG.HISTORY_SIZE) {
        return newHistory.slice(-SUBTITLE_CONFIG.HISTORY_SIZE);
      }
      
      return newHistory;
    });
    
    // Mark as displayed
    setStats(prev => ({
      ...prev,
      displayedSubtitles: prev.displayedSubtitles + 1,
    }));
    
    // Process remaining queue
    if (queue.length > 1) {
      // Delay processing to maintain order
      setTimeout(processSubtitleQueue, 100);
    }
  }, []);
  
  // Start all services
  const startAllServices = useCallback(async () => {
    try {
      setState(SUBTITLE_STATE.CONNECTING);
      startTimeRef.current = Date.now();
      
      // Initialize services
      transcriptionService.init({
        provider: "whisper",
        language: sourceLanguage,
      });
      
      translationService.init({
        provider: "google",
        targetLanguage: currentLanguage,
        sourceLanguage: sourceLanguage,
      });
      
      // Set up translation callback chain
      transcriptionService.setOnTranscription((transcription) => {
        if (translation && translation.text) {
          // Pass transcription to translation service
          translationService.handleTranscription(transcription);
        }
      });
      
      // Start services
      await audioCaptureService.start();
      await transcriptionService.start();
      await translationService.start();
      
      setState(SUBTITLE_STATE.ACTIVE);
      logger.log("[RealTimeSubtitleContext] All services started successfully");
      
    } catch (error) {
      setState(SUBTITLE_STATE.ERROR);
      logger.error("[RealTimeSubtitleContext] Error starting services:", error);
    }
  }, [currentLanguage, sourceLanguage]);
  
  // Stop all services
  const stopAllServices = useCallback(() => {
    try {
      audioCaptureService.stop();
      transcriptionService.stop();
      translationService.stop();
      
      // Clear state
      subtitleQueue.current = [];
      startTimeRef.current = null;
      setActiveSubtitle(null);
      setSubtitles([]);
      
      setState(SUBTITLE_STATE.IDLE);
      logger.log("[RealTimeSubtitleContext] All services stopped");
      
    } catch (error) {
      logger.error("[RealTimeSubtitleContext] Error stopping services:", error);
    }
  }, []);
  
  // Toggle subtitle feature
  const toggleSubtitles = useCallback((enabled) => {
    if (enabled) {
      startAllServices();
    } else {
      stopAllServices();
    }
    setIsEnabled(enabled);
  }, [startAllServices, stopAllServices]);
  
  // Toggle AR mode
  const toggleARMode = useCallback((enabled) => {
    setIsARMode(enabled);
  }, []);
  
  // Change language
  const changeLanguage = useCallback((language) => {
    setCurrentLanguage(language);
    translationService.setTargetLanguage(language);
    
    // If i18n is available, change the app language too
    if (i18n.changeLanguage) {
      i18n.changeLanguage(language);
    }
  }, [i18n]);
  
  // Change source language
  const changeSourceLanguage = useCallback((language) => {
    setSourceLanguage(language);
    transcriptionService.setLanguage(language);
    translationService.setSourceLanguage(language);
  }, []);
  
  // Update display settings
  const updateDisplaySettings = useCallback((settings) => {
    setDisplaySettings(prev => ({
      ...prev,
      ...settings,
    }));
  }, []);
  
  // Update AR settings
  const updateArSettings = useCallback((settings) => {
    setArSettings(prev => ({
      ...prev,
      ...settings,
    }));
  }, []);
  
  // Get subtitle by ID
  const getSubtitleById = useCallback((id) => {
    return [...subtitles, ...history].find(sub => sub.id === id) || null;
  }, [subtitles, history]);
  
  // Get current subtitles (active and queued)
  const getCurrentSubtitles = useCallback(() => {
    return [...subtitles, ...(subtitleQueue.current || [])];
  }, [subtitles]);
  
  // Get statistics
  const getStats = useCallback(() => {
    return {
      ...stats,
      state,
      isEnabled,
      currentLanguage,
      sourceLanguage,
      queueSize: subtitleQueue.current.length,
      subtitleCount: subtitles.length,
      historyCount: history.length,
    };
  }, [stats, state, isEnabled, currentLanguage, sourceLanguage, subtitles, history]);
  
  // Check if subtitles are active
  const isActive = useMemo(() => {
    return state === SUBTITLE_STATE.ACTIVE && isEnabled;
  }, [state, isEnabled]);
  
  // Get service states
  const getServiceStates = useCallback(() => {
    return {
      audio: audioCaptureService.getState(),
      transcription: transcriptionService.getState(),
      translation: translationService.getState(),
    };
  }, []);
  
  // Get combined service stats
  const getServiceStats = useCallback(() => {
    return {
      audio: audioCaptureService.getStats(),
      transcription: transcriptionService.getStats(),
      translation: translationService.getStats(),
    };
  }, []);
  
  // Clear all subtitles
  const clearSubtitles = useCallback(() => {
    subtitleQueue.current = [];
    setSubtitles([]);
    setActiveSubtitle(null);
  }, []);
  
  // Reset all services
  const resetServices = useCallback(() => {
    stopAllServices();
    startTimeRef.current = null;
    latencyMeasurements.current = [];
    setStats({
      totalSubtitles: 0,
      displayedSubtitles: 0,
      averageLatency: 0,
      lastLatency: 0,
      errors: 0,
    });
  }, [stopAllServices]);
  
  // Context value
  const contextValue = useMemo(() => ({
    // State
    state,
    isEnabled,
    isARMode,
    isActive,
    
    // Subtitles
    subtitles,
    activeSubtitle,
    history,
    
    // Settings
    currentLanguage,
    sourceLanguage,
    displaySettings,
    arSettings,
    
    // Stats
    stats,
    
    // Methods
    toggleSubtitles,
    toggleARMode,
    changeLanguage,
    changeSourceLanguage,
    updateDisplaySettings,
    updateArSettings,
    getSubtitleById,
    getCurrentSubtitles,
    getStats,
    getServiceStates,
    getServiceStats,
    clearSubtitles,
    resetServices,
    
    // Services (for advanced use cases)
    audioCaptureService,
    transcriptionService,
    translationService,
  }), [
    state,
    isEnabled,
    isARMode,
    isActive,
    subtitles,
    activeSubtitle,
    history,
    currentLanguage,
    sourceLanguage,
    displaySettings,
    arSettings,
    stats,
    toggleSubtitles,
    toggleARMode,
    changeLanguage,
    changeSourceLanguage,
    updateDisplaySettings,
    updateArSettings,
    getSubtitleById,
    getCurrentSubtitles,
    getStats,
    getServiceStates,
    getServiceStats,
    clearSubtitles,
    resetServices,
  ]);
  
  return (
    <RealTimeSubtitleContext.Provider value={contextValue}>
      {children}
    </RealTimeSubtitleContext.Provider>
  );
}

/**
 * Hook to use real-time subtitles
 */
export function useRealTimeSubtitles() {
  const context = useContext(RealTimeSubtitleContext);
  
  if (!context) {
    throw new Error("useRealTimeSubtitles must be used within a RealTimeSubtitleProvider");
  }
  
  return context;
}

/**
 * Hook to use active subtitle
 */
export function useActiveSubtitle() {
  const { activeSubtitle, subtitles, isActive } = useRealTimeSubtitles();
  
  return useMemo(() => {
    if (activeSubtitle) {
      return activeSubtitle;
    }
    
    // If no active subtitle, return the most recent one that should be displayed
    const now = Date.now();
    const displayedSubtitles = subtitles.filter(sub => sub.shouldDisplay(now));
    
    return displayedSubtitles[displayedSubtitles.length - 1] || null;
  }, [activeSubtitle, subtitles, isActive]);
}

/**
 * Hook to use subtitle list
 */
export function useSubtitleList() {
  const { subtitles, getCurrentSubtitles } = useRealTimeSubtitles();
  
  return useMemo(() => {
    return getCurrentSubtitles();
  }, [subtitles, getCurrentSubtitles]);
}

/**
 * Hook to use subtitle controls
 */
export function useSubtitleControls() {
  const {
    isEnabled,
    isARMode,
    isActive,
    toggleSubtitles,
    toggleARMode,
    changeLanguage,
    changeSourceLanguage,
    clearSubtitles,
    resetServices,
  } = useRealTimeSubtitles();
  
  return {
    isEnabled,
    isARMode,
    isActive,
    toggleSubtitles,
    toggleARMode,
    changeLanguage,
    changeSourceLanguage,
    clearSubtitles,
    resetServices,
  };
}

/**
 * Hook to use subtitle settings
 */
export function useSubtitleSettings() {
  const {
    currentLanguage,
    sourceLanguage,
    displaySettings,
    arSettings,
    updateDisplaySettings,
    updateArSettings,
  } = useRealTimeSubtitles();
  
  return {
    currentLanguage,
    sourceLanguage,
    displaySettings,
    arSettings,
    updateDisplaySettings,
    updateArSettings,
  };
}

/**
 * Hook to use subtitle statistics
 */
export function useSubtitleStats() {
  const { stats, getServiceStats } = useRealTimeSubtitles();
  
  return {
    stats,
    getServiceStats,
  };
}

// Export components
export { RealTimeSubtitleContext };

export default RealTimeSubtitleProvider;
