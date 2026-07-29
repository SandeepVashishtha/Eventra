import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adminDashboardSrc = readFileSync(
  path.resolve(__dirname, '../src/components/admin/AdminDashboard.js'),
  'utf8',
);

describe('AdminDashboard Accessibility Contracts', () => {
  it('contains search users input with aria-label="Search users"', () => {
    assert.ok(
      adminDashboardSrc.includes('placeholder="Search users…"'),
      'Search users input placeholder must be present',
    );
    assert.ok(
      adminDashboardSrc.includes('aria-label="Search users"'),
      'Search users input must have aria-label="Search users" for accessibility',
    );
  });

  it('contains search events input with aria-label="Search events"', () => {
    assert.ok(
      adminDashboardSrc.includes('placeholder="Search events…"'),
      'Search events input placeholder must be present',
    );
    assert.ok(
      adminDashboardSrc.includes('aria-label="Search events"'),
      'Search events input must have aria-label="Search events" for accessibility',
    );
  });
});
