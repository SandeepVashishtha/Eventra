import { describe, it, expect } from 'vitest';
import * as ValidatePassword from '../validate-password.js';

describe('validate-password', () => {
  it('exports a module', () => {
    expect(ValidatePassword).toBeDefined();
  });
});

