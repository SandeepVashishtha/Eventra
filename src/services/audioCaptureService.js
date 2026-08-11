/**
 * Audio Capture Service for Real-Time Multilingual AR Subtitles
 * 
 * This service handles:
 * - Microphone access and audio stream capture
 * - Audio chunking and buffering for low-latency processing
 * - Integration with transcription service
 * - Error handling and device management
 */

import { logger } from "../utils/logger.js";

/**
 * Configuration for audio capture
 */
export const AUDIO_CONFIG = {
  // Audio constraints for getUserMedia
  AUDIO_CONSTRAINTS: {
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000, // 16kHz - good for speech
      sampleSize: 16,    // 16-bit samples
    },
  },
  
  // Audio processing parameters
  CHUNK_DURATION_MS: 100,    // Process audio in 100ms chunks for low latency
  BUFFER_SIZE: 4096,         // Browser audio buffer size
  MAX_RETRIES: 3,            // Max retries for microphone access
  
  // Target latency: <500ms from speech to subtitle display
  TARGET_LATENCY_MS: 500,
};

/**
 * Audio capture states
 */
export const AUDIO_CAPTURE_STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  ACTIVE: "active",
  PAUSED: "paused",
  ERROR: "error",
  UNSUPPORTED: "unsupported",
};

/**
 * Audio Capture Service Class
 * 
 * Manages microphone access and audio stream processing for real-time transcription.
 */
class AudioCaptureService {
  constructor() {
    this.state = AUDIO_CAPTURE_STATE.IDLE;
    this.mediaStream = null;
    this.audioContext = null;
    this.processor = null;
    this.analyser = null;
    this audioChunks = [];
    this.isProcessing = false;
    this.deviceId = null;
    this.onAudioDataCallback = null;
    this.onStateChangeCallback = null;
    this.onErrorCallback = null;
    this.retryCount = 0;
    this.startTime = null;
    this.stats = {
      totalChunks: 0,
      processedChunks: 0,
      averageProcessingTime: 0,
      lastProcessingTime: 0,
    };
  }

  /**
   * Check if audio capture is supported in the current browser
   * @returns {boolean} True if supported
   */
  isSupported() {
    return (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined")
    );
  }

