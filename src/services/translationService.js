/**
 * Translation Service for Real-Time Multilingual AR Subtitles
 * 
 * This service handles:
 * - Text translation using external LLM APIs
 * - Language detection and auto-selection
 * - Caching and optimization for real-time performance
 * - Support for multiple translation providers
 * - Context-aware translation for better accuracy
 */

import { logger } from "../utils/logger.js";
import { transcriptionService } from "./transcriptionService.js";

/**
 * Translation service configuration
 */
export const TRANSLATION_CONFIG = {
  // Supported translation providers
  PROVIDERS: {
    GOOGLE: "google",
    AZURE: "azure",
    AWS: "aws",
    DEEPL: "deepl",
    LOCAL_LLM: "local_llm", // For offline/edge LLM translation
    MOCK: "mock", // For development/testing
  },
  
  // Default provider
  DEFAULT_PROVIDER: "google",
  
  // Supported languages (ISO 639-1 codes)
  SUPPORTED_LANGUAGES: [
    "en", // English
    "es", // Spanish
    "fr", // French
    "de", // German
    "it", // Italian
    "pt", // Portuguese
    "ru", // Russian
    "zh", // Chinese
    "ja", // Japanese
    "ko", // Korean
    "ar", // Arabic
    "hi", // Hindi
    "bn", // Bengali
    "pa", // Punjabi
    "tr", // Turkish
    "nl", // Dutch
    "sv", // Swedish
    "fi", // Finnish
    "da", // Danish
    "no", // Norwegian
  ],
  
  // API configuration
  API_TIMEOUT_MS: 3000, // Timeout for API requests (must be <500ms for target)
  MAX_RETRIES: 2,
  BATCH_SIZE: 5, // Maximum sentences to translate in one batch
  
  // Caching configuration
  ENABLE_CACHING: true,
  CACHE_TTL_MS: 300000, // 5 minutes cache TTL
  MAX_CACHE_ENTRIES: 1000,
  
  // Context configuration
  USE_CONTEXT: true,
  CONTEXT_WINDOW_SIZE: 3, // Number of previous sentences to include as context
  
  // Target latency: <500ms total (including transcription)
  TARGET_TRANSLATION_LATENCY_MS: 200, // Translation should complete within 200ms
};

/**
 * Translation states
 */
export const TRANSLATION_STATE = {
  IDLE: "idle",
  PROCESSING: "processing",
  ACTIVE: "active",
  ERROR: "error",
  UNSUPPORTED: "unsupported",
};

/**
 * Translation result structure
 */
export class TranslationResult {
  constructor(data) {
    this.originalText = data.originalText || "";
    this.translatedText = data.translatedText || "";
    this.sourceLanguage = data.sourceLanguage || "en";
    this.targetLanguage = data.targetLanguage || "en";
    this.confidence = data.confidence || 0;
    this.timestamp = data.timestamp || Date.now();
    this.provider = data.provider || TRANSLATION_CONFIG.DEFAULT_PROVIDER;
    this.rawData = data.rawData || null;
  }
  
  toJSON() {
    return {
      originalText: this.originalText,
      translatedText: this.translatedText,
      sourceLanguage: this.sourceLanguage,
      targetLanguage: this.targetLanguage,
      confidence: this.confidence,
      timestamp: this.timestamp,
      provider: this.provider,
    };
  }
}

/**
 * Translation Service Class
 * 
 * Handles real-time text translation with support for multiple providers.
 */
