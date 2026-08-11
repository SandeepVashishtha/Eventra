/**
 * Read Time Analysis Utility Module
 * Multi-factor analysis supporting rich media (images, code blocks), CJK languages, and strict zero bounds.
 */

const DEFAULT_WPM = 200;            // Standard prose words per minute
const DEFAULT_CODE_WPM = 100;       // Technical code block words per minute
const DEFAULT_CJK_CPM = 350;        // CJK characters per minute

/**
 * Calculate read time for complex rich content (HTML / Markdown / CJK / Images)
 * @param {string} text - Raw text or HTML content
 * @param {Object} [options] - Custom calculation parameters
 * @returns {Object} Full breakdown of read time metrics
 */
export const calculateRichReadTime = (text, options = {}) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return {
      minutes: 0,
      seconds: 0,
      wordCount: 0,
      cjkCharCount: 0,
      imageCount: 0,
      codeWordCount: 0,
    };
  }

  const {
    wordsPerMinute = DEFAULT_WPM,
    codeWordsPerMinute = DEFAULT_CODE_WPM,
    cjkCharsPerMinute = DEFAULT_CJK_CPM,
    includeImageTime = true,
  } = options;

  let workingText = text;

  // 1. Image Processing (Decaying time calculation: 12s, 11s, 10s... min 3s per image)
  const imgRegex = /<img[^>]+>|!\[.*?\]\(.*?\)/gi;
  const imageMatches = workingText.match(imgRegex) || [];
  const imageCount = imageMatches.length;

  let imageSeconds = 0;
  if (includeImageTime && imageCount > 0) {
    for (let i = 1; i <= imageCount; i++) {
      imageSeconds += Math.max(3, 13 - i);
    }
  }

  // 2. Code Block Processing (<pre><code> or markdown ```)
  const codeBlockRegex = /<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>|```[\s\S]*?```/gi;
  const codeBlocks = workingText.match(codeBlockRegex) || [];

  let codeWordCount = 0;
  codeBlocks.forEach((block) => {
    const plainCode = block.replace(/<[^>]*>/g, "").replace(/```/g, "");
    codeWordCount += plainCode.trim().split(/\s+/).filter(Boolean).length;
  });

  workingText = workingText.replace(codeBlockRegex, " ");

  // 3. Strip remaining HTML tags
  const plainText = workingText.replace(/<[^>]*>/g, "");

  // 4. CJK Character Processing (Chinese, Japanese, Korean)
  const cjkRegex = /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g;
  const cjkMatches = plainText.match(cjkRegex) || [];
  const cjkCharCount = cjkMatches.length;

  // Remove CJK characters prior to standard word splitting
  const nonCjkText = plainText.replace(cjkRegex, " ");
  const wordCount = nonCjkText.trim().split(/\s+/).filter(Boolean).length;

  // 5. Total Read Time Calculations
  const proseSeconds = (wordCount / wordsPerMinute) * 60;
  const codeSeconds = (codeWordCount / codeWordsPerMinute) * 60;
  const cjkSeconds = (cjkCharCount / cjkCharsPerMinute) * 60;

  const totalSeconds = Math.ceil(proseSeconds + codeSeconds + cjkSeconds + imageSeconds);
  const minutes = totalSeconds > 0 ? Math.max(1, Math.ceil(totalSeconds / 60)) : 0;

  return {
    minutes,
    seconds: totalSeconds,
    wordCount: wordCount + codeWordCount,
    cjkCharCount,
    imageCount,
    codeWordCount,
  };
};

/**
 * Calculate basic estimated read time for plain text content
 * @param {string} text - The text content to analyze
 * @returns {number} - Estimated read time in minutes
 */
export const calculateReadTime = (text) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return 0;
  }

  const { minutes } = calculateRichReadTime(text);
  return minutes;
};

/**
 * Format read time for display
 * @param {number} minutes - Read time in minutes
 * @returns {string} - Formatted string (e.g., "2 min read")
 */
export const formatReadTime = (minutes) => {
  if (!minutes || minutes <= 0) return "";
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
};

/**
 * Get read time info for an event
 * @param {Object} event - Event object with description
 * @returns {Object} - Read time info
 */
export const getEventReadTime = (event) => {
  const description = event?.description || "";
  const metrics = calculateRichReadTime(description);

  return {
    minutes: metrics.minutes,
    display: formatReadTime(metrics.minutes),
    wordCount: metrics.wordCount,
    ...metrics,
  };
};