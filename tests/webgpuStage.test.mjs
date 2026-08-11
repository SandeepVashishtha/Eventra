import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  STAGE_VERTEX_SHADER,
  STAGE_FRAGMENT_SHADER,
  COMPUTE_PARTICLE_SHADER,
} from "../src/components/events/webgpu/wgslShaders.js";

describe("WebGPU 3D Spatial Event Stage Tests", () => {
  it("should contain valid WGSL vertex and fragment shader source definitions", () => {
    assert.ok(STAGE_VERTEX_SHADER.includes("@vertex"));
    assert.ok(STAGE_FRAGMENT_SHADER.includes("@fragment"));
    assert.ok(COMPUTE_PARTICLE_SHADER.includes("@compute"));
  });

  it("should format uniform matrix bindings in WGSL shader", () => {
    assert.ok(STAGE_VERTEX_SHADER.includes("modelViewProjectionMatrix"));
  });
});
