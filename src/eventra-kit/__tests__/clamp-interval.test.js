import { describe, it, expect } from 'vitest';
import { clampInterval } from '../clamp-interval.js';

describe('clamp-interval', () => {
  it('clamps a value between a minimum and a maximum', () => {
    expect(clampInterval(15, 1, 10)).toBe(10);
    expect(clampInterval(-5, 1, 10)).toBe(1);
    expect(clampInterval(7, 1, 10)).toBe(7);
  });
});
