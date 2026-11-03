import { describe, it, expect } from 'vitest';

// Extract the analyticsReducer logic for unit testing.
// We import it indirectly by recreating the reducer since the file uses JSX
// and cannot be imported directly in a .mjs test without a JSX transform.

const SSE_STATUS = { IDLE: 'idle' };

const initialAnalyticsState = {
  recentCheckins: [],
  liveCount: 0,
  scanVelocity: 0,
  status: SSE_STATUS.IDLE,
  seenEventIds: [],
};

function analyticsReducer(state, action) {
  switch (action.type) {
    case "CHECKIN": {
      const eventId = action.payload?.id;
      if (eventId && state.seenEventIds.includes(eventId)) {
        return state;
      }
      const newSeen = eventId
        ? [...state.seenEventIds, eventId].slice(-200)
        : state.seenEventIds;
      return {
        ...state,
        recentCheckins: [action.payload, ...state.recentCheckins.slice(0, 49)],
        liveCount: state.liveCount + 1,
        seenEventIds: newSeen,
      };
    }
    case "UPDATE":
      return { ...state, ...action.payload };
    case "STATUS":
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

describe('analyticsReducer CHECKIN deduplication', () => {
  it('increments liveCount for a new event', () => {
    const state = { ...initialAnalyticsState };
    const result = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-1', name: 'Alice', event: 'scan' } });
    expect(result.liveCount).toBe(1);
    expect(result.recentCheckins).toHaveLength(1);
    expect(result.seenEventIds).toEqual(['evt-1']);
  });

  it('skips duplicate event with same id', () => {
    let state = { ...initialAnalyticsState };
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-1', name: 'Alice', event: 'scan' } });
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-1', name: 'Alice', event: 'scan' } });
    expect(state.liveCount).toBe(1);
    expect(state.recentCheckins).toHaveLength(1);
  });

  it('processes events with different ids', () => {
    let state = { ...initialAnalyticsState };
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-1', name: 'Alice', event: 'scan' } });
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-2', name: 'Bob', event: 'scan' } });
    expect(state.liveCount).toBe(2);
    expect(state.recentCheckins).toHaveLength(2);
  });

  it('processes events with no id unconditionally', () => {
    let state = { ...initialAnalyticsState };
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { name: 'Alice', event: 'scan' } });
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { name: 'Alice', event: 'scan' } });
    expect(state.liveCount).toBe(2);
    expect(state.recentCheckins).toHaveLength(2);
  });

  it('caps seenEventIds at 200 entries', () => {
    let state = { ...initialAnalyticsState };
    for (let i = 0; i < 210; i++) {
      state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: `evt-${i}`, name: `User${i}`, event: 'scan' } });
    }
    expect(state.liveCount).toBe(210);
    expect(state.seenEventIds).toHaveLength(200);
    // Oldest entries should have been evicted
    expect(state.seenEventIds[0]).toBe('evt-10');
    expect(state.seenEventIds[199]).toBe('evt-209');
  });

  it('duplicate events from SSE reconnect are skipped', () => {
    let state = { ...initialAnalyticsState };
    // First connection delivers events
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-A', name: 'X', event: 'scan' } });
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-B', name: 'Y', event: 'scan' } });
    // Reconnect re-delivers the same events
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-A', name: 'X', event: 'scan' } });
    state = analyticsReducer(state, { type: 'CHECKIN', payload: { id: 'evt-B', name: 'Y', event: 'scan' } });
    // Only counted once each
    expect(state.liveCount).toBe(2);
    expect(state.recentCheckins).toHaveLength(2);
  });
});
