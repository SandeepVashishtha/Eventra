import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDistanceAttenuation,
  calculateStereoPan,
  SpatialAudioEngine,
} from "../src/utils/audio/spatialAudioEngine.js";

describe("Spatial Audio & Acoustic Distance Simulation Engine Tests", () => {
  it("should attenuate volume as distance increases", () => {
    const volAtZero = calculateDistanceAttenuation(0);
    const volNear = calculateDistanceAttenuation(20);
    const volFar = calculateDistanceAttenuation(199);
    const volExceeded = calculateDistanceAttenuation(250);

    assert.equal(volAtZero, 1.0);
    assert.ok(volNear < 1.0);
    assert.ok(volFar < volNear);
    assert.equal(volExceeded, 0.0);
  });

  it("should pan left for sources on the left side of listener", () => {
    const listener = { x: 50, y: 50 };
    const sourceLeft = { x: 10, y: 50 };
    const sourceRight = { x: 90, y: 50 };

    const panLeft = calculateStereoPan(listener, sourceLeft);
    const panRight = calculateStereoPan(listener, sourceRight);

    assert.equal(panLeft, -1.0);
    assert.equal(panRight, 1.0);
  });

  it("should evaluate engine position calculations cleanly", () => {
    const engine = new SpatialAudioEngine("listener-1");
    engine.updatePosition("listener-1", 100, 100);
    engine.updatePosition("speaker-1", 100, 150); // Direct vertical offset (pan=0)

    const coefs = engine.getAcousticCoefficients("speaker-1");
    assert.ok(coefs.gain > 0 && coefs.gain < 1);
    assert.equal(coefs.pan, 0.0);
  });
});
