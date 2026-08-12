/**
 * WGSL Shader Definitions for WebGPU 3D Spatial Event Stage & Booth Visualizer (#14039)
 */

export const STAGE_VERTEX_SHADER = /* wgsl */ `
struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>,
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexInput {
  @location(0) position : vec3<f32>,
  @location(1) color : vec3<f32>,
};

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) color : vec3<f32>,
};

@vertex
fn main(input : VertexInput) -> VertexOutput {
  var output : VertexOutput;
  output.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(input.position, 1.0);
  output.color = input.color;
  return output;
}
`;

export const STAGE_FRAGMENT_SHADER = /* wgsl */ `
@fragment
fn main(@location(0) color : vec3<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(color, 1.0);
}
`;

export const COMPUTE_PARTICLE_SHADER = /* wgsl */ `
struct Particle {
  position : vec3<f32>,
  velocity : vec3<f32>,
};

struct Particles {
  particles : array<Particle>,
};

@binding(0) @group(0) var<storage, read_write> particleBuffer : Particles;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
  let index = GlobalInvocationID.x;
  var p = particleBuffer.particles[index];
  p.position = p.position + p.velocity * 0.016;
  if (p.position.y > 10.0) {
    p.position.y = 0.0;
  }
  particleBuffer.particles[index] = p;
}
`;
