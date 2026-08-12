/**
 * Subtitles Component Index
 * 
 * Export all subtitle-related components for easy importing
 */

export { default as SubtitleDisplay } from "./SubtitleDisplay.jsx";
export { SubtitleDisplayWithControls } from "./SubtitleDisplay.jsx";
export { SubtitleDisplayAR } from "./SubtitleDisplay.jsx";
export { SubtitleDisplayMobile } from "./SubtitleDisplay.jsx";

// Export context and hooks
export {
  RealTimeSubtitleProvider,
  useRealTimeSubtitles,
  useActiveSubtitle,
  useSubtitleList,
  useSubtitleControls,
  useSubtitleSettings,
  useSubtitleStats,
  SUBTITLE_CONFIG,
  SUBTITLE_STATE,
  Subtitle,
} from "../../context/RealTimeSubtitleContext.jsx";

// Export services
export {
  audioCaptureService,
  AUDIO_CAPTURE_STATE,
  AUDIO_CONFIG,
} from "../../services/audioCaptureService.js";

export {
  transcriptionService,
  TRANSCRIPTION_STATE,
  TRANSCRIPTION_CONFIG,
  TranscriptionResult,
} from "../../services/transcriptionService.js";

export {
  translationService,
  TRANSLATION_STATE,
  TRANSLATION_CONFIG,
  TranslationResult,
} from "../../services/translationService.js";
