/**
 * WebGPU Compute Shaders for Interactive Venue Seating Map (#17692)
 * 
 * This module contains WGSL shaders for rendering 10,000+ seats with:
 * - Vertex shader for seat geometry
 * - Fragment shader for seat coloring based on state
 * - Compute shader for dynamic seat updates
 */

/**
 * Seat vertex shader - transforms seat positions
 * Each seat has: position (vec2), size (vec2), state (u32)
 */
export const SEAT_VERTEX_SHADER = /* wgsl */ `
struct Uniforms {
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
};

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
  @location(0) position: vec2<f32>,
  @location(1) size: vec2<f32>,
  @location(2) state: u32,
  @location(3) seatIndex: u32,
};

struct VertexOutput {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) seatState: u32,
  @location(2) seatIndex: u32,
};

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  
  // Create quad from point
  // Corner positions (-1 to 1 in both axes)
  let cornerX = f32((input.seatIndex % 2u) * 2u - 1u);
  let cornerY = f32((input.seatIndex / 2u) % 2u * 2u - 1u);
  
  // Calculate vertex position for the quad
  let vertexPos = input.position + vec2<f32>(cornerX * input.size.x * 0.5, cornerY * input.size.y * 0.5);
  
  // Transform to clip space
  output.clipPosition = uniforms.projectionMatrix * uniforms.viewMatrix * vec4<f32>(vertexPos, 0.0, 1.0);
  
  // Pass state for fragment shader
  output.seatState = input.state;
  output.seatIndex = input.seatIndex / 4u; // Divide by 4 because each seat has 4 vertices
  
  // Color based on state (will be overridden in fragment shader)
  output.color = vec4<f32>(0.0, 0.0, 0.0, 1.0);
  
  return output;
}
`;

/**
 * Seat fragment shader - colors seats based on their state
 * States: 0 = available, 1 = selected, 2 = reserved, 3 = hover
 */
export const SEAT_FRAGMENT_SHADER = /* wgsl */ `
@fragment
fn main(
  @location(0) color: vec4<f32>,
  @location(1) seatState: u32,
  @location(2) seatIndex: u32
) -> @location(0) vec4<f32> {
  // Define colors for different seat states
  let availableColor = vec4<f32>(0.239, 0.690, 1.0, 1.0); // Light blue
  let selectedColor = vec4<f32>(0.067, 0.733, 0.533, 1.0); // Emerald green
  let reservedColor = vec4<f32>(0.647, 0.667, 0.686, 1.0); // Gray
  let hoverColor = vec4<f32>(0.459, 0.804, 0.980, 1.0); // Lighter blue
  
  switch (seatState) {
    case 0u: { // Available
      return availableColor;
    }
    case 1u: { // Selected
      return selectedColor;
    }
    case 2u: { // Reserved
      return reservedColor;
    }
    case 3u: { // Hover
      return hoverColor;
    }
    default: {
      return vec4<f32>(1.0, 0.0, 1.0, 1.0); // Magenta for error state
    }
  }
}
`;

/**
 * Compute shader for updating seat states
 * This shader updates seat states in a storage buffer
 */
export const SEAT_COMPUTE_SHADER = /* wgsl */ `
struct Seat {
  position: vec2<f32>,
  size: vec2<f32>,
  state: u32,
  id: u32,
  padding: u32,
};

@binding(0) @group(0) var<storage, read_write> seatBuffer: array<Seat>;
@binding(1) @group(0) var<uniform> updateCommands: array<u32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID: vec3<u32>) {
  let index = GlobalInvocationID.x;
  
  // Only process valid seats
  if (index >= arrayLength(&seatBuffer)) {
    return;
  }
  
  var seat = seatBuffer[index];
  
  // Check if there's an update command for this seat
  // For simplicity, we'll process direct updates
  // In practice, this would be driven by a command buffer
  
  // For now, just keep the seat as-is
  // Actual updates will be handled via JavaScript dispatch
  
  seatBuffer[index] = seat;
}
`;

/**
 * Vertex shader for instanced rendering (more efficient for 10k+ seats)
 * Uses instancing to reduce vertex data
 */
