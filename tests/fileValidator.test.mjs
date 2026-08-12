/**
 * Tests for src/utils/fileValidator.js
 *
 * Exercises the magic-byte verification path of validateImageFile using a
 * mocked FileReader (the real FileReader is a browser API unavailable in node).
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach, afterEach } from 'node:test';

const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

const originalFileReader = globalThis.FileReader;

function mockFileReader(readResult, { fail = false } = {}) {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      Promise.resolve().then(() => {
        if (fail) {
          this.onerror(new Error('read failed'));
        } else {
          this.result = readResult ?? blob._bytes;
          this.onload({});
        }
      });
    }
  };
}

function makeFile({ name = 'image.png', type = 'image/png', size = 1024, bytes = PNG_MAGIC }) {
  return {
    name,
    type,
    size,
    slice() {
      return { _bytes: bytes };
    },
  };
}

describe('validateImageFile — magic byte verification', () => {
  beforeEach(() => {
    mockFileReader();
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
  });

  it('accepts a file whose bytes match the declared MIME type', async () => {
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({})));
    assert.deepEqual(result, { valid: true });
  });

  it('rejects a file whose bytes do not match the declared MIME type', async () => {
    const file = makeFile({ type: 'image/png', bytes: JPEG_MAGIC });
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(file));
    assert.equal(result.valid, false);
    assert.match(result.error, /does not match declared type "image\/png"/);
  });

  it('accepts a JPEG with JPEG magic bytes', async () => {
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({ name: 'a.jpg', type: 'image/jpeg', bytes: JPEG_MAGIC })));
    assert.equal(result.valid, true);
  });

  it('returns a validation error when the file cannot be read', async () => {
    mockFileReader(null, { fail: true });
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({})));
    assert.equal(result.valid, false);
    assert.equal(result.error, 'Unable to read file for validation');
  });

  it('rejects oversized files before attempting to read bytes', async () => {
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({ size: 6 * 1024 * 1024 })));
    assert.equal(result.valid, false);
    assert.match(result.error, /exceeds maximum of 5MB/);
  });

  it('rejects empty files', async () => {
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({ size: 0 })));
    assert.equal(result.valid, false);
    assert.equal(result.error, 'File is empty');
  });

  it('rejects disallowed MIME types before reading bytes', async () => {
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({ type: 'text/html' })));
    assert.equal(result.valid, false);
    assert.match(result.error, /is not allowed/);
  });

  it('rejects dangerous file extensions', async () => {
    const result = await import('../src/utils/fileValidator.js')
      .then((m) => m.validateImageFile(makeFile({ name: 'evil.png.exe' })));
    assert.equal(result.valid, false);
    assert.match(result.error, /not allowed for security reasons/);
  });
});
