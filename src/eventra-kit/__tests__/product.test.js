import { describe, it, expect } from 'vitest';
import * as Product from '../product.js';

describe('product', () => {
  it('exports a module', () => {
    expect(Product).toBeDefined();
  });
});

