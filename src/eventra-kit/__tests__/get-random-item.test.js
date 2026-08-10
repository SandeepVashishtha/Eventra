import { describe, it, expect } from 'vitest';
import * as GetRandomItem from '../get-random-item.js';

describe('get-random-item', () => {
  it('exports a module', () => {
    expect(GetRandomItem).toBeDefined();
  });
});

