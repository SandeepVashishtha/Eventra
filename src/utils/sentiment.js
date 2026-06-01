/**
 * Simple keyword-matching sentiment analyzer
 * Evaluates a string and returns a score between -5 (highly negative) and +5 (highly positive)
 */

const POSITIVE_KEYWORDS = new Set([
  "love", "like", "perfect", "amazing", "great", "excellent", "awesome",
  "fantastic", "beautiful", "helpful", "easy", "fast", "smooth", "happy",
  "nice", "resolved", "satisfied", "solved", "best", "cool", "wonderful",
  "superb", "outstanding", "impressive", "brilliant", "glad", "enjoyed"
]);

const NEGATIVE_KEYWORDS = new Set([
  "hate", "dislike", "terrible", "bad", "awful", "broke", "crash", "bug",
  "error", "slow", "lag", "poor", "hard", "difficult", "complex", "frustrated",
  "fail", "worst", "issues", "broken", "complain", "annoyed", "useless",
  "crashed", "slowly", "laggy", "painful", "horrible", "defect", "failure"
]);

export const analyzeSentiment = (text) => {
  if (!text || typeof text !== "string") {
    return 0; // Neutral default
  }

  const normalized = text.toLowerCase();
  
  // Simple word tokenization matching alphabetic sequences
  const words = normalized.match(/[a-z]+/g) || [];
  
  let score = 0;
  
  words.forEach(word => {
    if (POSITIVE_KEYWORDS.has(word)) {
      score += 1.5;
    } else if (NEGATIVE_KEYWORDS.has(word)) {
      score -= 1.5;
    }
  });

  // Clamp the score between -5 and +5
  return Math.max(-5, Math.min(5, parseFloat(score.toFixed(1))));
};

/**
 * Gets a descriptive label and an emoji representation based on the sentiment score
 */
export const getSentimentDisplay = (score) => {
  if (score >= 1.5) {
    return {
      emoji: "🌟",
      label: "Excited / Highly Positive",
      color: "text-green-500 dark:text-green-400 animate-bounce"
    };
  }
  if (score > 0.2) {
    return {
      emoji: "🙂",
      label: "Happy / Positive",
      color: "text-emerald-500 dark:text-emerald-400"
    };
  }
  if (score < -1.5) {
    return {
      emoji: "😢",
      label: "Frustrated / Highly Negative",
      color: "text-red-500 dark:text-red-400 animate-pulse"
    };
  }
  if (score < -0.2) {
    return {
      emoji: "🙁",
      label: "Muted / Negative",
      color: "text-amber-500 dark:text-amber-400"
    };
  }
  return {
    emoji: "😐",
    label: "Neutral",
    color: "text-gray-500 dark:text-gray-400"
  };
};
