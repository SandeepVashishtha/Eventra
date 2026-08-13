/**
 * Enterprise Contextual Sentiment Analysis Engine
 *
 * Evaluates text using a weighted multi-lexicon, contextual negation handling,
 * intensifier/diminisher scaling, casing/exclamation boosting, sentence-level
 * breakdown, and UI formatting.
 */

// ============================================================================
// 1. Lexicons, Modifiers & Constants
// ============================================================================

/** Weighted sentiment lexicon ranging from -3.0 (strong negative) to +3.0 (strong positive) */
export const WEIGHTED_LEXICON = new Map([
  // Positive Keywords
  ["love", 2.5], ["adore", 2.8], ["perfect", 2.5], ["amazing", 2.3],
  ["great", 1.8], ["good", 1.5], ["excellent", 2.2], ["awesome", 2.2], ["fantastic", 2.3],
  ["beautiful", 1.5], ["helpful", 1.2], ["help", 1.2], ["easy", 1.0], ["fast", 1.0],
  ["smooth", 1.0], ["happy", 1.5], ["nice", 1.0], ["resolved", 1.5],
  ["satisfied", 1.5], ["solved", 1.5], ["best", 2.5], ["cool", 1.0],
  ["wonderful", 2.0], ["superb", 2.2], ["outstanding", 2.5], ["impressive", 2.0],
  ["brilliant", 2.2], ["glad", 1.2], ["enjoyed", 1.5], ["like", 1.0],
  ["delightful", 2.0], ["masterpiece", 3.0], ["top", 1.2], ["recommend", 1.5],

  // Negative Keywords
  ["hate", -2.5], ["dislike", -1.5], ["terrible", -2.5], ["bad", -1.5],
  ["awful", -2.5], ["broke", -1.8], ["crash", -2.0], ["bug", -1.2],
  ["error", -1.2], ["slow", -1.2], ["lag", -1.2], ["poor", -1.5],
  ["hard", -1.0], ["difficult", -1.0], ["complex", -0.8], ["frustrated", -2.0],
  ["fail", -2.0], ["worst", -2.8], ["issues", -1.2], ["broken", -2.0],
  ["complain", -1.5], ["annoyed", -1.8], ["useless", -2.2], ["crashed", -2.0],
  ["slowly", -1.0], ["laggy", -1.5], ["painful", -2.0], ["horrible", -2.5],
  ["defect", -1.8], ["failure", -2.2], ["scam", -3.0], ["trash", -2.5],
]);

/** Multiplier applied to subsequent sentiment words */
export const INTENSIFIERS = new Map([
  ["very", 1.5], ["extremely", 2.0], ["super", 1.5], ["really", 1.4],
  ["absolutely", 1.8], ["totally", 1.6], ["highly", 1.5], ["so", 1.3],
  ["incredibly", 1.8], ["exceptionally", 1.9], ["immensely", 1.7],
]);

/** Diminishers that soften sentiment strength */
export const DIMINISHERS = new Map([
  ["slightly", 0.5], ["barely", 0.4], ["hardly", 0.4], ["a bit", 0.6],
  ["somewhat", 0.6], ["kind of", 0.7], ["sort of", 0.7], ["marginally", 0.5],
]);

/** Negators that invert the sign of target sentiment words */
export const NEGATORS = new Set([
  "not", "no", "never", "neither", "nor", "cannot", "cant", "can't",
  "dont", "don't", "wont", "won't", "doesnt", "doesn't", "didnt", "didn't",
  "isnt", "isn't", "wasnt", "wasn't", "werent", "weren't",
  "havent", "haven't", "hasnt", "hasn't", "hadnt", "hadn't",
  "couldnt", "couldn't", "wouldnt", "wouldn't", "shouldnt", "shouldn't",
  "arent", "aren't", "aint", "ain't",
  "without", "lack", "lacks", "hardly", "n't",
]);

