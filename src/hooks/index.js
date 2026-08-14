/**
 * Hooks index
 * Exports all custom hooks
 */

// Re-export existing hooks
export { default as useWebSocketWithLongPolling } from './useWebSocketWithLongPolling';
export * from './useWebSocketWithLongPolling';

// Export new hooks
export { default as useSharedWorker } from './useSharedWorker';
export { useSessionSync } from './useSharedWorker';
