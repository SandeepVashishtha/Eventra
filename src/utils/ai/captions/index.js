/**
 * AI Captions Utility Exports
 * WebNN-based audio transcription utilities
 */

export { default as WebNNTranscriptionModel, 
         createTranscriptionModel, 
         captureAudioFromVideo, 
         captureMicrophoneAudio,
         SUPPORTED_TRANSCRIPTION_LANGUAGES } from './audioTranscriptionModel';