class TranslationService {
  constructor() {
    this.state = TRANSLATION_STATE.IDLE;
    this.provider = TRANSLATION_CONFIG.DEFAULT_PROVIDER;
    this.sourceLanguage = "en"; // Auto-detected or set manually
    this.targetLanguage = "en"; // User's preferred language
    this.onTranslationCallback = null;
    this.onStateChangeCallback = null;
    this.onErrorCallback = null;
    this.lastTranslation = null;
    this.contextHistory = []; // Store recent translations for context
    this.cache = new Map(); // Translation cache
    this.isProcessing = false;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalProcessingTime: 0,
      lastProcessingTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Initialize the translation service
   * @param {Object} config - Configuration options
   * @param {string} config.provider - Translation provider to use
   * @param {string} config.sourceLanguage - Source language (optional, auto-detected)
   * @param {string} config.targetLanguage - Target language for translation
   */
  init(config = {}) {
    if (config.provider) {
      this.provider = config.provider;
    }
    if (config.sourceLanguage) {
      this.sourceLanguage = config.sourceLanguage;
    }
    if (config.targetLanguage) {
      this.setTargetLanguage(config.targetLanguage);
    }
    
    this.state = TRANSLATION_STATE.IDLE;
    logger.log(`[TranslationService] Initialized with provider: ${this.provider}, target: ${this.targetLanguage}`);
  }

  /**
   * Set the translation provider
   * @param {string} provider - Provider name
   */
  setProvider(provider) {
    if (TRANSLATION_CONFIG.PROVIDERS[provider.toUpperCase()]) {
      this.provider = provider.toLowerCase();
      logger.log(`[TranslationService] Provider set to: ${this.provider}`);
    } else {
      logger.warn(`[TranslationService] Unknown provider: ${provider}. Using default: ${this.provider}`);
    }
  }

  /**
   * Set the source language for translation
   * @param {string} language - Source language code
   */
  setSourceLanguage(language) {
    if (TRANSLATION_CONFIG.SUPPORTED_LANGUAGES.includes(language)) {
      this.sourceLanguage = language;
      logger.log(`[TranslationService] Source language set to: ${this.sourceLanguage}`);
    } else {
      logger.warn(`[TranslationService] Unsupported source language: ${language}`);
    }
  }

  /**
   * Set the target language for translation
   * @param {string} language - Target language code
   */
  setTargetLanguage(language) {
    if (TRANSLATION_CONFIG.SUPPORTED_LANGUAGES.includes(language)) {
      this.targetLanguage = language;
      logger.log(`[TranslationService] Target language set to: ${this.targetLanguage}`);
    } else {
      logger.warn(`[TranslationService] Unsupported target language: ${language}. Using English as fallback.`);
      this.targetLanguage = "en";
    }
  }

  /**
   * Set callback for translation results
   * @param {Function} callback - Function to call with translation results
   */
  setOnTranslation(callback) {
    this.onTranslationCallback = callback;
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
   * Start translation service
   * Sets up transcription callback and starts processing
   */
  async start() {
    if (this.state === TRANSLATION_STATE.ACTIVE) {
      logger.warn("[TranslationService] Translation already active");
      return;
    }

    this.state = TRANSLATION_STATE.PROCESSING;
    this.notifyStateChange();
    
    try {
      // Set up transcription callback
      transcriptionService.setOnTranscription((transcription) => {
        this.handleTranscription(transcription);
      });
      
      // Start transcription if not already running
      if (transcriptionService.getState() !== "active") {
        await transcriptionService.start();
      }
      
      this.state = TRANSLATION_STATE.ACTIVE;
      this.notifyStateChange();
      logger.log("[TranslationService] Translation started");
      
    } catch (error) {
      this.state = TRANSLATION_STATE.ERROR;
      this.notifyStateChange();
      this.notifyError(error);
      throw error;
    }
  }

  /**
   * Stop translation service
   */
  stop() {
    if (this.state === TRANSLATION_STATE.IDLE) return;
    
    transcriptionService.stop();
    this.contextHistory = [];
    this.cache.clear();
    this.isProcessing = false;
    
    this.state = TRANSLATION_STATE.IDLE;
    this.notifyStateChange();
    logger.log("[TranslationService] Translation stopped");
  }

  /**
   * Handle transcription result and translate
   * @param {TranscriptionResult} transcription - Transcription result
   */
  async handleTranscription(transcription) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      const text = transcription.text;
      if (!text || text.trim() === "") {
        this.isProcessing = false;
        return;
      }
      
      // Set source language from transcription
      if (transcription.language) {
        this.sourceLanguage = transcription.language;
      }
      
      // Add to context history
      this.addToContextHistory(text);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(text, this.sourceLanguage, this.targetLanguage);
      if (TRANSLATION_CONFIG.ENABLE_CACHING && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < TRANSLATION_CONFIG.CACHE_TTL_MS) {
          this.stats.cacheHits++;
          this.lastTranslation = new TranslationResult({
            originalText: text,
            translatedText: cached.translation,
            sourceLanguage: this.sourceLanguage,
            targetLanguage: this.targetLanguage,
            provider: "cache",
          });
          this.notifyTranslation();
          this.isProcessing = false;
          return;
        } else {
          // Cache expired, remove it
          this.cache.delete(cacheKey);
        }
      }
      
      this.stats.cacheMisses++;
      
      // Translate the text
      this.stats.totalRequests++;
      const result = await this.translateText(text);
      
      this.stats.successfulRequests++;
      this.stats.totalProcessingTime += Date.now() - startTime;
      this.stats.lastProcessingTime = Date.now() - startTime;
      
      // Cache the result
      if (TRANSLATION_CONFIG.ENABLE_CACHING) {
        this.cache.set(cacheKey, {
          translation: result.translatedText,
          timestamp: Date.now(),
        });
        
        // Clean up old cache entries if needed
        if (this.cache.size > TRANSLATION_CONFIG.MAX_CACHE_ENTRIES) {
          this.cleanupCache();
        }
      }
      
      // Create translation result
      this.lastTranslation = new TranslationResult({
        originalText: text,
        translatedText: result.translatedText,
        sourceLanguage: this.sourceLanguage,
        targetLanguage: this.targetLanguage,
        confidence: result.confidence || 1.0,
        provider: this.provider,
        rawData: result,
      });
      
      this.notifyTranslation();
      
    } catch (error) {
      this.stats.failedRequests++;
      logger.error("[TranslationService] Error handling transcription:", error);
      this.notifyError(error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Add text to context history
   * @param {string} text - Text to add to history
   */
  addToContextHistory(text) {
    this.contextHistory.push({
      text,
      timestamp: Date.now(),
    });
    
    // Keep only the most recent entries
    if (this.contextHistory.length > TRANSLATION_CONFIG.CONTEXT_WINDOW_SIZE) {
      this.contextHistory.shift();
    }
  }

  /**
   * Generate cache key for translation
   * @param {string} text - Text to translate
   * @param {string} sourceLang - Source language
   * @param {string} targetLang - Target language
   * @returns {string} Cache key
   */
  generateCacheKey(text, sourceLang, targetLang) {
    return `${sourceLang}|${targetLang}|${text}`;
  }

  /**
   * Clean up old cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > TRANSLATION_CONFIG.CACHE_TTL_MS) {
        this.cache.delete(key);
      }
    }
    
    // If still too many entries, remove oldest ones
    while (this.cache.size > TRANSLATION_CONFIG.MAX_CACHE_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Translate text using the selected provider
   * @param {string} text - Text to translate
   * @returns {Promise<Object>} Translation result
   */
  async translateText(text) {
    // Prepare context if enabled
    let context = "";
    if (TRANSLATION_CONFIG.USE_CONTEXT && this.contextHistory.length > 0) {
      context = this.contextHistory
        .map(entry => entry.text)
        .join(" ");
    }
    
    // Call the appropriate provider
    switch (this.provider) {
      case TRANSLATION_CONFIG.PROVIDERS.GOOGLE:
        return this.translateWithGoogle(text, context);
      case TRANSLATION_CONFIG.PROVIDERS.AZURE:
        return this.translateWithAzure(text, context);
      case TRANSLATION_CONFIG.PROVIDERS.AWS:
        return this.translateWithAWS(text, context);
      case TRANSLATION_CONFIG.PROVIDERS.DEEPL:
        return this.translateWithDeepL(text, context);
      case TRANSLATION_CONFIG.PROVIDERS.LOCAL_LLM:
        return this.translateWithLocalLLM(text, context);
      case TRANSLATION_CONFIG.PROVIDERS.MOCK:
      default:
        return this.translateWithMock(text, context);
    }
  }

  /**
   * Translate using Google Cloud Translation API
   * @param {string} text - Text to translate
   * @param {string} context - Context text (optional)
   * @returns {Promise<Object>} Translation result
   */
  async translateWithGoogle(text, context) {
    // Placeholder for Google API implementation
    // In production, call Google Cloud Translation API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          translatedText: this.generateMockTranslation(text),
          confidence: 0.95,
        });
      }, 150); // Must be fast to meet <500ms target
    });
  }

  /**
   * Translate using Azure Cognitive Services Translator
   * @param {string} text - Text to translate
   * @param {string} context - Context text (optional)
   * @returns {Promise<Object>} Translation result
   */
  async translateWithAzure(text, context) {
    // Placeholder for Azure API implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          translatedText: this.generateMockTranslation(text),
          confidence: 0.93,
        });
      }, 120);
    });
  }

  /**
   * Translate using AWS Translate
   * @param {string} text - Text to translate
   * @param {string} context - Context text (optional)
   * @returns {Promise<Object>} Translation result
   */
  async translateWithAWS(text, context) {
    // Placeholder for AWS API implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          translatedText: this.generateMockTranslation(text),
          confidence: 0.90,
        });
      }, 180);
    });
  }

  /**
   * Translate using DeepL API
   * @param {string} text - Text to translate
   * @param {string} context - Context text (optional)
   * @returns {Promise<Object>} Translation result
   */
  async translateWithDeepL(text, context) {
    // Placeholder for DeepL API implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          translatedText: this.generateMockTranslation(text),
          confidence: 0.97,
        });
      }, 100); // DeepL is fast
    });
  }

  /**
   * Translate using local LLM (e.g., via WebAssembly or ONNX)
   * @param {string} text - Text to translate
   * @param {string} context - Context text (optional)
   * @returns {Promise<Object>} Translation result
   */
  async translateWithLocalLLM(text, context) {
    // Placeholder for local LLM implementation
    // This could use models like Llama.cpp, Mistral, or other local LLMs
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          translatedText: this.generateMockTranslation(text),
          confidence: 0.85,
        });
      }, 250); // Local processing might be slower
    });
  }

  /**
   * Translate using mock implementation (for development)
   * @param {string} text - Text to translate
   * @param {string} context - Context text (optional)
   * @returns {Promise<Object>} Translation result
   */
  async translateWithMock(text, context) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          translatedText: this.generateMockTranslation(text),
          confidence: 0.95,
        });
      }, 100);
    });
  }

  /**
   * Generate mock translation based on target language
   * @param {string} text - Original text
   * @returns {string} Mock translated text
   */
  generateMockTranslation(text) {
    // Mock translations based on target language
    const translations = {
      en: text, // English - no translation
      es: this.mockTranslateToSpanish(text),
      fr: this.mockTranslateToFrench(text),
      de: this.mockTranslateToGerman(text),
      it: this.mockTranslateToItalian(text),
      pt: this.mockTranslateToPortuguese(text),
      hi: this.mockTranslateToHindi(text),
      ja: this.mockTranslateToJapanese(text),
      zh: this.mockTranslateToChinese(text),
      // Add more languages as needed
    };
    
    return translations[this.targetLanguage] || text;
  }

  /**
   * Mock translation to Spanish
   */
  mockTranslateToSpanish(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "¡Hola a todos, bienvenidos a Eventra!",
      "Today we have an amazing lineup of speakers.": "Hoy tenemos una increíble lista de oradores.",
      "Let's get started with the first presentation.": "Comencemos con la primera presentación.",
      "Thank you all for coming today.": "Gracias a todos por venir hoy.",
      "This is a demonstration of real-time transcription.": "Esta es una demostración de transcripción en tiempo real.",
      "The audio is being transcribed as I speak.": "El audio se está transcribiendo mientras hablo.",
      "Multilingual subtitles will appear shortly.": "Los subtítulos multilingües aparecerán shortly.",
      "Welcome to our international event.": "Bienvenidos a nuestro evento internacional.",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to French
   */
  mockTranslateToFrench(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "Bonjour à tous, bienvenue à Eventra !",
      "Today we have an amazing lineup of speakers.": "Aujourd'hui, nous avons une programmation incroyable d'orateurs.",
      "Let's get started with the first presentation.": "Commençons par la première présentation.",
      "Thank you all for coming today.": "Merci à tous d'être venus aujourd'hui.",
      "This is a demonstration of real-time transcription.": "Ceci est une démonstration de transcription en temps réel.",
      "The audio is being transcribed as I speak.": "L'audio est en cours de transcription alors que je parle.",
      "Multilingual subtitles will appear shortly.": "Les sous-titres multilingues apparaîtreont prochainement.",
      "Welcome to our international event.": "Bienvenue à notre événement international.",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to German
   */
  mockTranslateToGerman(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "Hallo zusammen, willkommen bei Eventra!",
      "Today we have an amazing lineup of speakers.": "Heute haben wir eine beeindruckende Reihe von Rednern.",
      "Let's get started with the first presentation.": "Lassen Sie uns mit der ersten Präsentation beginnen.",
      "Thank you all for coming today.": "Vielen Dank, dass Sie alle heute gekommen sind.",
      "This is a demonstration of real-time transcription.": "Dies ist eine Demonstration der Echtzeit-Transkription.",
      "The audio is being transcribed as I speak.": "Der Ton wird transkribiert, während ich spreche.",
      "Multilingual subtitles will appear shortly.": "Mehrsprachige Untertitel erscheinen in Kürze.",
      "Welcome to our international event.": "Willkommen zu unserer internationalen Veranstaltung.",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to Hindi
   */
  mockTranslateToHindi(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "नमस्ते सबको, इवेन्ट्रा में आपका स्वागत है!",
      "Today we have an amazing lineup of speakers.": "आज हमारे पास वक्ताओं की एक आश्चर्यजनक लाइनअप है।",
      "Let's get started with the first presentation.": "चलिये पहली प्रस्तुति के साथ शुरू करते हैं।",
      "Thank you all for coming today.": "आज आने के लिए आप सभी का धन्यवाद।",
      "This is a demonstration of real-time transcription.": "यह रीयल-टाइम ट्रांसक्रिप्शन का एक प्रदर्शन है।",
      "The audio is being transcribed as I speak.": "जैसे ही मैं बोलता हूँ, ऑडियो ट्रांसक्राइब किया जा रहा है।",
      "Multilingual subtitles will appear shortly.": "बहुभाषी उपशीर्षक जल्द ही दिखाई देंगे।",
      "Welcome to our international event.": "हमारे अंतरराष्ट्रीय आयोजन में आपका स्वागत है।",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to Japanese
   */
  mockTranslateToJapanese(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "皆さんこんにちは、Eventraへようこそ！",
      "Today we have an amazing lineup of speakers.": "今日は素晴らしいスピーカーのラインナップがあります。",
      "Let's get started with the first presentation.": "最初のプレゼンテーションを始めましょう。",
      "Thank you all for coming today.": "本日はご参加いただきありがとうございます。",
      "This is a demonstration of real-time transcription.": "これはリアルタイムの文字起こしのデモンストレーションです。",
      "The audio is being transcribed as I speak.": "私が話すと、オーディオが文字起こしされています。",
      "Multilingual subtitles will appear shortly.": "多言語の字幕がまもなく表示されます。",
      "Welcome to our international event.": "私たちの国際イベントへようこそ。",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to Chinese
   */
  mockTranslateToChinese(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "大家好，欢迎来到Eventra！",
      "Today we have an amazing lineup of speakers.": "今天我们有精彩的演讲者阵容。",
      "Let's get started with the first presentation.": "让我们开始第一个演示。",
      "Thank you all for coming today.": "感谢大家今天的到来。",
      "This is a demonstration of real-time transcription.": "这是实时转录的演示。",
      "The audio is being transcribed as I speak.": "我在讲话时，音频正在被转录。",
      "Multilingual subtitles will appear shortly.": "多语言字幕将很快出现。",
      "Welcome to our international event.": "欢迎来到我们的国际活动。",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to Italian
   */
  mockTranslateToItalian(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "Ciao a tutti, benvenuti a Eventra!",
      "Today we have an amazing lineup of speakers.": "Oggi abbiamo una straordinaria serie di relatori.",
      "Let's get started with the first presentation.": "Iniziamo con la prima presentazione.",
      "Thank you all for coming today.": "Grazie a tutti per essere venuti oggi.",
      "This is a demonstration of real-time transcription.": "Questa è una dimostrazione di trascrizione in tempo reale.",
      "The audio is being transcribed as I speak.": "L'audio viene trascritto mentre parlo.",
      "Multilingual subtitles will appear shortly.": "I sottotitoli multilingue appariranno a breve.",
      "Welcome to our international event.": "Benvenuti al nostro evento internazionale.",
    };
    return mappings[text] || text;
  }

  /**
   * Mock translation to Portuguese
   */
  mockTranslateToPortuguese(text) {
    const mappings = {
      "Hello everyone, welcome to Eventra!": "Olá a todos, bem-vindos ao Eventra!",
      "Today we have an amazing lineup of speakers.": "Hoje temos uma incrível programação de palestrantes.",
      "Let's get started with the first presentation.": "Vamos começar com a primeira apresentação.",
      "Thank you all for coming today.": "Obrigado a todos por virem hoje.",
      "This is a demonstration of real-time transcription.": "Esta é uma demonstração de transcrição em tempo real.",
      "The audio is being transcribed as I speak.": "O áudio está sendo transcrito enquanto eu falo.",
      "Multilingual subtitles will appear shortly.": "Legendas multilingues aparecerão em breve.",
      "Welcome to our international event.": "Bem-vindos ao nosso evento internacional.",
    };
    return mappings[text] || text;
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get the last translation result
   * @returns {TranslationResult|null} Last translation result
   */
  getLastTranslation() {
    return this.lastTranslation;
  }

  /**
   * Get translation statistics
   * @returns {Object} Translation statistics
   */
  getStats() {
    const avgProcessingTime = this.stats.totalRequests > 0
      ? this.stats.totalProcessingTime / this.stats.totalRequests
      : 0;
    
    return {
      ...this.stats,
      averageProcessingTime: avgProcessingTime,
      provider: this.provider,
      sourceLanguage: this.sourceLanguage,
      targetLanguage: this.targetLanguage,
      cacheSize: this.cache.size,
      contextHistorySize: this.contextHistory.length,
    };
  }

  /**
   * Get supported languages
   * @returns {Array<string>} List of supported language codes
   */
  getSupportedLanguages() {
    return [...TRANSLATION_CONFIG.SUPPORTED_LANGUAGES];
  }

  /**
   * Get language name from code
   * @param {string} code - Language code
   * @returns {string} Language name
   */
  getLanguageName(code) {
    const names = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
      bn: "Bengali",
      pa: "Punjabi",
      tr: "Turkish",
      nl: "Dutch",
      sv: "Swedish",
      fi: "Finnish",
      da: "Danish",
      no: "Norwegian",
    };
    return names[code] || code;
  }

  /**
   * Detect language from text (mock implementation)
   * @param {string} text - Text to detect language from
   * @returns {Promise<string>} Detected language code
   */
  async detectLanguage(text) {
    // Mock language detection
    // In production, use a language detection library or API
    const languagePatterns = {
      en: /\b(the|and|of|to|in|is|it|you|that|for)\b/i,
      es: /\b(el|la|de|que|y|a|en|un|ser|se|las|por)\b/i,
      fr: /\b(le|la|de|et|à|les|des|un|une|en|est)\b/i,
      de: /\b(der|die|das|und|in|den|von|zu|ist|sich)\b/i,
      it: /\b(di|e|il|la|in|un|una|che|non|è)\b/i,
      pt: /\b(de|o|a|e|do|da|um|uma|em|para)\b/i,
      hi: /\b(कया|और|है|में|की|हो|इस|थे|तक|जो)\b/,
      ja: /\b(の|は|が|を|に|で|と|で|し|た)\b/,
      zh: /\b(的|一|是|在|不|了|有|和|人|这)\b/,
    };
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    
    return "en"; // Default to English
  }

  /**
   * Notify translation to listeners
   */
  notifyTranslation() {
    if (this.onTranslationCallback && this.lastTranslation) {
      try {
        this.onTranslationCallback(this.lastTranslation);
      } catch (error) {
        logger.error("[TranslationService] Error in translation callback:", error);
      }
    }
  }

  /**
   * Notify state change to listeners
   */
  notifyStateChange() {
    if (this.onStateChangeCallback) {
      try {
        this.onStateChangeCallback(this.state);
      } catch (error) {
        logger.error("[TranslationService] Error in state change callback:", error);
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
        logger.error("[TranslationService] Error in error callback:", callbackError);
      }
    }
  }
}

// Singleton instance
export const translationService = new TranslationService();

export default translationService;
