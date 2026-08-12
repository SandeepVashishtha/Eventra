/**
 * Offline Text-to-Speech (TTS) & Caption Formatting Engine (#14075)
 */

export function formatSubtitleCue(text, index) {
  if (!text) return null;
  return {
    id: `cue-${index}-${Date.now()}`,
    text: text.trim(),
    timestamp: new Date().toISOString(),
  };
}

export class TtsVoiceEngine {
  constructor() {
    this.speechRate = 1.0;
    this.pitch = 1.0;
    this.activeVoice = null;
  }

  setSpeechParameters(rate, pitch) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
    this.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  speakTextOffline(text, onStart = () => {}, onEnd = () => {}) {
    if (!text) return false;

    // Simulate speech synthesis if browser SpeechSynthesis is unavailable (e.g. Node environments)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.speechRate;
        utterance.pitch = this.pitch;
        utterance.onstart = onStart;
        utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (err) {
        console.warn("[TTS] Browser speech synthesis error:", err);
      }
    }

    // Node environment mock playback triggers
    onStart();
    setTimeout(onEnd, 100);
    return true;
  }
}
