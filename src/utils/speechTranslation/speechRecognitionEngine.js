/**
 * Web Speech API Speech Recognition Engine Wrapper
 * Manages continuous speech-to-text recognition for live keynote speakers.
 */

export class SpeechRecognitionEngine {
  constructor(onTranscriptCallback, onErrorCallback) {
    this.onTranscript = onTranscriptCallback || (() => {});
    this.onError = onErrorCallback || (() => {});
    this.recognition = null;
    this.isListening = false;
    this.lang = "en-US";

    this.init();
  }

  init() {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        this.onTranscript({
          finalText: finalTranscript.trim(),
          interimText: interimTranscript.trim(),
          timestamp: Date.now(),
        });
      };

      this.recognition.onerror = (event) => {
        this.onError(event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start(); // Auto restart continuous stream
          } catch {}
        }
      };
    }
  }

  setLanguage(languageCode) {
    this.lang = languageCode;
    if (this.recognition) {
      this.recognition.lang = languageCode;
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      try {
        this.recognition.start();
      } catch (err) {
        console.warn("[SpeechEngine] Start warning:", err);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("[SpeechEngine] Stop warning:", err);
      }
    }
  }
}

export default SpeechRecognitionEngine;
