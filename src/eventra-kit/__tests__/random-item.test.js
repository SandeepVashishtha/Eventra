import { describe, it, expect } from 'vitest';
import * as RandomItem from '../random-item.js';

describe('random-item', () => {
  it('exports a module', () => {
    expect(RandomItem).toBeDefined();
  });
});

