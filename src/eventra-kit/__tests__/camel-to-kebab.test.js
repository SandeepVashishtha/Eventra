import { describe, it, expect } from 'vitest';
import * as CamelToKebab from '../camel-to-kebab.js';

describe('camel-to-kebab', () => {
  it('exports a module', () => {
    expect(CamelToKebab).toBeDefined();
  });
});

