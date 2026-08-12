import { describe, it, expect } from 'vitest';
import * as PasswordStrength from '../password-strength.js';

describe('password-strength', () => {
  it('exports a module', () => {
    expect(PasswordStrength).toBeDefined();
  });
});

