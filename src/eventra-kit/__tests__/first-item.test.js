import { describe, it, expect } from 'vitest';
import * as FirstItem from '../first-item.js';

describe('first-item', () => {
  it('exports a module', () => {
    expect(FirstItem).toBeDefined();
  });
});

