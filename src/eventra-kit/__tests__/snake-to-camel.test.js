import { describe, it, expect } from 'vitest';
import * as SnakeToCamel from '../snake-to-camel.js';

describe('snake-to-camel', () => {
  it('exports a module', () => {
    expect(SnakeToCamel).toBeDefined();
  });
});

