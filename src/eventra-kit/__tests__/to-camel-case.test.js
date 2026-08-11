import { describe, it, expect } from 'vitest';
import * as ToCamelCase from '../to-camel-case.js';

describe('to-camel-case', () => {
  it('exports a module', () => {
    expect(ToCamelCase).toBeDefined();
  });
});