export const SEAT_INSTANCED_VERTEX_SHADER = /* wgsl */ `
struct Uniforms {
  viewProjectionMatrix: mat4x4<f32>,
};

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct SeatInstance {
  position: vec2<f32>,
  size: vec2<f32>,
  state: u32,
};

@binding(1) @group(0) var<storage> seatInstances: array<SeatInstance>;

struct VertexInput {
  @location(0) cornerPosition: vec2<f32>,
  @location(1) instanceIndex: u32,
};

struct VertexOutput {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) seatState: u32,
};

// Quad positions for each seat (normalized -1 to 1)
const QUAD_POSITIONS = array<vec2<f32>, 4>(
  vec2<f32>(-1.0, -1.0),
  vec2<f32>(1.0, -1.0),
  vec2<f32>(-1.0, 1.0),
  vec2<f32>(1.0, 1.0)
);

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  
  let instance = seatInstances[input.instanceIndex];
  
  // Get the corner position from the vertex
  let cornerPos = QUAD_POSITIONS[input.cornerPosition.x > 0.0 ? (input.cornerPosition.y > 0.0 ? 3u : 1u) : (input.cornerPosition.y > 0.0 ? 2u : 0u)];
  
  // Calculate world position
  let worldPos = instance.position + cornerPos * instance.size * 0.5;
  
  // Transform to clip space
  output.clipPosition = uniforms.viewProjectionMatrix * vec4<f32>(worldPos, 0.0, 1.0);
  
  // Pass state to fragment shader
  output.seatState = instance.state;
  
  return output;
}
`;

/**
 * Fragment shader for instanced rendering
 */
export const SEAT_INSTANCED_FRAGMENT_SHADER = /* wgsl */ `
@fragment
fn main(@location(0) seatState: u32) -> @location(0) vec4<f32> {
  // Define colors for different seat states
  let availableColor = vec4<f32>(0.239, 0.690, 1.0, 1.0); // Light blue (#3B82F6)
  let selectedColor = vec4<f32>(0.067, 0.733, 0.533, 1.0); // Emerald green (#10B981)
  let reservedColor = vec4<f32>(0.647, 0.667, 0.686, 1.0); // Gray (#9CA3AF)
  let hoverColor = vec4<f32>(0.459, 0.804, 0.980, 1.0); // Lighter blue (#58A5FF)
  
  switch (seatState) {
    case 0u: return availableColor;
    case 1u: return selectedColor;
    case 2u: return reservedColor;
    case 3u: return hoverColor;
    default: return vec4<f32>(1.0, 0.0, 1.0, 1.0);
  }
}
`;

/**
 * Compute shader for mouse interaction
 * Updates seat states based on mouse position
 */
export const SEAT_INTERACTION_SHADER = /* wgsl */ `
struct Seat {
  position: vec2<f32>,
  size: vec2<f32>,
  state: u32,
  id: u32,
  padding: u32,
};

@binding(0) @group(0) var<storage, read_write> seatBuffer: array<Seat>;

@binding(1) @group(0) var<uniform> mouseParams: vec4<f32>; // x, y, radius, action (0=none, 1=hover, 2=select)

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID: vec3<u32>) {
  let index = GlobalInvocationID.x;
  
  if (index >= arrayLength(&seatBuffer)) {
    return;
  }
  
  var seat = seatBuffer[index];
  let mousePos = mouseParams.xy;
  let radius = mouseParams.z;
  let action = u32(mouseParams.w);
  
  // Calculate distance from mouse to seat center
  let dx = seat.position.x - mousePos.x;
  let dy = seat.position.y - mousePos.y;
  let distance = sqrt(dx * dx + dy * dy);
  
  // Check if mouse is over this seat
  let isOver = distance < radius && distance < max(seat.size.x, seat.size.y) * 0.5;
  
  if (isOver) {
    // Update state based on action
    switch (action) {
      case 1u: { // Hover
        seat.state = 3u;
      }
      case 2u: { // Select
        if (seat.state != 2u) { // Don't select if reserved
          seat.state = 1u;
        }
      }
      default: {}
    }
  } else if (action == 0u) {
    // Reset hover state if mouse is not over this seat
    if (seat.state == 3u) {
      seat.state = 0u;
    }
  }
  
  seatBuffer[index] = seat;
}
`;

/**
 * Seat state constants
 */
export const SEAT_STATE = {
  AVAILABLE: 0,
  SELECTED: 1,
  RESERVED: 2,
  HOVER: 3,
};

/**
 * Default seat size
 */
export const DEFAULT_SEAT_SIZE = { width: 24, height: 24 };

/**
 * Default seat padding
 */
export const DEFAULT_SEAT_PADDING = { x: 8, y: 8 };
