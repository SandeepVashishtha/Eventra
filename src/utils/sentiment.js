/**
 * Simple keyword-matching sentiment analyzer
 * Evaluates a string and returns a score between -5 (highly negative) and +5 (highly positive)
 */

// ============================================================================
// 1. EXTENDED LEXICONS & DICTIONARIES
// ============================================================================

const POSITIVE_KEYWORDS = new Set([
  "love", "like", "perfect", "amazing", "great", "excellent", "awesome",
  "fantastic", "beautiful", "helpful", "easy", "fast", "smooth", "happy",
  "nice", "resolved", "satisfied", "solved", "best", "cool", "wonderful",
  "superb", "outstanding", "impressive", "brilliant", "glad", "enjoyed",
  "delightful", "intuitive", "topnotch", "flawless", "responsive", "reliable",
  "stellar", "unmatched", "genius", "thriving", "phenomenon", "phenomenal",
  "favorite", "favourite", "efficient", "seamless", "crisp", "elegant",
  "clean", "solid", "polished", "streamlined", "valuable", "super", "rockstar",
  "recommend", "recommended", "loveable", "victory", "triumph", "winning",
  "joy", "pleasure", "effortless", "genius", "worthwhile", "legendary"
]);

const NEGATIVE_KEYWORDS = new Set([
  "hate", "dislike", "terrible", "bad", "awful", "broke", "crash", "bug",
  "error", "slow", "lag", "poor", "hard", "difficult", "complex", "frustrated",
  "fail", "worst", "issues", "broken", "complain", "annoyed", "useless",
  "crashed", "slowly", "laggy", "painful", "horrible", "defect", "failure",
  "garbage", "trash", "unusable", "unresponsive", "flaky", "glitch", "glitchy",
  "sucks", "disappointment", "disappointing", "disappointed", "nightmare",
  "shoddy", "clunky", "bloated", "vulnerable", "vulnerability", "catastrophe",
  "dreadful", "miserable", "annoying", "regret", "waste", "expensive",
  "overpriced", "scam", "shame", "risky", "unstable", "freeze", "freezes"
]);

/**
 * Intensifiers & Modifiers: Scale surrounding word score by multiplier
 */
const INTENSIFIERS = new Map([
  ["very", 1.5],
  ["extremely", 2.0],
  ["super", 1.6],
  ["ultra", 1.8],
  ["incredibly", 1.8],
  ["really", 1.4],
  ["absolutely", 1.9],
  ["totally", 1.5],
  ["completely", 1.6],
  ["exceptionally", 1.8],
  ["massively", 1.7],
  ["slightly", 0.5],
  ["somewhat", 0.6],
  ["barely", 0.3],
  ["hardly", 0.3],
  ["a bit", 0.5],
  ["kind of", 0.6],
  ["sort of", 0.6]
]);

/**
 * Negation vocabulary triggering inversion within a target window
 */
const NEGATIONS = new Set([
  "not", "no", "never", "neither", "nor", "none", "cannot", "cant", "can't",
  "dont", "don't", "wasnt", "wasn't", "isnt", "isn't", "aint", "ain't",
  "wouldnt", "wouldn't", "couldnt", "couldn't", "shouldnt", "shouldn't",
  "lack", "lacking", "without", "hardly", "scarcely"
]);

/**
 * Contrast words that shift weight towards trailing clauses
 */
const CONTRAST_WORDS = new Set([
  "but", "however", "although", "though", "yet", "nevertheless", "nonetheless",
  "whereas", "despite", "except"
]);

/**
 * Emoji sentiment mapping with intrinsic valence scores
 */
