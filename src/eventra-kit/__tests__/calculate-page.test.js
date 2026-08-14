import { describe, it, expect } from 'vitest';
import { calculatePage } from '../calculate-page.js';

describe('calculate-page', () => {
  it('calculates the number of pages', () => {
    expect(calculatePage(10, 3)).toBe(4);
    expect(calculatePage(9, 3)).toBe(3);
    expect(calculatePage(0, 3)).toBe(0);
  });
});
