import assert from "node:assert/strict";

import { analyzeSentiment, getSentimentDisplay } from "../src/utils/sentiment.js";

// Test analyzeSentiment
assert.strictEqual(analyzeSentiment(null), 0, "null should return 0");
assert.strictEqual(analyzeSentiment(undefined), 0, "undefined should return 0");
assert.strictEqual(analyzeSentiment(123), 0, "non-string should return 0");
assert.strictEqual(analyzeSentiment(""), 0, "empty string should return 0");
assert.strictEqual(analyzeSentiment("hello world"), 0, "neutral text should return 0");

const happyScore = analyzeSentiment("I love this amazing great excellent thing");
assert.ok(happyScore > 0, "positive keywords should give positive score");

const sadScore = analyzeSentiment("This is terrible bad awful hate issues broken failure");
assert.ok(sadScore < 0, "negative keywords should give negative score");

const mixedScore = analyzeSentiment("I love this but also hate that broken and amazing");
assert.strictEqual(mixedScore, 0, "equal positive and negative should cancel out");

const manyPositive = analyzeSentiment("love love love love love love love love");
const clampedPos = analyzeSentiment("love ".repeat(20));
assert.strictEqual(clampedPos, 5, "score should clamp at +5");
assert.strictEqual(analyzeSentiment("hate ".repeat(20)), -5, "score should clamp at -5");

// Test getSentimentDisplay
const excitedDisplay = getSentimentDisplay(2.0);
assert.strictEqual(excitedDisplay.label, "Excited / Highly Positive", "score >1.5 should be excited");

const happyDisplay = getSentimentDisplay(0.5);
assert.strictEqual(happyDisplay.label, "Happy / Positive", "score 0.2-1.5 should be happy");

const neutralDisplay = getSentimentDisplay(0);
assert.strictEqual(neutralDisplay.label, "Neutral", "score near 0 should be neutral");

const mutedDisplay = getSentimentDisplay(-0.5);
assert.strictEqual(mutedDisplay.label, "Muted / Negative", "score -1.5 to -0.2 should be muted");

const frustratedDisplay = getSentimentDisplay(-2.0);
assert.strictEqual(frustratedDisplay.label, "Frustrated / Highly Negative", "score <-1.5 should be frustrated");

// Test negation handling
const negationNegative = analyzeSentiment("not helpful at all");
assert.ok(negationNegative < 0, "negated positive word ('not helpful') should result in negative score");

const negationPositive = analyzeSentiment("no failure noticed");
assert.ok(negationPositive > 0, "negated negative word ('no failure') should result in positive score");

const negationWindowTest = analyzeSentiment("not very perfect");
assert.ok(negationWindowTest < 0, "negated positive word with intermediate word ('not very perfect') should result in negative score");

console.log("sentiment tests passed ✓");
