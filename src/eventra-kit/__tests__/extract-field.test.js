import { describe, it, expect } from 'vitest';
import { extractField } from '../extract-field.js';

describe('extract-field', () => {
  it('extracts the field name before the colon', () => {
    expect(extractField('name:John')).toBe('name');
    expect(extractField('age:30')).toBe('age');
    expect(extractField('hello')).toBe('hello');
  });
});