const EMOJI_LEXICON = new Map([
  ["😀", 1.2], ["😃", 1.5], ["😄", 1.6], ["😁", 1.5], ["😆", 1.4],
  ["😅", 0.8], ["🤣", 1.8], ["😂", 1.5], ["🙂", 1.0], ["🙃", -0.2],
  ["😉", 0.9], ["😊", 1.4], ["😇", 1.5], ["🥰", 2.0], ["😍", 2.0],
  ["🤩", 1.9], ["😘", 1.5], ["😋", 1.2], ["😛", 0.8], ["😜", 0.9],
  ["🤪", 0.7], ["🤑", 1.1], ["🤗", 1.3], ["🤭", 0.4], ["🥳", 1.8],
  ["😎", 1.4], ["🤓", 0.8], ["🎉", 1.8], ["🚀", 1.6], ["🔥", 1.5],
  ["👍", 1.4], ["👏", 1.5], ["🙌", 1.6], ["❤️", 2.0], ["💖", 1.9],
  ["🙁", -1.0], ["☹️", -1.4], ["😮", -0.3], ["😯", -0.4], ["😳", -0.5],
  ["🥺", -0.6], ["😦", -1.1], ["😧", -1.2], ["😨", -1.4], ["😰", -1.5],
  ["😥", -1.2], ["😢", -1.6], ["😭", -1.9], ["😱", -1.8], ["😖", -1.5],
  ["😣", -1.4], ["😞", -1.3], ["😓", -1.1], ["😩", -1.6], ["😫", -1.7],
  ["🥱", -0.8], ["😤", -1.3], ["😡", -2.0], ["🤬", -2.5], ["😈", -0.8],
  ["👿", -1.8], ["💀", -1.5], ["💩", -2.0], ["👎", -1.5], ["💔", -2.0]
]);

/**
 * Domain-specific aspect tags for classification
 */
const ASPECT_DICTIONARY = {
  performance: new Set(["speed", "fast", "slow", "lag", "latency", "performance", "cpu", "memory", "quick", "delay", "load"]),
  ui_ux: new Set(["ui", "ux", "interface", "design", "layout", "theme", "color", "button", "screen", "visual", "look"]),
  reliability: new Set(["bug", "crash", "freeze", "error", "defect", "fail", "failure", "broken", "stable", "reliability", "uptime"]),
  support: new Set(["support", "help", "ticket", "agent", "service", "representative", "chat", "response", "assisted"]),
  pricing: new Set(["price", "cost", "expensive", "cheap", "value", "subscription", "plan", "billing", "fee", "charged"])
};

// ============================================================================
// 2. TOKENIZATION, EMOJI, & TEXT NORMALIZATION HELPERS
// ============================================================================

/**
 * Expands common English contractions for accurate keyword matching
 */
