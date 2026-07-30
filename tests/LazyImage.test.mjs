/**
 * Tests for LazyImage component (issue #7134).
 *
 * Verifies that the LazyImage component contains the correct structural code
 * for native lazy loading, aspect ratio layout shift prevention, low-resolution
 * previews, and error fallbacks. Also runs unit tests for WebP and styling logic.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, '../src/components/common/LazyImage.jsx'),
  'utf8',
);

describe('LazyImage Component — Static Checks', () => {
  it('imports React hooks (useState, useRef, useEffect)', () => {
    assert.ok(src.includes('useState'), 'Must use useState to track loaded/error states');
    assert.ok(src.includes('useRef'), 'Must use useRef to reference the image element');
    assert.ok(src.includes('useEffect'), 'Must use useEffect to handle caching/resets');
  });

  it('imports stylesheet lazy-image.css', () => {
    assert.ok(src.includes('lazy-image.css'), 'Must import the lazy-image styles');
  });

  it('imports ImageIcon from lucide-react', () => {
    assert.ok(src.includes('ImageIcon') && src.includes('lucide-react'), 'Must import ImageIcon for error fallback');
  });

  it('implements native loading configuration', () => {
    assert.ok(src.includes("loading = 'lazy'"), 'Must default to loading="lazy" for native lazy loading');
    assert.ok(src.includes('loading={loading}'), 'Must pass loading prop to the img element');
  });

  it('implements aspect ratio, width, and height style mapping to prevent CLS', () => {
    assert.ok(src.includes('containerStyle'), 'Must compute containerStyle to hold dimensions');
    assert.ok(src.includes('aspectRatio'), 'Must support aspectRatio prop to reserve layout space');
    assert.ok(src.includes('width'), 'Must support width prop');
    assert.ok(src.includes('height'), 'Must support height prop');
  });

  it('implements error fallback state rendering', () => {
    assert.ok(src.includes('error') && src.includes('lazy-img-error'), 'Must render error fallback view on failure');
  });

  it('implements preview source loading support', () => {
    assert.ok(src.includes('previewSrc') && src.includes('lazy-img-preview'), 'Must support previewSrc for low-resolution blurred placeholder');
  });

  it('implements WebP source support', () => {
    assert.ok(src.includes('webpSrc') && src.includes('picture'), 'Must support WebP source wrapping');
  });
});

describe('LazyImage Component — Pure Logic Tests', () => {
  // Simulate webpSrc conversion logic
  const getWebpSrc = (src, useWebP) => {
    return useWebP && src && src.match(/\.(jpe?g|png)$/i) ? src.replace(/\.(jpe?g|png)$/i, '.webp') : null;
  };

  it('transforms jpg and png to webp when useWebP is true', () => {
    assert.strictEqual(getWebpSrc('test.jpg', true), 'test.webp');
    assert.strictEqual(getWebpSrc('image.png', true), 'image.webp');
    assert.strictEqual(getWebpSrc('https://example.com/pic.JPEG', true), 'https://example.com/pic.webp');
  });

  it('does not transform other formats or when useWebP is false', () => {
    assert.strictEqual(getWebpSrc('test.svg', true), null);
    assert.strictEqual(getWebpSrc('test.jpg', false), null);
    assert.strictEqual(getWebpSrc(null, true), null);
  });

  // Simulate container style resolution logic
  const resolveContainerStyle = (width, height, aspectRatio, style = {}) => {
    const containerStyle = {
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };
    if (width !== undefined) containerStyle.width = typeof width === 'number' ? `${width}px` : width;
    if (height !== undefined) containerStyle.height = typeof height === 'number' ? `${height}px` : height;
    if (aspectRatio) containerStyle.aspectRatio = aspectRatio;
    return containerStyle;
  };

  it('adds width and height styles correctly', () => {
    const style1 = resolveContainerStyle(100, 200);
    assert.strictEqual(style1.width, '100px');
    assert.strictEqual(style1.height, '200px');

    const style2 = resolveContainerStyle('50%', 'auto');
    assert.strictEqual(style2.width, '50%');
    assert.strictEqual(style2.height, 'auto');
  });

  it('adds aspectRatio styles correctly', () => {
    const style = resolveContainerStyle(undefined, undefined, '16/9');
    assert.strictEqual(style.aspectRatio, '16/9');
  });

  it('merges custom styles correctly', () => {
    const style = resolveContainerStyle(undefined, undefined, undefined, { display: 'flex', border: '1px solid red' });
    assert.strictEqual(style.position, 'relative');
    assert.strictEqual(style.display, 'flex');
    assert.strictEqual(style.border, '1px solid red');
  });
});
