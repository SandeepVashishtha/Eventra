import { describe, it, expect } from 'vitest';
import * as CelsiusToFahrenheit from '../celsius-to-fahrenheit.js';

describe('celsius-to-fahrenheit', () => {
  it('exports a module', () => {
    expect(CelsiusToFahrenheit).toBeDefined();
  });
});

