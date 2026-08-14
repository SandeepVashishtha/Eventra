import { describe, it, expect } from 'vitest';
import { checkGrid } from '../check-grid.js';

describe('check-grid', () => {
  it('checks whether the input is a rectangular grid', () => {
    expect(checkGrid([[1, 2], [3, 4]])).toBe(true);
    expect(checkGrid([[1], [2, 3]])).toBe(false);
    expect(checkGrid([])).toBe(false);
  });
});