  /**
   * Get available audio input devices
   * @returns {Promise<Array<MediaDeviceInfo>>} List of available audio devices
   */
  async getAvailableDevices() {
    if (!this.isSupported()) {
      this.state = AUDIO_CAPTURE_STATE.UNSUPPORTED;
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === "audioinput");
    } catch (error) {
      logger.error("[AudioCaptureService] Error enumerating devices:", error);
      return [];
    }
  }

  /**
   * Set the audio input device by ID
   * @param {string} deviceId - The device ID to use
   */
  setDevice(deviceId) {
    this.deviceId = deviceId;
  }

  /**
   * Set callback for audio data chunks
   * @param {Function} callback - Function to call with audio data (Float32Array or ArrayBuffer)
   */
  setOnAudioData(callback) {
    this.onAudioDataCallback = callback;
  }

  /**
   * Set callback for state changes
   * @param {Function} callback - Function to call with new state
   */
  setOnStateChange(callback) {
    this.onStateChangeCallback = callback;
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Function to call with error information
   */
  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Start audio capture
   * @param {Object} options - Optional configuration
   * @param {string} options.deviceId - Specific device ID to use
   * @returns {Promise<void>}
   */
  async start(options = {}) {
    if (!this.isSupported()) {
      this.state = AUDIO_CAPTURE_STATE.UNSUPPORTED;
      this.notifyStateChange();
      throw new Error("Audio capture not supported in this browser");
    }

    if (this.state === AUDIO_CAPTURE_STATE.ACTIVE) {
      logger.warn("[AudioCaptureService] Audio capture already active");
      return;
    }

    this.state = AUDIO_CAPTURE_STATE.REQUESTING;
    this.notifyStateChange();

    try {
      // Set device if provided
      if (options.deviceId) {
        this.deviceId = options.deviceId;
      }

      // Get audio stream
      const constraints = {
        ...AUDIO_CONFIG.AUDIO_CONSTRAINTS,
        audio: {
          ...AUDIO_CONFIG.AUDIO_CONSTRAINTS.audio,
          deviceId: this.deviceId ? { exact: this.deviceId } : undefined,
        },
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create audio context and setup processing
      await this.setupAudioProcessing();
      
      this.state = AUDIO_CAPTURE_STATE.ACTIVE;
      this.startTime = Date.now();
      this.notifyStateChange();
      
      logger.log("[AudioCaptureService] Audio capture started successfully");
      
    } catch (error) {
      this.retryCount++;
      logger.error("[AudioCaptureService] Error starting audio capture:", error);
      
      if (this.retryCount < AUDIO_CONFIG.MAX_RETRIES) {
        // Retry after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.start(options);
      }
      
      this.state = AUDIO_CAPTURE_STATE.ERROR;
      this.notifyStateChange();
      this.notifyError(error);
      throw error;
    }
  }

  /**
   * Setup audio processing pipeline
   * @returns {Promise<void>}
   */
  async setupAudioProcessing() {
    try {
      // Create AudioContext (handle vendor prefixes)
      const AudioContextClass = 
        typeof AudioContext !== "undefined" 
          ? AudioContext 
          : typeof webkitAudioContext !== "undefined" 
            ? webkitAudioContext 
            : null;
      
      if (!AudioContextClass) {
        throw new Error("AudioContext not available");
      }

      this.audioContext = new AudioContextClass();
      
      // Create audio source from media stream
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create processor for audio data
      this.processor = this.audioContext.createScriptProcessor(
        AUDIO_CONFIG.BUFFER_SIZE,
        1,
        1
      );
      
      // Setup analyser for visualization (optional)
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Connect nodes: source -> analyser -> processor -> destination
      source.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      // Setup processor onaudioprocess callback
      this.processor.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer;
        const channelData = inputBuffer.getChannelData(0);
        
        // Process audio chunks at configured interval
        this.processAudioChunk(channelData);
      };
      
      // Resume audio context (required in some browsers)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      
    } catch (error) {
      logger.error("[AudioCaptureService] Error setting up audio processing:", error);
      throw error;
    }
  }

  /**
   * Process audio chunk
   * @param {Float32Array} channelData - Audio data for one channel
   */
  processAudioChunk(channelData) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      // Clone the data to work with it
      const chunk = new Float32Array(channelData.length);
      chunk.set(channelData);
      
      // Add to chunks array
      this.audioChunks.push(chunk);
      
      // Check if we have enough data for a complete chunk
      const expectedSamples = 
        (AUDIO_CONFIG.CHUNK_DURATION_MS / 1000) * 
        AUDIO_CONFIG.AUDIO_CONSTRAINTS.audio.sampleRate;
      
      // For simplicity, we'll process each buffer as a chunk
      // In production, you might want to accumulate multiple buffers
      
      this.stats.totalChunks++;
      
      // If we have a callback, send the audio data
      if (this.onAudioDataCallback) {
        // Convert to 16-bit PCM for easier processing
        const pcmData = this.float32ToInt16(chunk);
        this.onAudioDataCallback(pcmData);
        this.stats.processedChunks++;
      }
      
      this.stats.lastProcessingTime = Date.now() - startTime;
      
    } catch (error) {
      logger.error("[AudioCaptureService] Error processing audio chunk:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Convert Float32Array to Int16Array (16-bit PCM)
   * @param {Float32Array} float32Array - Input audio data
   * @returns {Int16Array} Converted PCM data
   */
  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp and convert to 16-bit integer
      let value = float32Array[i] * 32767.5; // 32767.5 = 2^15 - 0.5
      value = Math.max(-32768, Math.min(32767, value));
      int16Array[i] = Math.round(value);
    }
    return int16Array;
  }

  /**
   * Convert Int16Array to Float32Array
   * @param {Int16Array} int16Array - Input PCM data
   * @returns {Float32Array} Converted audio data
   */
  int16ToFloat32(int16Array) {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32767.5;
    }
    return float32Array;
  }

  /**
   * Pause audio capture
   */
  pause() {
    if (this.state !== AUDIO_CAPTURE_STATE.ACTIVE) return;
    
    this.state = AUDIO_CAPTURE_STATE.PAUSED;
    this.notifyStateChange();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.enabled = false;
      });
    }
    
    logger.log("[AudioCaptureService] Audio capture paused");
  }

  /**
   * Resume audio capture after pause
   */
  resume() {
    if (this.state !== AUDIO_CAPTURE_STATE.PAUSED) return;
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.enabled = true;
      });
    }
    
    this.state = AUDIO_CAPTURE_STATE.ACTIVE;
    this.notifyStateChange();
    
    logger.log("[AudioCaptureService] Audio capture resumed");
  }

  /**
   * Stop audio capture and clean up resources
   */
  stop() {
    if (this.state === AUDIO_CAPTURE_STATE.IDLE) return;
    
    // Stop all tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
    }
    
    // Clean up audio context
    if (this.audioContext) {
      this.audioContext.close().catch(err => {
        logger.error("[AudioCaptureService] Error closing audio context:", err);
      });
      this.audioContext = null;
    }
    
    // Clean up processor
    if (this.processor) {
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    
    this.audioChunks = [];
    this.state = AUDIO_CAPTURE_STATE.IDLE;
    this.retryCount = 0;
    this.startTime = null;
    this.notifyStateChange();
    
    logger.log("[AudioCaptureService] Audio capture stopped");
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get audio statistics
   * @returns {Object} Audio processing statistics
   */
  getStats() {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;
    return {
      ...this.stats,
      uptime,
      state: this.state,
      deviceId: this.deviceId,
      hasMediaStream: !!this.mediaStream,
    };
  }

  /**
   * Notify state change to listeners
   */
  notifyStateChange() {
    if (this.onStateChangeCallback) {
      try {
        this.onStateChangeCallback(this.state);
      } catch (error) {
        logger.error("[AudioCaptureService] Error in state change callback:", error);
      }
    }
  }

  /**
   * Notify error to listeners
   * @param {Error} error - The error to notify
   */
  notifyError(error) {
    if (this.onErrorCallback) {
      try {
        this.onErrorCallback(error);
      } catch (callbackError) {
        logger.error("[AudioCaptureService] Error in error callback:", callbackError);
      }
    }
  }

  /**
   * Get audio level (volume) from analyser
   * @returns {number|null} Current audio level (0-1) or null if not available
   */
  getAudioLevel() {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    
    return sum / (bufferLength * 255);
  }
}

// Singleton instance
export const audioCaptureService = new AudioCaptureService();

export default audioCaptureService;
