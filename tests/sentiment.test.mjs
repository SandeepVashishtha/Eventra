import assert from "node:assert/strict";
import { analyzeSentiment, getSentimentDisplay } from "../src/utils/sentiment.js";

// Test neutral cases
assert.equal(analyzeSentiment(""), 0);
assert.equal(analyzeSentiment(null), 0);
assert.equal(analyzeSentiment(undefined), 0);
assert.equal(analyzeSentiment("Hello world"), 0);

// Test positive cases
assert.equal(analyzeSentiment("This is great and amazing!"), 3.0);
assert.equal(analyzeSentiment("I love Eventra, it's perfect!"), 3.0);
assert.equal(analyzeSentiment("fantastic excellent awesome helpful"), 5.0); // Clamped to 5.0

// Test negative cases
assert.equal(analyzeSentiment("I hate this laggy app, it broke!"), -4.5);
assert.equal(analyzeSentiment("terrible crash failure poor design"), -5.0); // Clamped to -5.0

// Test displays
const excitedDisplay = getSentimentDisplay(4.0);
assert.equal(excitedDisplay.emoji, "🌟");
assert.match(excitedDisplay.label, /Excited/);

const happyDisplay = getSentimentDisplay(1.0);
assert.equal(happyDisplay.emoji, "🙂");

const neutralDisplay = getSentimentDisplay(0.0);
assert.equal(neutralDisplay.emoji, "😐");

const negativeDisplay = getSentimentDisplay(-1.0);
assert.equal(negativeDisplay.emoji, "🙁");

const angryDisplay = getSentimentDisplay(-3.0);
assert.equal(angryDisplay.emoji, "😢");

console.log("Sentiment utility tests passed successfully!");
