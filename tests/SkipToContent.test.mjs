import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const componentPath = path.resolve(__dirname, '../src/components/accessibility/SkipToContent.jsx');
const componentSrc = readFileSync(componentPath, 'utf8');

const stylesPath = path.resolve(__dirname, '../src/components/accessibility/SkipToContent.css');
const stylesSrc = readFileSync(stylesPath, 'utf8');

const appPath = path.resolve(__dirname, '../src/App.jsx');
const appSrc = readFileSync(appPath, 'utf8');

describe('SkipToContent Component Integrity', () => {
  it('should export the SkipToContent component', () => {
    assert.ok(componentSrc.includes('export default function SkipToContent'), 'Must export SkipToContent function');
  });

  it('should import the CSS stylesheet', () => {
    assert.ok(componentSrc.includes('import "./SkipToContent.css"'), 'Must import the SkipToContent stylesheet');
  });

  it('should implement keyboard accessibility details', () => {
    // Check click handler and target focus properties
    assert.ok(componentSrc.includes('targetId'), 'Must support customizable targetId prop');
    assert.ok(componentSrc.includes('setTimeout'), 'Must defer focus shift to next macro-task');
    assert.ok(componentSrc.includes('setAttribute("tabindex", "-1")'), 'Must enforce focusability on target container');
    assert.ok(componentSrc.includes('focus()'), 'Must call focus() on the target');
    assert.ok(componentSrc.includes('removeAttribute("tabindex")'), 'Must clean up tabindex after focus shifts');
  });
});

describe('SkipToContent Styles Integrity', () => {
  it('should hide the link visually off-screen by default', () => {
    assert.ok(stylesSrc.includes('position: absolute'), 'Must use absolute positioning');
    assert.ok(stylesSrc.includes('top: -100px'), 'Must position visually off-screen by default');
  });

  it('should show the link on keyboard focus', () => {
    assert.ok(stylesSrc.includes('.skip-to-content:focus'), 'Must define :focus styles');
    assert.ok(stylesSrc.includes('top: 1rem') || stylesSrc.includes('top: 0'), 'Must bring element into viewport on focus');
  });
});

describe('Universal Skip Navigation Application Integration', () => {
  it('should import and render SkipToContent inside App.jsx', () => {
    assert.ok(appSrc.includes('SkipToContent'), 'App.jsx must import SkipToContent');
    assert.ok(appSrc.includes('<SkipToContent'), 'App.jsx must mount <SkipToContent />');
  });

  it('should have the primary main container with id="main-content"', () => {
    assert.ok(appSrc.includes('id="main-content"'), 'App.jsx must contain main container target with id="main-content"');
  });
});
