/**
 * Transcription Service for Real-Time Multilingual AR Subtitles
 * 
 * This service handles:
 * - Speech-to-text transcription using external APIs
 * - Audio preprocessing and format conversion
 * - Chunking and buffering for optimal transcription accuracy
 * - Integration with audio capture service
 * - Support for multiple transcription providers
 */

import { logger } from "../utils/logger.js";
import { audioCaptureService, AUDIO_CONFIG } from "./audioCaptureService.js";

/**
 * Transcription service configuration
 */
export const TRANSCRIPTION_CONFIG = {
  // Supported transcription providers
  PROVIDERS: {
    WHISPER: "whisper",
    GOOGLE: "google",
    AZURE: "azure",
    AWS: "aws",
    LOCAL: "local", // For offline/edge transcription
  },
  
  // Default provider
  DEFAULT_PROVIDER: "whisper",
  
  // Audio format for API requests
  AUDIO_FORMAT: "wav", // or "mp3", "ogg", "webm"
  SAMPLE_RATE: 16000, // 16kHz
  BITS_PER_SAMPLE: 16,
  CHANNELS: 1,
  
  // Chunking configuration
  CHUNK_DURATION_MS: 100, // Match audio capture chunk duration
  MAX_CHUNK_DURATION_MS: 1000, // Maximum chunk size for transcription
  OVERLAP_DURATION_MS: 50, // Overlap between chunks for context
  
  // API configuration
  API_TIMEOUT_MS: 5000, // Timeout for API requests
  MAX_RETRIES: 3,
  
  // Language detection
  ENABLE_AUTO_LANGUAGE_DETECTION: true,
  DEFAULT_LANGUAGE: "en", // Fallback language
  
  // Confidence thresholds
  MIN_CONFIDENCE: 0.7,
};

/**
 * Transcription states
 */
export const TRANSCRIPTION_STATE = {
  IDLE: "idle",
  PROCESSING: "processing",
  ACTIVE: "active",
  ERROR: "error",
  UNSUPPORTED: "unsupported",
};

/**
 * Transcription result structure
 */
export class TranscriptionResult {
  constructor(data) {
    this.text = data.text || "";
    this.confidence = data.confidence || 0;
    this.language = data.language || TRANSCRIPTION_CONFIG.DEFAULT_LANGUAGE;
    this.timestamp = data.timestamp || Date.now();
    this.duration = data.duration || 0;
    this.provider = data.provider || TRANSCRIPTION_CONFIG.DEFAULT_PROVIDER;
    this.rawData = data.rawData || null;
  }
  
  toJSON() {
    return {
      text: this.text,
      confidence: this.confidence,
      language: this.language,
      timestamp: this.timestamp,
      duration: this.duration,
      provider: this.provider,
    };
  }
}

/**
 * Transcription Service Class
 * 
 * Handles real-time speech-to-text transcription with support for multiple providers.
 */
