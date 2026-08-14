/**
 * LiveSubtitlesOverlay Component
 * Real-Time WebNN-Driven Live Video Captioning Overlay
 * 
 * Features:
 * - Client-side WebNN audio stream processing
 * - Dynamic, low-latency subtitle rendering over HTML5 video
 * - Multi-language support with customizable display
 * - Accessibility-focused design
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClosedCaptioning, Volume2, AlertCircle, Settings, X } from 'lucide-react';
import { WebNNTranscriptionModel, captureAudioFromVideo, SUPPORTED_TRANSCRIPTION_LANGUAGES } from '../../../../utils/ai/captions/audioTranscriptionModel';

// Lazy load the config panel to avoid circular dependencies
const CaptionsConfigPanel = lazy(() => import('./CaptionsConfigPanel'));

/**
 * Default subtitle display configuration
 */
const DEFAULT_SUBTITLE_CONFIG = {
  enabled: true,
  language: 'en-US',
  fontSize: 'medium',
  fontColor: '#FFFFFF',
  bgColor: 'rgba(0, 0, 0, 0.7)',
  position: 'bottom',
  maxLines: 3,
  showSpeaker: false,
  showConfidence: false,
  animation: 'fade',
  lineHeight: 1.5,
  padding: '0.75rem',
};

/**
 * Font size options with Tailwind classes
 */
const FONT_SIZE_OPTIONS = {
  small: 'text-sm md:text-base',
  medium: 'text-base md:text-lg',
  large: 'text-lg md:text-xl',
  xlarge: 'text-xl md:text-2xl',
};

/**
 * Subtitle position classes
 */
const POSITION_CLASSES = {
  bottom: 'bottom-4 left-0 right-0',
  top: 'top-4 left-0 right-0',
  bottomLeft: 'bottom-4 left-4',
  bottomRight: 'bottom-4 right-4',
};

/**
 * Animation variants for subtitle transitions
 */
