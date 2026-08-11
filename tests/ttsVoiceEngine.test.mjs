import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatSubtitleCue, TtsVoiceEngine } from "../src/utils/accessibility/ttsVoiceEngine.js";

describe("TTS & Accessibility Caption Subtitle Tests", () => {
  it("should format subtitle cues cleanly with timestamp parameters", () => {
    const cue = formatSubtitleCue("Hello and welcome to Eventra Keynote!", 1);
    assert.ok(cue.id);
    assert.equal(cue.text, "Hello and welcome to Eventra Keynote!");
    assert.ok(cue.timestamp);
  });

  it("should configure and clamp speech rate and pitch bounds", () => {
    const engine = new TtsVoiceEngine();
    engine.setSpeechParameters(3.0, 0.1); // rate clamped to 2.0, pitch clamped to 0.5

    assert.equal(engine.speechRate, 2.0);
    assert.equal(engine.pitch, 0.5);
  });

  it("should trigger callback hooks during offline text-to-speech simulation", (t, done) => {
    const engine = new TtsVoiceEngine();
    let started = false;

    engine.speakTextOffline(
      "Simulating spatial caption broadcast.",
      () => {
        started = true;
      },
      () => {
        assert.equal(started, true);
        done();
      }
    );
  });
});
