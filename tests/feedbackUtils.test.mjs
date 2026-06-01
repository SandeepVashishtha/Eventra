import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage globally
const store = {};
globalThis.localStorage = {
  getItem(key) {
    return store[key] || null;
  },
  setItem(key, value) {
    store[key] = String(value);
  },
  removeItem(key) {
    delete store[key];
  },
  clear() {
    for (const key in store) {
      delete store[key];
    }
  }
};

import {
  saveFeedback,
  getEventFeedback,
  getAverageRating,
  getRecommendationStats,
  getTagStats,
  getUserFeedback,
  hasUserSubmittedFeedback,
  deleteFeedback,
  exportFeedbackAsCSV,
  clearAllFeedback,
} from '../src/utils/feedbackUtils.js';

const expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected),
  toHaveLength: (expected) => assert.strictEqual(actual.length, expected),
  toContain: (expected) => assert.ok(actual.includes(expected)),
  toBeNull: () => assert.strictEqual(actual, null),
  not: {
    toBeNull: () => assert.notStrictEqual(actual, null)
  }
});

describe('Feedback Utils', () => {
  const testEventId = 'test-event-123';
  const testUserId = 'user-456';

  beforeEach(() => {
    clearAllFeedback();
  });

  describe('saveFeedback', () => {
    it('should save feedback for an event', () => {
      const feedback = {
        rating: 5,
        comment: 'Great event!',
        tags: ['Great Speaker'],
        recommend: true,
        userId: testUserId,
      };

      const result = saveFeedback(testEventId, feedback);
      expect(result).toBe(true);

      const saved = getEventFeedback(testEventId);
      expect(saved).toHaveLength(1);
      expect(saved[0].rating).toBe(5);
      expect(saved[0].comment).toBe('Great event!');
    });

    it('should update existing feedback', () => {
      const feedback1 = {
        rating: 3,
        comment: 'OK event',
        userId: testUserId,
      };

      const feedback2 = {
        rating: 5,
        comment: 'Great event!',
        userId: testUserId,
      };

      saveFeedback(testEventId, feedback1);
      saveFeedback(testEventId, feedback2);

      const saved = getEventFeedback(testEventId);
      expect(saved).toHaveLength(1);
      expect(saved[0].rating).toBe(5);
      expect(saved[0].comment).toBe('Great event!');
    });

    it('should handle multiple users feedback', () => {
      saveFeedback(testEventId, {
        rating: 5,
        userId: 'user1',
      });

      saveFeedback(testEventId, {
        rating: 4,
        userId: 'user2',
      });

      const saved = getEventFeedback(testEventId);
      expect(saved).toHaveLength(2);
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating correctly', () => {
      saveFeedback(testEventId, { rating: 5, userId: 'user1' });
      saveFeedback(testEventId, { rating: 4, userId: 'user2' });
      saveFeedback(testEventId, { rating: 3, userId: 'user3' });

      const stats = getAverageRating(testEventId);
      expect(stats.average).toBe(4);
      expect(stats.count).toBe(3);
    });

    it('should return 0 for no feedback', () => {
      const stats = getAverageRating(testEventId);
      expect(stats.average).toBe(0);
      expect(stats.count).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      saveFeedback(testEventId, { rating: 5, userId: 'user1' });
      saveFeedback(testEventId, { rating: 4, userId: 'user2' });

      const stats = getAverageRating(testEventId);
      expect(stats.average).toBe(4.5);
    });
  });

  describe('getRecommendationStats', () => {
    it('should calculate recommendation stats', () => {
      saveFeedback(testEventId, { recommend: true, userId: 'user1' });
      saveFeedback(testEventId, { recommend: true, userId: 'user2' });
      saveFeedback(testEventId, { recommend: false, userId: 'user3' });

      const stats = getRecommendationStats(testEventId);
      expect(stats.recommendCount).toBe(2);
      expect(stats.notRecommendCount).toBe(1);
      expect(stats.percentage).toBe(67);
    });
  });

  describe('getTagStats', () => {
    it('should count tags correctly', () => {
      saveFeedback(testEventId, {
        tags: ['Great Speaker', 'Well Organized'],
        userId: 'user1',
      });

      saveFeedback(testEventId, {
        tags: ['Great Speaker', 'Good Food'],
        userId: 'user2',
      });

      const stats = getTagStats(testEventId);
      expect(stats['Great Speaker']).toBe(2);
      expect(stats['Well Organized']).toBe(1);
      expect(stats['Good Food']).toBe(1);
    });
  });

  describe('hasUserSubmittedFeedback', () => {
    it('should return true if user submitted feedback', () => {
      saveFeedback(testEventId, {
        rating: 5,
        userId: testUserId,
      });

      const has = hasUserSubmittedFeedback(testEventId, testUserId);
      expect(has).toBe(true);
    });

    it('should return false if user did not submit feedback', () => {
      const has = hasUserSubmittedFeedback(testEventId, testUserId);
      expect(has).toBe(false);
    });
  });

  describe('getUserFeedback', () => {
    it('should retrieve user feedback', () => {
      const feedback = {
        rating: 5,
        comment: 'Excellent!',
        userId: testUserId,
      };

      saveFeedback(testEventId, feedback);
      const retrieved = getUserFeedback(testEventId, testUserId);

      expect(retrieved).not.toBeNull();
      expect(retrieved.rating).toBe(5);
      expect(retrieved.comment).toBe('Excellent!');
    });

    it('should return null if no feedback found', () => {
      const retrieved = getUserFeedback(testEventId, testUserId);
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteFeedback', () => {
    it('should delete user feedback', () => {
      saveFeedback(testEventId, {
        rating: 5,
        userId: testUserId,
      });

      deleteFeedback(testEventId, testUserId);

      const retrieved = getUserFeedback(testEventId, testUserId);
      expect(retrieved).toBeNull();
    });

    it('should delete all event feedback', () => {
      saveFeedback(testEventId, { rating: 5, userId: 'user1' });
      saveFeedback(testEventId, { rating: 4, userId: 'user2' });

      deleteFeedback(testEventId);

      const feedback = getEventFeedback(testEventId);
      expect(feedback).toHaveLength(0);
    });
  });

  describe('exportFeedbackAsCSV', () => {
    it('should export feedback as CSV', () => {
      saveFeedback(testEventId, {
        rating: 5,
        comment: 'Great event',
        tags: ['Great Speaker'],
        recommend: true,
        userId: 'user1',
      });

      const csv = exportFeedbackAsCSV(testEventId);
      expect(csv).toContain('Rating');
      expect(csv).toContain('5');
      expect(csv).toContain('Great event');
      expect(csv).toContain('Great Speaker');
      expect(csv).toContain('Yes');
    });

    it('should handle empty feedback', () => {
      const csv = exportFeedbackAsCSV(testEventId);
      expect(csv).toBe('');
    });
  });
});