const expandContractions = (text) => {
  return text
    .replace(/won't/gi, "will not")
    .replace(/can't/gi, "can not")
    .replace(/n't/gi, " not")
    .replace(/'re/gi, " are")
    .replace(/'s/gi, " is")
    .replace(/'d/gi, " would")
    .replace(/'ll/gi, " will")
    .replace(/'t/gi, " not")
    .replace(/'ve/gi, " have")
    .replace(/'m/gi, " am");
};

/**
 * Extracts emojis from text string
 */
const extractEmojis = (text) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.match(emojiRegex) || [];
};

/**
 * Splits text into sentences cleanly
 */
const splitIntoSentences = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

/**
 * Generates N-grams (unigrams, bigrams, trigrams) from token array
 */
const generateNGrams = (tokens, n = 2) => {
  const nGrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    nGrams.push(tokens.slice(i, i + n).join(" "));
  }
  return nGrams;
};

// ============================================================================
// 3. CORE SENTIMENT ANALYZER (EXPORTS & ENHANCEMENTS)
// ============================================================================

export const analyzeSentiment = (text) => {
  if (!text || typeof text !== "string") {
    return 0; // Neutral default
  }

  const rawText = text.trim();
  if (rawText.length === 0) return 0;

  const expandedText = expandContractions(rawText);
  const normalized = expandedText.toLowerCase();

  // 1. Emoji Valence Analysis
  let emojiScore = 0;
  const foundEmojis = extractEmojis(rawText);
  foundEmojis.forEach(emoji => {
    if (EMOJI_LEXICON.has(emoji)) {
      emojiScore += EMOJI_LEXICON.get(emoji);
    }
  });

  // 2. Tokenize Words
  const words = normalized.match(/[a-z]+/g) || [];
  if (words.length === 0 && foundEmojis.length === 0) return 0;

  let baseScore = 0;
  const negationWindowSize = 3;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let termWeight = 0;

    if (POSITIVE_KEYWORDS.has(word)) {
      termWeight = 1.5;
    } else if (NEGATIVE_KEYWORDS.has(word)) {
      termWeight = -1.5;
    }

    if (termWeight !== 0) {
      // Check for preceding intensifier (e.g. "very good")
      let multiplier = 1.0;
      if (i > 0 && INTENSIFIERS.has(words[i - 1])) {
        multiplier = INTENSIFIERS.get(words[i - 1]);
      } else if (i > 1 && INTENSIFIERS.has(`${words[i - 2]} ${words[i - 1]}`)) {
        multiplier = INTENSIFIERS.get(`${words[i - 2]} ${words[i - 1]}`);
      }

      // Check for preceding negation within window (e.g. "not very good")
      let isNegated = false;
      const startWindow = Math.max(0, i - negationWindowSize);
      for (let j = startWindow; j < i; j++) {
        if (NEGATIONS.has(words[j])) {
          isNegated = true;
          break;
        }
      }

      termWeight *= multiplier;

      if (isNegated) {
        termWeight *= -0.8; // Invert and slightly soften score
      }

      baseScore += termWeight;
    }
  }

  // 3. Contrast Clause Adjustment ("...but it was awful")
  let contrastMultiplier = 1.0;
  words.forEach(word => {
    if (CONTRAST_WORDS.has(word)) {
      contrastMultiplier = 1.25; // Boost score shift for post-contrast clause
    }
  });

  // 4. Punctuation & Upper Case Signals
  let uppercaseBoost = 1.0;
  const alphaChars = rawText.replace(/[^a-zA-Z]/g, "");
  if (alphaChars.length > 4 && alphaChars === alphaChars.toUpperCase()) {
    uppercaseBoost = 1.3; // ALL CAPS increases intensity
  }

  const exclamationCount = (rawText.match(/!/g) || []).length;
  const exclamationBoost = Math.min(1.5, 1.0 + exclamationCount * 0.15);

  // Total raw calculation
  let totalScore = (baseScore + emojiScore) * contrastMultiplier * uppercaseBoost * exclamationBoost;

  // Clamp score between -5 and +5
  return Math.max(-5, Math.min(5, parseFloat(totalScore.toFixed(1))));
};

/**
 * Gets a descriptive label and an emoji representation based on the sentiment score
 */
export const getSentimentDisplay = (score) => {
  if (score >= 3.0) {
    return {
      emoji: "🤩",
      label: "Ecstatic / Extremely Positive",
      color: "text-emerald-600 dark:text-emerald-300 animate-bounce font-bold"
    };
  }
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
  if (score <= -3.0) {
    return {
      emoji: "🤬",
      label: "Enraged / Extremely Negative",
      color: "text-rose-700 dark:text-rose-400 animate-ping font-bold"
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

// ============================================================================
// 4. ADVANCED DEEP ANALYZER (DETAILED BREAKDOWN & ASPECT ANALYSIS)
// ============================================================================

/**
 * Performs comprehensive analysis including aspect breakdown, sentence scores, and metrics
 */
export const analyzeSentimentDetailed = (text) => {
  if (!text || typeof text !== "string") {
    return {
      overallScore: 0,
      display: getSentimentDisplay(0),
      sentenceBreakdown: [],
      aspects: {},
      stats: { wordCount: 0, sentenceCount: 0, emojiCount: 0 },
      subjectivity: "Objective"
    };
  }

  const sentences = splitIntoSentences(text);
  const sentenceBreakdown = sentences.map(sentence => {
    const score = analyzeSentiment(sentence);
    return {
      sentence,
      score,
      display: getSentimentDisplay(score)
    };
  });

  const overallScore = analyzeSentiment(text);

  // Aspect Based Sentiment Extraction
  const aspectScores = {
    performance: [],
    ui_ux: [],
    reliability: [],
    support: [],
    pricing: []
  };

  const words = text.toLowerCase().match(/[a-z]+/g) || [];

  sentences.forEach(sentence => {
    const sentScore = analyzeSentiment(sentence);
    const sentWords = sentence.toLowerCase().match(/[a-z]+/g) || [];

    Object.keys(ASPECT_DICTIONARY).forEach(aspect => {
      const keywords = ASPECT_DICTIONARY[aspect];
      const matchesAspect = sentWords.some(w => keywords.has(w));
      if (matchesAspect) {
        aspectScores[aspect].push(sentScore);
      }
    });
  });

  const summarizedAspects = {};
  Object.keys(aspectScores).forEach(aspect => {
    const scores = aspectScores[aspect];
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      summarizedAspects[aspect] = {
        score: parseFloat(avg.toFixed(1)),
        mentionCount: scores.length,
        display: getSentimentDisplay(avg)
      };
    }
  });

  // Subjectivity score heuristic
  let polarWordCount = 0;
  words.forEach(w => {
    if (POSITIVE_KEYWORDS.has(w) || NEGATIVE_KEYWORDS.has(w) || INTENSIFIERS.has(w)) {
      polarWordCount++;
    }
  });
  const subjectivityRatio = words.length > 0 ? polarWordCount / words.length : 0;
  const subjectivity = subjectivityRatio > 0.25 ? "Highly Subjective" : subjectivityRatio > 0.1 ? "Moderately Subjective" : "Objective";

  return {
    overallScore,
    display: getSentimentDisplay(overallScore),
    sentenceBreakdown,
    aspects: summarizedAspects,
    stats: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      emojiCount: extractEmojis(text).length
    },
    subjectivity
  };
};

// ============================================================================
// 5. TEXT READABILITY & METRICS UTILITIES
// ============================================================================

/**
 * Calculates Flesch Reading Ease and Flesch-Kincaid Grade Level
 */
export const calculateReadability = (text) => {
  if (!text || typeof text !== "string") {
    return { fleschReadingEase: 100, gradeLevel: 0, readabilityLabel: "N/A" };
  }

  const words = text.match(/[a-z]+/gi) || [];
  const sentences = splitIntoSentences(text);

  if (words.length === 0 || sentences.length === 0) {
    return { fleschReadingEase: 100, gradeLevel: 0, readabilityLabel: "Very Easy" };
  }

  // Syllable Counter Helper
  const countSyllables = (word) => {
    const w = word.toLowerCase();
    if (w.length <= 3) return 1;
    const cleanWord = w.replace(/(?:[^laeiouy]|ed|es|e)$/, "").replace(/^y/, "");
    const matches = cleanWord.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const totalWords = words.length;
  const totalSentences = sentences.length;

  const fleschReadingEase = 206.835 - (1.015 * (totalWords / totalSentences)) - (84.6 * (totalSyllables / totalWords));
  const gradeLevel = (0.39 * (totalWords / totalSentences)) + (11.8 * (totalSyllables / totalWords)) - 15.59;

  let label = "Standard";
  if (fleschReadingEase >= 90) label = "Very Easy";
  else if (fleschReadingEase >= 80) label = "Easy";
  else if (fleschReadingEase >= 70) label = "Fairly Easy";
  else if (fleschReadingEase >= 60) label = "Standard";
  else if (fleschReadingEase >= 50) label = "Fairly Difficult";
  else if (fleschReadingEase >= 30) label = "Difficult";
  else label = "Very Confusing";

  return {
    fleschReadingEase: parseFloat(Math.max(0, Math.min(100, fleschReadingEase)).toFixed(1)),
    gradeLevel: parseFloat(Math.max(0, gradeLevel).toFixed(1)),
    readabilityLabel: label
  };
};

// ============================================================================
// 6. OBJECT-ORIENTED ENGINE & BATCH PROCESSORS
// ============================================================================

/**
 * Configurable Custom Sentiment Engine Class
 */
export class SentimentEngine {
  constructor(options = {}) {
    this.customPositive = new Set(options.customPositive || []);
    this.customNegative = new Set(options.customNegative || []);
    this.multiplier = options.multiplier || 1.0;
  }

  /**
   * Extends vocabulary dynamically at runtime
   */
  addCustomKeywords(positives = [], negatives = []) {
    positives.forEach(w => this.customPositive.add(w.toLowerCase()));
    negatives.forEach(w => this.customNegative.add(w.toLowerCase()));
  }

  /**
   * Scores text using base rules + custom dictionary overrides
   */
  evaluate(text) {
    let score = analyzeSentiment(text);

    if (text && typeof text === "string") {
      const words = text.toLowerCase().match(/[a-z]+/g) || [];
      words.forEach(word => {
        if (this.customPositive.has(word)) score += 1.0;
        if (this.customNegative.has(word)) score -= 1.0;
      });
    }

    score *= this.multiplier;
    const clamped = Math.max(-5, Math.min(5, parseFloat(score.toFixed(1))));

    return {
      score: clamped,
      display: getSentimentDisplay(clamped)
    };
  }
}

/**
 * Batch Sentiment Analyzer for processing arrays of texts
 */
export class BatchSentimentAnalyzer {
  constructor(engine = null) {
    this.engine = engine || new SentimentEngine();
  }

  /**
   * Processes array of text documents and returns overall metrics
   */
  processBatch(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        totalItems: 0,
        averageScore: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        results: []
      };
    }

    let totalScore = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    const results = items.map((text, index) => {
      const evaluation = this.engine.evaluate(text);
      const score = evaluation.score;

      totalScore += score;
      if (score > 0.2) positiveCount++;
      else if (score < -0.2) negativeCount++;
      else neutralCount++;

      return {
        id: index,
        text,
        score,
        display: evaluation.display
      };
    });

    const averageScore = parseFloat((totalScore / items.length).toFixed(1));

    return {
      totalItems: items.length,
      averageScore,
      aggregateDisplay: getSentimentDisplay(averageScore),
      distribution: {
        positiveRatio: parseFloat((positiveCount / items.length).toFixed(2)),
        neutralRatio: parseFloat((neutralCount / items.length).toFixed(2)),
        negativeRatio: parseFloat((negativeCount / items.length).toFixed(2))
      },
      counts: { positiveCount, neutralCount, negativeCount },
      results
    };
  }
}

/**
 * Real-Time Rolling Window Sentiment Aggregator for stream processing
 */
export class StreamSentimentAggregator {
  constructor(windowSize = 50) {
    this.windowSize = windowSize;
    this.history = [];
  }

  /**
   * Pushes a new comment/message into the rolling window
   */
  ingest(text) {
    const score = analyzeSentiment(text);
    this.history.push({
      timestamp: Date.now(),
      score
    });

    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    return score;
  }

  /**
   * Gets moving average and momentum of current stream window
   */
  getStreamMetrics() {
    if (this.history.length === 0) {
      return { rollingAverage: 0, momentum: "Stable", count: 0 };
    }

    const sum = this.history.reduce((acc, curr) => acc + curr.score, 0);
    const avg = parseFloat((sum / this.history.length).toFixed(1));

    // Calculate Momentum (Compare first half vs second half of window)
    let momentum = "Stable";
    if (this.history.length >= 4) {
      const half = Math.floor(this.history.length / 2);
      const firstHalf = this.history.slice(0, half);
      const secondHalf = this.history.slice(half);

      const avg1 = firstHalf.reduce((a, b) => a + b.score, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b.score, 0) / secondHalf.length;

      const diff = avg2 - avg1;
      if (diff > 0.5) momentum = "Improving";
      else if (diff < -0.5) momentum = "Declining";
    }

    return {
      rollingAverage: avg,
      display: getSentimentDisplay(avg),
      momentum,
      windowCount: this.history.length
    };
  }

  /**
   * Clears the rolling history window
   */
  reset() {
    this.history = [];
  }
}

// ============================================================================
// 7. FORMATTERS & HTML REPORT GENERATOR UTILITIES
// ============================================================================

/**
 * Generates an HTML formatted markup string showcasing sentiment highlights
 */
export const generateSentimentHTMLReport = (text) => {
  const analysis = analyzeSentimentDetailed(text);

  let html = `<div class="sentiment-report p-4 rounded-lg bg-slate-900 text-slate-100 font-sans">\n`;
  html += `  <div class="flex items-center space-x-3 mb-4">\n`;
  html += `    <span class="text-3xl">${analysis.display.emoji}</span>\n`;
  html += `    <div>\n`;
  html += `      <h3 class="text-lg font-semibold">Overall Score: ${analysis.overallScore} / 5.0</h3>\n`;
  html += `      <p class="${analysis.display.color}">${analysis.display.label}</p>\n`;
  html += `    </div>\n`;
  html += `  </div>\n`;

  if (analysis.sentenceBreakdown.length > 0) {
    html += `  <div class="space-y-2 mt-4">\n`;
    html += `    <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sentence Breakdown</h4>\n`;
    analysis.sentenceBreakdown.forEach((item, idx) => {
      html += `    <div class="p-2 rounded bg-slate-800 border-l-4 ${item.score >= 0 ? 'border-emerald-500' : 'border-rose-500'} flex justify-between text-sm">\n`;
      html += `      <span>${idx + 1}. "${item.sentence}"</span>\n`;
      html += `      <span class="font-mono ${item.display.color}">${item.score} ${item.display.emoji}</span>\n`;
      html += `    </div>\n`;
    });
    html += `  </div>\n`;
  }

  if (Object.keys(analysis.aspects).length > 0) {
    html += `  <div class="mt-4 grid grid-cols-2 gap-2">\n`;
    Object.entries(analysis.aspects).forEach(([aspect, data]) => {
      html += `    <div class="p-2 bg-slate-800 rounded border border-slate-700 text-xs">\n`;
      html += `      <span class="capitalize font-bold text-slate-300">${aspect}:</span> ${data.score} (${data.mentionCount} mentions)\n`;
      html += `    </div>\n`;
    });
    html += `  </div>\n`;
  }

  html += `</div>`;
  return html;
};