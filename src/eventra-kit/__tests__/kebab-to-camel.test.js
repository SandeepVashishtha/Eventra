import { describe, it, expect } from 'vitest';
import * as KebabToCamel from '../kebab-to-camel.js';

describe('kebab-to-camel', () => {
  it('exports a module', () => {
    expect(KebabToCamel).toBeDefined();
  });
});

