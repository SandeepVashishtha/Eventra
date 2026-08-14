
/**
 * adds an ext lower helper.
 */
import { fileExtension } from './file-extension.js';

export function extensionLower(filename) {
  return fileExtension(filename).toLowerCase();
}

