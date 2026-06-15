import { useState, useEffect, useMemo } from 'react';

/**
 * Calculates the relative luminance of a color.
 * @param {string} hex - The hex color code (e.g., "#FFFFFF" or "FFFFFF").
 * @returns {number} The relative luminance.
 */
function getLuminance(hex) {
  let color = hex.replace(/^#/, '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  const r8bit = parseInt(color.substring(0, 2), 16);
  const g8bit = parseInt(color.substring(2, 4), 16);
  const b8bit = parseInt(color.substring(4, 6), 16);

  const [r, g, b] = [r8bit, g8bit, b8bit].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two colors.
 * @param {number} lum1 - Relative luminance of the first color.
 * @param {number} lum2 - Relative luminance of the second color.
 * @returns {number} The contrast ratio.
 */
function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * A utility hook that calculates the contrast ratio between background and foreground colors.
 * @param {string} bgColor - Background color in hex format.
 * @param {string} fgColor - Foreground text color in hex format.
 * @returns {Object} { contrastRatio, isAccessible }
 */
export function useContrastChecker(bgColor, fgColor) {
  const result = useMemo(() => {
    if (!bgColor || !fgColor) {
      return { contrastRatio: null, isAccessible: true };
    }

    try {
      const bgLum = getLuminance(bgColor);
      const fgLum = getLuminance(fgColor);
      const ratio = getContrastRatio(bgLum, fgLum);
      
      return {
        contrastRatio: Number(ratio.toFixed(2)),
        isAccessible: ratio >= 4.5
      };
    } catch (e) {
      // In case of invalid hex
      return { contrastRatio: null, isAccessible: true };
    }
  }, [bgColor, fgColor]);

  return result;
}

export default useContrastChecker;