class TranscriptionService {
  constructor() {
    this.state = TRANSCRIPTION_STATE.IDLE;
    this.provider = TRANSCRIPTION_CONFIG.DEFAULT_PROVIDER;
    this.language = TRANSCRIPTION_CONFIG.DEFAULT_LANGUAGE;
    this.audioBuffer = [];
    this.isProcessing = false;
    this.onTranscriptionCallback = null;
    this.onStateChangeCallback = null;
    this.onErrorCallback = null;
    this.lastTranscription = null;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalProcessingTime: 0,
      lastProcessingTime: 0,
    };
  }

  /**
   * Initialize the transcription service
   * @param {Object} config - Configuration options
   * @param {string} config.provider - Transcription provider to use
   * @param {string} config.language - Default language for transcription
   */
  init(config = {}) {
    if (config.provider) {
      this.provider = config.provider;
    }
    if (config.language) {
      this.language = config.language;
    }
    
    this.state = TRANSCRIPTION_STATE.IDLE;
    logger.log(`[TranscriptionService] Initialized with provider: ${this.provider}, language: ${this.language}`);
  }

  /**
   * Set the transcription provider
   * @param {string} provider - Provider name
   */
  setProvider(provider) {
    if (TRANSCRIPTION_CONFIG.PROVIDERS[provider.toUpperCase()]) {
      this.provider = provider.toLowerCase();
      logger.log(`[TranscriptionService] Provider set to: ${this.provider}`);
    } else {
      logger.warn(`[TranscriptionService] Unknown provider: ${provider}. Using default: ${this.provider}`);
    }
  }

  /**
   * Set the language for transcription
   * @param {string} language - Language code (e.g., "en", "es", "fr")
   */
  setLanguage(language) {
    this.language = language;
    logger.log(`[TranscriptionService] Language set to: ${this.language}`);
  }

  /**
   * Set callback for transcription results
   * @param {Function} callback - Function to call with transcription results
   */
  setOnTranscription(callback) {
    this.onTranscriptionCallback = callback;
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
   * Start transcription
   * Sets up audio capture and starts processing
   */
  async start() {
    if (this.state === TRANSCRIPTION_STATE.ACTIVE) {
      logger.warn("[TranscriptionService] Transcription already active");
      return;
    }

    this.state = TRANSCRIPTION_STATE.PROCESSING;
    this.notifyStateChange();
    
    try {
      // Set up audio capture callback
      audioCaptureService.setOnAudioData((audioData) => {
        this.handleAudioData(audioData);
      });
      
      // Start audio capture
      await audioCaptureService.start();
      
      this.state = TRANSCRIPTION_STATE.ACTIVE;
      this.notifyStateChange();
      logger.log("[TranscriptionService] Transcription started");
      
    } catch (error) {
      this.state = TRANSCRIPTION_STATE.ERROR;
      this.notifyStateChange();
      this.notifyError(error);
      throw error;
    }
  }

  /**
   * Stop transcription
   */
  stop() {
    if (this.state === TRANSCRIPTION_STATE.IDLE) return;
    
    audioCaptureService.stop();
    this.audioBuffer = [];
    this.isProcessing = false;
    
    this.state = TRANSCRIPTION_STATE.IDLE;
    this.notifyStateChange();
    logger.log("[TranscriptionService] Transcription stopped");
  }

  /**
   * Pause transcription
   */
  pause() {
    audioCaptureService.pause();
    this.state = TRANSCRIPTION_STATE.IDLE;
    this.notifyStateChange();
  }

  /**
   * Resume transcription
   */
  resume() {
    audioCaptureService.resume();
    this.state = TRANSCRIPTION_STATE.ACTIVE;
    this.notifyStateChange();
  }

  /**
   * Handle audio data from capture service
   * @param {TypedArray} audioData - Audio data (Int16Array from audio capture)
   */
  handleAudioData(audioData) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      // Add audio data to buffer
      this.audioBuffer.push({
        data: audioData,
        timestamp: Date.now(),
      });
      
      // Check if we have enough data to send for transcription
      const expectedSamplesPerChunk = 
        (TRANSCRIPTION_CONFIG.CHUNK_DURATION_MS / 1000) * 
        AUDIO_CONFIG.AUDIO_CONSTRAINTS.audio.sampleRate;
      
      // Calculate total samples in buffer
      let totalSamples = 0;
      for (const chunk of this.audioBuffer) {
        totalSamples += chunk.data.length;
      }
      
      // If we have enough samples, process the buffer
      if (totalSamples >= expectedSamplesPerChunk) {
        this.processBuffer();
      }
      
      this.stats.lastProcessingTime = Date.now() - startTime;
      
    } catch (error) {
      logger.error("[TranscriptionService] Error handling audio data:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process the audio buffer and send for transcription
   */
  async processBuffer() {
    if (this.audioBuffer.length === 0) return;
    
    try {
      // Combine audio chunks into a single array
      const allSamples = this.concatAudioChunks();
      
      // Convert to WAV format for API
      const wavData = this.encodeToWAV(allSamples, AUDIO_CONFIG.AUDIO_CONSTRAINTS.audio.sampleRate);
      
      // Clear buffer (keep the last chunk for overlap)
      const lastChunk = this.audioBuffer[this.audioBuffer.length - 1];
      this.audioBuffer = [lastChunk];
      
      // Send to transcription API
      this.stats.totalRequests++;
      const startTime = Date.now();
      
      const result = await this.transcribeAudio(wavData);
      
      this.stats.successfulRequests++;
      this.stats.totalProcessingTime += Date.now() - startTime;
      this.stats.lastProcessingTime = Date.now() - startTime;
      
      // Create transcription result
      this.lastTranscription = new TranscriptionResult({
        text: result.text,
        confidence: result.confidence || 1.0,
        language: result.language || this.language,
        provider: this.provider,
        rawData: result,
      });
      
      // Notify callback
      if (this.onTranscriptionCallback) {
        this.onTranscriptionCallback(this.lastTranscription);
      }
      
    } catch (error) {
      this.stats.failedRequests++;
      logger.error("[TranscriptionService] Error processing buffer:", error);
      this.notifyError(error);
    }
  }

  /**
   * Concatenate audio chunks into a single array
   * @returns {Int16Array} Combined audio data
   */
  concatAudioChunks() {
    // Calculate total length
    let totalLength = 0;
    for (const chunk of this.audioBuffer) {
      totalLength += chunk.data.length;
    }
    
    // Create combined array
    const combined = new Int16Array(totalLength);
    let offset = 0;
    for (const chunk of this.audioBuffer) {
      combined.set(chunk.data, offset);
      offset += chunk.data.length;
    }
    
    return combined;
  }

  /**
   * Encode audio data to WAV format
   * @param {Int16Array} samples - Audio samples
   * @param {number} sampleRate - Sample rate
   * @returns {ArrayBuffer} WAV encoded data
   */
  encodeToWAV(samples, sampleRate = 16000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    // RIFF identifier
    this.writeString(view, 0, "RIFF");
    // File size (RIFF chunk size)
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    this.writeString(view, 8, "WAVE");
    
    // Format chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    
    // Data chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true); // Chunk size
    
    // Audio data
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(44 + i * 2, samples[i], true);
    }
    
    return buffer;
  }

  /**
   * Write a string to DataView
   * @param {DataView} view - DataView to write to
   * @param {number} offset - Offset to start writing
   * @param {string} string - String to write
   */
  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Transcribe audio using the selected provider
   * @param {ArrayBuffer} audioData - Audio data in WAV format
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioData) {
    // Base64 encode the audio data for API
    const base64Audio = this.arrayBufferToBase64(audioData);
    
    // Call the appropriate provider
    switch (this.provider) {
      case TRANSCRIPTION_CONFIG.PROVIDERS.WHISPER:
        return this.transcribeWithWhisper(base64Audio);
      case TRANSCRIPTION_CONFIG.PROVIDERS.GOOGLE:
        return this.transcribeWithGoogle(base64Audio);
      case TRANSCRIPTION_CONFIG.PROVIDERS.AZURE:
        return this.transcribeWithAzure(base64Audio);
      case TRANSCRIPTION_CONFIG.PROVIDERS.AWS:
        return this.transcribeWithAWS(base64Audio);
      case TRANSCRIPTION_CONFIG.PROVIDERS.LOCAL:
        return this.transcribeWithLocal(base64Audio);
      default:
        return this.transcribeWithWhisper(base64Audio);
    }
  }

  /**
   * Transcribe using Whisper API
   * @param {string} base64Audio - Base64 encoded audio
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeWithWhisper(base64Audio) {
    // This is a placeholder for actual API call
    // In production, you would call a Whisper API endpoint
    
    // Simulate API call with mock response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock transcription - in real implementation, call actual API
        // For demo purposes, return mock data
        resolve({
          text: this.generateMockTranscription(),
          confidence: 0.95,
          language: this.language,
        });
      }, 200); // Simulate network latency
    });
  }

  /**
   * Transcribe using Google Cloud Speech-to-Text API
   * @param {string} base64Audio - Base64 encoded audio
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeWithGoogle(base64Audio) {
    // Placeholder for Google API implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: this.generateMockTranscription(),
          confidence: 0.92,
          language: this.language,
        });
      }, 300);
    });
  }

  /**
   * Transcribe using Azure Cognitive Services
   * @param {string} base64Audio - Base64 encoded audio
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeWithAzure(base64Audio) {
    // Placeholder for Azure API implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: this.generateMockTranscription(),
          confidence: 0.90,
          language: this.language,
        });
      }, 250);
    });
  }

  /**
   * Transcribe using AWS Transcribe
   * @param {string} base64Audio - Base64 encoded audio
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeWithAWS(base64Audio) {
    // Placeholder for AWS API implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: this.generateMockTranscription(),
          confidence: 0.88,
          language: this.language,
        });
      }, 350);
    });
  }

  /**
   * Transcribe using local/edge model
   * @param {string} base64Audio - Base64 encoded audio
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeWithLocal(base64Audio) {
    // Placeholder for local transcription using WebAssembly or ONNX
    // This could use models like Whisper.cpp compiled to WebAssembly
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: this.generateMockTranscription(),
          confidence: 0.85,
          language: this.language,
        });
      }, 500); // Local processing might be slower
    });
  }

  /**
   * Generate mock transcription text for demo purposes
   * @returns {string} Mock transcription text
   */
  generateMockTranscription() {
    const mockTexts = [
      "Hello everyone, welcome to Eventra!",
      "Today we have an amazing lineup of speakers.",
      "Let's get started with the first presentation.",
      "Thank you all for coming today.",
      "This is a demonstration of real-time transcription.",
      "The audio is being transcribed as I speak.",
      "Multilingual subtitles will appear shortly.",
      "Welcome to our international event.",
    ];
    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }

  /**
   * Convert ArrayBuffer to Base64 string
   * @param {ArrayBuffer} buffer - ArrayBuffer to convert
   * @returns {string} Base64 string
   */
  arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   * @param {string} base64 - Base64 string
   * @returns {ArrayBuffer} Decoded ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get the last transcription result
   * @returns {TranscriptionResult|null} Last transcription result
   */
  getLastTranscription() {
    return this.lastTranscription;
  }

  /**
   * Get transcription statistics
   * @returns {Object} Transcription statistics
   */
  getStats() {
    const avgProcessingTime = this.stats.totalRequests > 0
      ? this.stats.totalProcessingTime / this.stats.totalRequests
      : 0;
    
    return {
      ...this.stats,
      averageProcessingTime: avgProcessingTime,
      provider: this.provider,
      language: this.language,
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
        logger.error("[TranscriptionService] Error in state change callback:", error);
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
        logger.error("[TranscriptionService] Error in error callback:", callbackError);
      }
    }
  }
}

// Singleton instance
export const transcriptionService = new TranscriptionService();

export default transcriptionService;