// ============================================================================
// 2. Tokenization & Contextual Scorers
// ============================================================================

/**
 * Extracts words and sentence units while preserving original casing and punctuation metadata.
 *
 * @param {string} text - Raw input string.
 * @returns {Array<{word: string, lower: string, isUpper: boolean, hasExclamation: boolean}>} Token array.
 */
function tokenizeWithMetadata(text) {
  const rawTokens = text.match(/\b[A-Za-z]+['’]?t?\b|[!?]+/g) || [];
  const tokens = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    if (/^[!?]+$/.test(token)) continue; // Punctuation handled via neighbor inspection

    const isUpper = token.length > 1 && token === token.toUpperCase();
    const lower = token.toLowerCase();
    const nextToken = rawTokens[i + 1] || "";
    const hasExclamation = nextToken.includes("!");

    tokens.push({ word: token, lower, isUpper, hasExclamation });
  }

  return tokens;
}

/**
 * Calculates raw sentiment score for a sequence of tokens incorporating lookback context.
 *
 * @param {Array<Object>} tokens - Metadata tokens.
 * @returns {{score: number, posWords: Array<string>, negWords: Array<string>, negationCount: number}}
 */
function evaluateTokenSequence(tokens) {
  let totalScore = 0;
  const posWords = [];
  const negWords = [];
  let negationCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    let baseWeight = WEIGHTED_LEXICON.get(current.lower);

    if (baseWeight === undefined) continue;

    // 1. Lookback Context (1-2 words prior) for Negators and Modifiers
    let multiplier = 1.0;
    let isNegated = false;

    for (let lookback = 1; lookback <= 2; lookback++) {
      const prevIndex = i - lookback;
      if (prevIndex < 0) break;

      const prevToken = tokens[prevIndex].lower;
      const normalizedPrevToken = prevToken.replace(/['’]/g, "");

      if (NEGATORS.has(prevToken) || NEGATORS.has(normalizedPrevToken)) {
        isNegated = true;
        negationCount++;
      } else if (INTENSIFIERS.has(prevToken)) {
        multiplier *= INTENSIFIERS.get(prevToken);
      } else if (DIMINISHERS.has(prevToken)) {
        multiplier *= DIMINISHERS.get(prevToken);
      }
    }

    // 2. Invert sign if negated (e.g. "not bad" -> positive; "not good" -> negative)
    if (isNegated) {
      baseWeight = -baseWeight * 0.75; // Softened inversion
    }

    // 3. Apply Modifier Multiplier
    let tokenScore = baseWeight * multiplier;

    // 4. Uppercase Boost (+25% intensity)
    if (current.isUpper) {
      tokenScore *= 1.25;
    }

    // 5. Exclamation Boost (+15% intensity)
    if (current.hasExclamation) {
      tokenScore *= 1.15;
    }

    totalScore += tokenScore;

    if (tokenScore > 0) {
      posWords.push(current.word);
    } else if (tokenScore < 0) {
      negWords.push(current.word);
    }
  }

  return { score: totalScore, posWords, negWords, negationCount };
}

// ============================================================================
// 3. Primary Sentiment APIs
// ============================================================================

/**
 * Evaluates a string and returns a score clamped between -5.0 (highly negative) and +5.0 (highly positive).
 *
 * @param {string} text - Untrusted user comment or feedback text.
 * @returns {number} Sentiment score clamped between -5.0 and +5.0.
 */
export const analyzeSentiment = (text) => {
  if (!text || typeof text !== "string") {
    return 0;
  }

  const safeText = text.slice(0, 10000);
  const tokens = tokenizeWithMetadata(safeText);
  if (tokens.length === 0) return 0;

  const { score } = evaluateTokenSequence(tokens);

  // Clamp score between -5 and +5 rounded to 1 decimal place
  const clamped = Math.max(-5, Math.min(5, score));
  return parseFloat(clamped.toFixed(1));
};

/**
 * Evaluates text and returns a comprehensive analysis object including comparative score,
 * token lists, negation counts, and word hits.
 *
 * @param {string} text - Target text string.
 * @returns {Object} Detailed sentiment analysis metrics.
 */
export const analyzeSentimentDetailed = (text) => {
  if (!text || typeof text !== "string") {
    return {
      score: 0,
      comparative: 0,
      vote: "NEUTRAL",
      tokensAnalyzed: 0,
      positiveWords: [],
      negativeWords: [],
      negationsCount: 0,
    };
  }

  const safeText = text.slice(0, 10000);
  const tokens = tokenizeWithMetadata(safeText);
  const { score, posWords, negWords, negationCount } = evaluateTokenSequence(tokens);

  const clampedScore = Math.max(-5, Math.min(5, score));
  const comparative = tokens.length > 0 ? parseFloat((clampedScore / tokens.length).toFixed(2)) : 0;

  let vote = "NEUTRAL";
  if (clampedScore >= 1.0) vote = "POSITIVE";
  else if (clampedScore <= -1.0) vote = "NEGATIVE";

  return {
    score: parseFloat(clampedScore.toFixed(1)),
    comparative,
    vote,
    tokensAnalyzed: tokens.length,
    positiveWords: posWords,
    negativeWords: negWords,
    negationsCount: negationCount,
  };
};

/**
 * Decomposes multi-sentence feedback and returns sentiment breakdown per sentence.
 *
 * @param {string} text - Multi-sentence input text.
 * @returns {Array<{sentence: string, score: number}>} Array of sentence sentiment scores.
 */
export const analyzeSentences = (text) => {
  if (!text || typeof text !== "string") return [];

  const rawSentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);

  return rawSentences.map((sentence) => ({
    sentence: sentence.trim(),
    score: analyzeSentiment(sentence),
  }));
};

/**
 * Batch processes an array of text entries.
 *
 * @param {Array<string>} textArray - Array of text comments.
 * @returns {Array<number>} Array of sentiment scores.
 */
export const batchAnalyzeSentiment = (textArray) => {
  if (!Array.isArray(textArray)) return [];
  return textArray.map((t) => analyzeSentiment(t));
};

// ============================================================================
// 4. UI Display & Formatting Helper
// ============================================================================

/**
 * Gets descriptive UI display metadata (emoji, label, Tailwind color class, badge styles)
 * based on the sentiment score.
 *
 * @param {number} score - Sentiment score (-5 to +5).
 * @returns {{emoji: string, label: string, color: string, badgeClass: string, ariaLabel: string}} UI config object.
 */
export const getSentimentDisplay = (score) => {
  const numScore = typeof score === "number" ? score : parseFloat(score) || 0;

  if (numScore >= 1.5) {
    return {
      emoji: "🌟",
      label: "Excited / Highly Positive",
      color: "text-green-500 dark:text-green-400 animate-bounce",
      badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      ariaLabel: "Highly Positive Sentiment",
    };
  }
  if (numScore > 0.2) {
    return {
      emoji: "🙂",
      label: "Happy / Positive",
      color: "text-emerald-500 dark:text-emerald-400",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      ariaLabel: "Positive Sentiment",
    };
  }
  if (numScore <= -1.5) {
    return {
      emoji: "😢",
      label: "Frustrated / Highly Negative",
      color: "text-red-500 dark:text-red-400 animate-pulse",
      badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      ariaLabel: "Highly Negative Sentiment",
    };
  }
  if (numScore < -0.2) {
    return {
      emoji: "🙁",
      label: "Muted / Negative",
      color: "text-amber-500 dark:text-amber-400",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      ariaLabel: "Negative Sentiment",
    };
  }
  return {
    emoji: "😐",
    label: "Neutral",
    color: "text-gray-500 dark:text-gray-400",
    badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    ariaLabel: "Neutral Sentiment",
  };
};

export default analyzeSentiment;