const animationVariants = {
  fade: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slide: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

/**
 * LiveSubtitlesOverlay Component
 * 
 * Renders real-time subtitles over a video element using WebNN transcription
 * 
 * @param {Object} props - Component props
 * @param {HTMLVideoElement} props.videoElement - Reference to the video element
 * @param {boolean} props.enabled - Whether subtitles are enabled
 * @param {Object} props.config - Subtitle configuration
 * @param {function} props.onToggle - Callback when subtitles are toggled
 * @param {function} props.onConfigChange - Callback when configuration changes
 */
const LiveSubtitlesOverlay = React.forwardRef(({
  videoElement,
  enabled: externalEnabled = true,
  config: externalConfig = {},
  onToggle,
  onConfigChange,
  className = '',
  style = {},
}, ref) => {
  // State for subtitle text
  const [subtitles, setSubtitles] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(null);
  
  // State for configuration
  const [config, setConfig] = useState({
    ...DEFAULT_SUBTITLE_CONFIG,
    ...externalConfig,
  });
  
  // Internal enabled state (combined with external)
  const [internalEnabled, setInternalEnabled] = useState(externalEnabled);
  const isEnabled = internalEnabled && externalEnabled;
  
  // State for configuration panel
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
  // Refs
  const subtitleContainerRef = useRef(null);
  const transcriptionModelRef = useRef(null);
  const audioStreamRef = useRef(null);
  
  // Memoized subtitle styles
  const subtitleStyle = useMemo(() => ({
    color: config.fontColor,
    backgroundColor: config.bgColor,
    fontSize: config.fontSize === 'small' ? '0.875rem' :
              config.fontSize === 'medium' ? '1rem' :
              config.fontSize === 'large' ? '1.125rem' : '1.25rem',
    lineHeight: config.lineHeight,
    padding: config.padding,
    borderRadius: '0.5rem',
    ...style,
  }), [config, style]);
  
  // Memoized animation
  const animation = useMemo(() => (
    animationVariants[config.animation] || animationVariants.fade
  ), [config.animation]);

  /**
   * Handle transcript from WebNN model
   */
  const handleTranscript = useCallback((result) => {
    if (!isEnabled) return;

    const { transcript, confidence, timestamp, isFinal } = result;
    
    if (!transcript || transcript.trim() === '') return;

    // Update interim or final transcript
    if (isFinal) {
      setSubtitles(prev => {
        const newSubtitles = [...prev, {
          text: transcript,
          confidence,
          timestamp,
          isFinal: true,
        }];
        
        // Limit to max lines
        if (newSubtitles.length > config.maxLines) {
          return newSubtitles.slice(-config.maxLines);
        }
        
        return newSubtitles;
      });
      setCurrentTranscript(transcript);
      setInterimTranscript('');
    } else {
      setInterimTranscript(transcript);
    }
  }, [isEnabled, config.maxLines]);

  /**
   * Handle transcription errors
   */
  const handleTranscriptError = useCallback((error) => {
    setHasError(error);
    console.error('[LiveSubtitlesOverlay] Transcription error:', error);
  }, []);

  /**
   * Initialize transcription model
   */
  const initTranscriptionModel = useCallback(async () => {
    if (!isEnabled || !videoElement) return;

    try {
      setIsProcessing(true);
      setHasError(null);

      // Clean up existing model
      if (transcriptionModelRef.current) {
        await transcriptionModelRef.current.destroy();
        transcriptionModelRef.current = null;
      }

      // Stop existing audio stream
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }

      // Create new transcription model
      const model = new WebNNTranscriptionModel({
        language: config.language,
        onTranscript: handleTranscript,
        onError: handleTranscriptError,
      });

      await model.init();
      transcriptionModelRef.current = model;

      // Capture audio from video element
      const audioStream = await captureAudioFromVideo(videoElement, {
        frameRate: 30,
      });
      audioStreamRef.current = audioStream;

      // Start audio capture
      await model.startCapture(audioStream);

      console.log('[LiveSubtitlesOverlay] Transcription started');
    } catch (error) {
      setHasError(error.message || 'Failed to start transcription');
      console.error('[LiveSubtitlesOverlay] Failed to initialize transcription:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isEnabled, videoElement, config.language, handleTranscript, handleTranscriptError]);

  /**
   * Stop transcription
   */
  const stopTranscription = useCallback(async () => {
    if (transcriptionModelRef.current) {
      try {
        await transcriptionModelRef.current.stopCapture();
        await transcriptionModelRef.current.destroy();
        transcriptionModelRef.current = null;
      } catch (error) {
        console.error('[LiveSubtitlesOverlay] Error stopping transcription:', error);
      }
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    setIsProcessing(false);
    setSubtitles([]);
    setCurrentTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Toggle subtitles on/off
   */
  const toggleSubtitles = useCallback(() => {
    const newEnabled = !internalEnabled;
    setInternalEnabled(newEnabled);
    
    if (newEnabled) {
      initTranscriptionModel();
    } else {
      stopTranscription();
    }

    if (onToggle) {
      onToggle(newEnabled);
    }
  }, [internalEnabled, initTranscriptionModel, stopTranscription, onToggle]);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    if (onConfigChange) {
      onConfigChange(updatedConfig);
    }

    // If language changed, update transcription model
    if (newConfig.language && transcriptionModelRef.current) {
      transcriptionModelRef.current.setLanguage(newConfig.language);
    }
  }, [config, onConfigChange]);

  /**
   * Clear subtitles
   */
  const clearSubtitles = useCallback(() => {
    setSubtitles([]);
    setCurrentTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Toggle configuration panel
   */
  const toggleConfigPanel = useCallback(() => {
    setShowConfigPanel(prev => !prev);
  }, []);

  // Effect: Initialize and clean up transcription
  useEffect(() => {
    if (isEnabled && videoElement) {
      initTranscriptionModel();
    } else {
      stopTranscription();
    }

    return () => {
      stopTranscription();
    };
  }, [isEnabled, videoElement, initTranscriptionModel, stopTranscription, config.language]);

  // Effect: Handle external enabled changes
  useEffect(() => {
    if (externalEnabled !== internalEnabled) {
      setInternalEnabled(externalEnabled);
    }
  }, [externalEnabled]);

  // Effect: Handle external config changes
  useEffect(() => {
    if (externalConfig && Object.keys(externalConfig).length > 0) {
      setConfig(prev => ({ ...prev, ...externalConfig }));
    }
  }, [externalConfig]);

  // Render subtitle lines
  const renderSubtitles = () => {
    const allLines = [...subtitles, { text: interimTranscript, isFinal: false }].filter(
      line => line.text && line.text.trim() !== ''
    );

    return allLines.map((line, index) => (
      <motion.div
        key={`${line.text}-${index}-${line.timestamp || Date.now()}`}
        variants={animation}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`break-words ${line.isFinal ? 'font-semibold' : 'font-normal opacity-75'}`}
      >
        {line.text}
        {config.showConfidence && line.confidence && (
          <span className="ml-2 text-xs opacity-60">
            ({Math.round(line.confidence * 100)}%)
          </span>
        )}
      </motion.div>
    ));
  };

  // Render error state
  const renderErrorState = () => (
    <motion.div
      variants={animation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center gap-2 text-red-400 bg-red-900/50 p-3 rounded-lg"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span>{hasError}</span>
      <button
        onClick={() => setHasError(null)}
        className="ml-auto text-red-300 hover:text-red-100 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <motion.div
      variants={animation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center gap-2 text-indigo-400 bg-indigo-900/50 p-3 rounded-lg"
    >
      <Volume2 className="w-5 h-5 flex-shrink-0 animate-pulse" />
      <span>Initializing WebNN transcription...</span>
    </motion.div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <motion.div
      variants={animation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center justify-center gap-2 text-gray-400/70 p-3 rounded-lg opacity-50"
    >
      <ClosedCaptioning className="w-5 h-5 flex-shrink-0" />
      <span>Live captions will appear here</span>
    </motion.div>
  );

  // Determine subtitle container position
  const positionClasses = POSITION_CLASSES[config.position] || POSITION_CLASSES.bottom;
  const fontSizeClasses = FONT_SIZE_OPTIONS[config.fontSize] || FONT_SIZE_OPTIONS.medium;

  // Check if we should show subtitles
  const hasSubtitles = subtitles.length > 0 || interimTranscript !== '';
  const showContent = hasError ? 'error' : isProcessing && !hasSubtitles ? 'loading' : hasSubtitles ? 'subtitles' : 'empty';

  return (
    <>
      {/* Main subtitle overlay */}
      <div
        ref={ref}
        className={`absolute ${positionClasses} pointer-events-none z-20 ${className}`}
        style={subtitleStyle}
        role="region"
        aria-label="Live subtitles"
        aria-live="polite"
      >
        <div className="max-w-full mx-auto">
          <div
            ref={subtitleContainerRef}
            className={`min-h-[3rem] max-w-4xl mx-auto ${fontSizeClasses}`}
          >
            <AnimatePresence mode="wait">
              {showContent === 'error' && renderErrorState()}
              {showContent === 'loading' && renderLoadingState()}
              {showContent === 'empty' && renderEmptyState()}
              {showContent === 'subtitles' && (
                <div className="space-y-1">
                  {renderSubtitles()}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Toggle button - positioned in the video player controls area */}
      <div className="absolute bottom-16 right-4 z-30">
        <button
          onClick={toggleConfigPanel}
          className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
            isEnabled 
              ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30' 
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70'
          }`}
          aria-label={isEnabled ? 'Configure captions' : 'Enable captions'}
          aria-pressed={isEnabled}
          title={isEnabled ? 'Configure captions' : 'Enable captions'}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Configuration panel */}
      <AnimatePresence>
        {showConfigPanel && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 z-50 max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800"
            role="dialog"
            aria-modal="true"
            aria-label="Caption settings"
          >
            <Suspense fallback={null}>
              <CaptionsConfigPanel
                config={config}
                onConfigChange={updateConfig}
                onClose={() => setShowConfigPanel(false)}
                enabled={isEnabled}
                onToggle={toggleSubtitles}
                languages={SUPPORTED_TRANSCRIPTION_LANGUAGES}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button for captions */}
      <div className="absolute bottom-16 left-4 z-30">
        <button
          onClick={toggleSubtitles}
          className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
            isEnabled 
              ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30' 
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70'
          }`}
          aria-label={isEnabled ? 'Disable captions' : 'Enable captions'}
          aria-pressed={isEnabled}
          title={isEnabled ? 'Disable captions' : 'Enable captions'}
        >
          <ClosedCaptioning className="w-5 h-5" />
        </button>
      </div>
    </>
  );
});

/**
 * Hook to create live subtitles for a video element
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} - Subtitle control functions and state
 */
export function useLiveSubtitles(options = {}) {
  const [subtitles, setSubtitles] = useState([]);
  const [isEnabled, setIsEnabled] = useState(options.enabled ?? true);
  const [config, setConfig] = useState({
    ...DEFAULT_SUBTITLE_CONFIG,
    ...options.config,
  });
  const transcriptionModelRef = useRef(null);

  const startSubtitles = useCallback(async (videoElement) => {
    if (!videoElement) return;

    try {
      const model = new WebNNTranscriptionModel({
        language: config.language,
        onTranscript: (result) => {
          if (result.transcript && result.transcript.trim()) {
            setSubtitles(prev => {
              const newSubtitles = [...prev, result];
              if (newSubtitles.length > config.maxLines) {
                return newSubtitles.slice(-config.maxLines);
              }
              return newSubtitles;
            });
          }
        },
        onError: (error) => {
          console.error('[useLiveSubtitles] Error:', error);
        },
      });

      await model.init();
      transcriptionModelRef.current = model;

      const audioStream = await captureAudioFromVideo(videoElement);
      await model.startCapture(audioStream);
    } catch (error) {
      console.error('[useLiveSubtitles] Failed to start:', error);
    }
  }, [config]);

  const stopSubtitles = useCallback(async () => {
    if (transcriptionModelRef.current) {
      await transcriptionModelRef.current.stopCapture();
      await transcriptionModelRef.current.destroy();
      transcriptionModelRef.current = null;
    }
    setSubtitles([]);
  }, []);

  const toggleSubtitles = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  useEffect(() => {
    return () => {
      stopSubtitles();
    };
  }, [stopSubtitles]);

  return {
    subtitles,
    isEnabled,
    config,
    startSubtitles,
    stopSubtitles,
    toggleSubtitles,
    updateConfig,
  };
}

LiveSubtitlesOverlay.displayName = 'LiveSubtitlesOverlay';

export default LiveSubtitlesOverlay;
