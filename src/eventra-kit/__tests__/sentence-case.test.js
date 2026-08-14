import { describe, it, expect } from 'vitest';
import { sentenceCase } from '../sentence-case.js';

describe('sentence-case', () => {
  it('capitalizes the first letter of every sentence', () => {
    expect(sentenceCase('hello world. foo')).toBe('Hello world. Foo');
    expect(sentenceCase('HELLO!')).toBe('Hello!');
  });
});
