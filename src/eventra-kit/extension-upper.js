
/**
 * adds an ext upper helper.
 */
import { fileExtension } from './file-extension.js';

export function extensionUpper(filename) {
  return fileExtension(filename).toUpperCase();
}

