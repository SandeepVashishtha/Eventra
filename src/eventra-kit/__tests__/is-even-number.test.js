import { describe, it, expect } from 'vitest';
import * as IsEvenNumber from '../is-even-number.js';

describe('is-even-number', () => {
  it('exports a module', () => {
    expect(IsEvenNumber).toBeDefined();
  });
});

