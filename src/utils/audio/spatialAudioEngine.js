/**
 * 3D Spatial Audio & Acoustic Distance Simulation Engine (#14047)
 * Calculates distance-based volume attenuation and stereo panning coefficients.
 */

export function calculateDistanceAttenuation(distance, maxDistance = 200, rolloffFactor = 1.0) {
  if (distance <= 0) return 1.0;
  if (distance >= maxDistance) return 0.0;
  
  // Inverse distance model
  const attenuation = 1.0 / (1.0 + rolloffFactor * (distance / maxDistance));
  return Math.max(0, Math.min(1.0, attenuation));
}

export function calculateStereoPan(listenerPos, sourcePos) {
  const dx = sourcePos.x - listenerPos.x;
  const dy = sourcePos.y - listenerPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return 0.0;
  
  // Normalized X difference maps to [-1.0, 1.0] stereo pan
  const pan = dx / distance;
  return Math.max(-1.0, Math.min(1.0, pan));
}

export class SpatialAudioEngine {
  constructor(listenerId) {
    this.listenerId = listenerId;
    this.positions = new Map(); // id -> {x, y}
  }

  updatePosition(id, x, y) {
    this.positions.set(id, { x, y });
  }

  getAcousticCoefficients(sourceId) {
    const listener = this.positions.get(this.listenerId) || { x: 0, y: 0 };
    const source = this.positions.get(sourceId);
    
    if (!source) {
      return { gain: 0.0, pan: 0.0 };
    }

    const dx = source.x - listener.x;
    const dy = source.y - listener.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      gain: parseFloat(calculateDistanceAttenuation(distance).toFixed(3)),
      pan: parseFloat(calculateStereoPan(listener, source).toFixed(3)),
    };
  }
}
