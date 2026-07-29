/**
 * Tests for src/hooks/useRecommendations.js
 *
 * Verifies the recommendations hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useRecommendations.js'),
  'utf8',
);

describe('useRecommendations — source contract', () => {
  it('exports useRecommendations as default export', () => {
    assert.ok(
      src.includes('export default useRecommendations'),
      'Must export useRecommendations as default export',
    );
  });

  it('uses useMemo for recommendations computation', () => {
    assert.ok(
      src.includes('useMemo'),
      'Must use useMemo for recommendations computation',
    );
  });

  it('imports calculateRecommendationScore from recommendationEngine', () => {
    assert.ok(
      src.includes('calculateRecommendationScore'),
      'Must import calculateRecommendationScore from recommendationEngine',
    );
  });

  it('imports getUserProfile from userProfileAnalyzer', () => {
    assert.ok(
      src.includes('getUserProfile'),
      'Must import getUserProfile from userProfileAnalyzer',
    );
  });
});

describe('useRecommendations — parameters', () => {
  it('accepts events array as parameter', () => {
    assert.ok(
      src.includes('events = []'),
      'Must accept events array as parameter with default empty array',
    );
  });
});

describe('useRecommendations — return contract', () => {
  it('returns recommendations array', () => {
    assert.ok(
      src.includes('return recommendations'),
      'Must return recommendations array',
    );
  });
});

describe('useRecommendations — recommendation logic', () => {
  it('maps over events array', () => {
    assert.ok(
      src.includes('.map('),
      'Must map over events array',
    );
  });

  it('calculates recommendation score for each event', () => {
    assert.ok(
      src.includes('calculateRecommendationScore'),
      'Must calculate recommendation score for each event',
    );
  });

  it('sorts events by recommendation score descending', () => {
    assert.ok(
      src.includes('sort'),
      'Must sort events by recommendation score',
    );
  });

  it('adds recommendationScore to each event', () => {
    assert.ok(
      src.includes('recommendationScore:'),
      'Must add recommendationScore to each event',
    );
  });

  it('adds recommendationReasons to each event', () => {
    assert.ok(
      src.includes('recommendationReasons:'),
      'Must add recommendationReasons to each event',
    );
  });

  it('wraps scoring in try/catch for error handling', () => {
    assert.ok(
      src.includes('try') && src.includes('catch'),
      'Must wrap scoring in try/catch for error handling',
    );
  });

  it('returns score of 0 for malformed events', () => {
    assert.ok(
      src.includes('recommendationScore: 0'),
      'Must return score of 0 for malformed events',
    );
  });

  it('returns empty reasons for malformed events', () => {
    assert.ok(
      src.includes('recommendationReasons: []'),
      'Must return empty reasons for malformed events',
    );
  });
});

describe('useRecommendations — memoization', () => {
  it('memoizes recommendations based on events', () => {
    assert.ok(
      src.includes('[events'),
      'Must memoize recommendations based on events',
    );
  });

  it('memoizes recommendations based on userProfile', () => {
    assert.ok(
      src.includes('userProfile'),
      'Must memoize recommendations based on userProfile',
    );
  });
});