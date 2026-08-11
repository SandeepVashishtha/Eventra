import { describe, it, expect } from 'vitest';
import * as SecondItem from '../second-item.js';

describe('second-item', () => {
  it('exports a module', () => {
    expect(SecondItem).toBeDefined();
  });
});

