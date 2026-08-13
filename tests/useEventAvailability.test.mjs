/**
 * Tests for src/hooks/useEventAvailability.js
 *
 * Verifies the fix for issue #16239: the shared fallback poller must be paused
 * once the SSE realtime channel is connected and resumed on error/close,
 * instead of polling redundantly alongside the live stream.
 *
 * This uses the same lightweight "source contract" approach as the other
 * hook tests in this repo (no jsdom required, runnable via `node --test`).
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useEventAvailability.js'),
  'utf8',
);

describe('useEventAvailability — #16239 polling/SSE bridge', () => {
  it('exports useEventAvailability as the default export', () => {
    assert.ok(
      src.includes('export default function useEventAvailability'),
      'Must export useEventAvailability as the default export',
    );
  });

  it('introduces a realtimeConnected flag bridging SSE and the poller', () => {
    assert.ok(
      src.includes('realtimeConnected'),
      'Must declare a realtimeConnected ref/state to bridge the two strategies',
    );
  });

  it('sets realtimeConnected true only on SSE open (CONNECTED) and false otherwise', () => {
    assert.ok(
      src.includes('setRealtimeConnected(sseStatus === SSE_STATUS.CONNECTED)'),
      'realtimeConnected must be derived from the SSE CONNECTED status',
    );
  });

  it('gates the fallback poll on realtimeConnected (not sseStatus)', () => {
    // The old gate compared sseStatus directly; the fix must use the flag.
    assert.ok(
      /const unsubscribePoll =\s*realtimeConnected/.test(src),
      'The poll subscription decision must be based on realtimeConnected',
    );
    assert.ok(
      !/sseStatus === SSE_STATUS\.CONNECTED\s*\?/.test(src),
      'Polling must no longer be gated directly on sseStatus',
    );
  });

  it('re-evaluates polling when realtimeConnected changes (so the interval is cleared on open / restarted on close)', () => {
    assert.ok(
      src.includes('[eventId, enabled, realtimeConnected]'),
      'The poll effect must depend on realtimeConnected so it pauses/resumes',
    );
  });
});
