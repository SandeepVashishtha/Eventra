/**
 * Source-contract tests for src/context/RealTimeSubtitleContext.jsx
 *
 * Verifies the latency-tracking wiring survives refactors and that the module
 * exports its public surface exactly once (no duplicate-export corruption).
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/context/RealTimeSubtitleContext.jsx'),
  'utf8',
);

describe('RealTimeSubtitleContext — latency tracking', () => {
  it('declares latencyMeasurements ref with a valid identifier', () => {
    assert.match(
      src,
      /const latencyMeasurements = useRef\(\[\]\);/,
      'Must declare `const latencyMeasurements = useRef([])`',
    );
  });

  it('does not contain the corrupted `latency Measurements` identifier', () => {
    assert.ok(
      !src.includes('latency Measurements'),
      'Corrupted `latency Measurements` identifier must not be present',
    );
  });

  it('records each transcription latency into latencyMeasurements', () => {
    assert.match(
      src,
      /latencyMeasurements\.current\.push\(latency\);/,
      'Must push computed latency into latencyMeasurements.current',
    );
  });

  it('caps the latency ring buffer at 10 entries', () => {
    assert.match(
      src,
      /if \(latencyMeasurements\.current\.length > 10\)\s*\{\s*latencyMeasurements\.current\.shift\(\);/,
      'Must shift the oldest entry once the buffer exceeds 10',
    );
  });

  it('computes average latency from the recorded measurements', () => {
    assert.match(
      src,
      /const avgLatency = latencyMeasurements\.current\.reduce/,
      'Must derive averageLatency from latencyMeasurements.current',
    );
  });

  it('clears latencyMeasurements on stop/reset', () => {
    assert.match(
      src,
      /latencyMeasurements\.current = \[\];/,
      'Must reset latencyMeasurements when services stop',
    );
  });
});

describe('RealTimeSubtitleContext — exports', () => {
  it('exports SUBTITLE_CONFIG, SUBTITLE_STATE and Subtitle via declarations', () => {
    assert.match(src, /export const SUBTITLE_CONFIG = \{/);
    assert.match(src, /export const SUBTITLE_STATE = \{/);
    assert.match(src, /export class Subtitle \{/);
  });

  it('does not re-export the already-exported symbols (no duplicate exports)', () => {
    assert.match(
      src,
      /export \{ RealTimeSubtitleContext \};/,
      'Trailing export should only re-export the context constant',
    );
    assert.ok(
      !src.includes(
        'export { RealTimeSubtitleContext, SUBTITLE_CONFIG, SUBTITLE_STATE, Subtitle };',
      ),
      'Must not duplicate SUBTITLE_CONFIG/SUBTITLE_STATE/Subtitle exports',
    );
  });

  it('default-exports RealTimeSubtitleProvider', () => {
    assert.ok(
      src.includes('export default RealTimeSubtitleProvider;'),
      'Must default-export RealTimeSubtitleProvider',
    );
  });
});
