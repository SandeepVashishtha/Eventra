import { describe, it, expect } from 'vitest';
import { detectObject } from '../detect-object.js';

describe('detect-object', () => {
  it('checks whether the input is an object', () => {
    expect(detectObject({ a: 1 })).toBe(true);
    expect(detectObject({})).toBe(true);
    expect(detectObject('abc')).toBe(false);
    expect(detectObject(null)).toBe(false);
  });
});
