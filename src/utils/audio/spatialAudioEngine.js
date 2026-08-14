/**
 * Spatial Audio Engine with Web Audio API PannerNode Integration
 * 
 * This engine provides 3D spatial audio positioning for virtual networking lounges.
 * It calculates distance-based volume attenuation and stereo panning coefficients,
 * and integrates with the Web Audio API's PannerNode for real-time audio positioning.
 * 
 * Features:
 * - Distance-based volume attenuation (inverse distance model)
 * - Stereo panning based on relative position
 * - Web Audio API PannerNode integration for 3D audio
 * - Real-time position updates
 * 
 * @module spatialAudioEngine
 */

/**
 * Calculate distance-based volume attenuation using inverse distance model
 * 
 * @param {number} distance - Distance between listener and source
 * @param {number} [maxDistance=200] - Maximum distance for full volume
 * @param {number} [rolloffFactor=1.0] - Roll-off factor (higher = faster drop-off)
 * @returns {number} Volume gain (0.0 to 1.0)
 */
export function calculateDistanceAttenuation(distance, maxDistance = 200, rolloffFactor = 1.0) {
  if (distance <= 0) return 1.0;
  if (distance >= maxDistance) return 0.0;
  
  // Inverse distance model
  const attenuation = 1.0 / (1.0 + rolloffFactor * (distance / maxDistance));
  return Math.max(0, Math.min(1.0, attenuation));
}

/**
 * Calculate stereo pan based on relative position
 * 
 * @param {Object} listenerPos - Listener position {x, y}
 * @param {Object} sourcePos - Sound source position {x, y}
 * @returns {number} Pan value (-1.0 for left, 0.0 for center, 1.0 for right)
 */
export function calculateStereoPan(listenerPos, sourcePos) {
  const dx = sourcePos.x - listenerPos.x;
  const dy = sourcePos.y - listenerPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return 0.0;
  
  // Normalized X difference maps to [-1.0, 1.0] stereo pan
  const pan = dx / distance;
  return Math.max(-1.0, Math.min(1.0, pan));
}

/**
 * Convert stereo pan to azimuth angle for PannerNode
 * 
 * @param {number} pan - Stereo pan value (-1.0 to 1.0)
 * @returns {number} Azimuth angle in radians (-π/2 to π/2)
 */
export function panToAzimuth(pan) {
  // Stereo pan [-1, 1] maps to azimuth [-π/2, π/2]
  // -1 (left) = -π/2, 0 (center) = 0, 1 (right) = π/2
  return (pan * Math.PI) / 2;
}

/**
 * Spatial Audio Engine with Web Audio API Integration
 * 
 * This class manages participant positions and calculates real-time
 * acoustic coefficients for spatial audio positioning. It supports
 * both coefficient-based calculations and Web Audio API PannerNode
 * integration for true 3D audio.
 */
export class SpatialAudioEngine {
  /**
   * Create a new spatial audio engine
   * 
   * @param {string} listenerId - ID of the listener participant
   */
  constructor(listenerId) {
    this.listenerId = listenerId;
    this.positions = new Map(); // id -> {x, y}
    this.audioContext = null;
    this.pannerNodes = new Map(); // id -> PannerNode
    this.gainNodes = new Map(); // id -> GainNode
    this.audioSources = new Map(); // id -> AudioNode (source)
    
    // Default configuration
    this.maxDistance = 200;
    this.rolloffFactor = 1.0;
    
    // PannerNode configuration
    this.panningModel = 'equalpower'; // 'equalpower' or 'HRTF'
    this.distanceModel = 'inverse'; // 'linear', 'inverse', 'exponential'
    this.refDistance = 1.0;
    this.maxDistancePanner = 10000; // Max distance for PannerNode
  }
  
  /**
   * Initialize the engine with an AudioContext
   * 
   * @param {AudioContext} audioContext - Web Audio API AudioContext
   */
  initAudioContext(audioContext) {
    this.audioContext = audioContext;
  }
  
  /**
   * Set the maximum distance for volume attenuation
   * 
   * @param {number} maxDistance - Maximum distance
   */
  setMaxDistance(maxDistance) {
    this.maxDistance = maxDistance;
    // Update all PannerNodes
    this.pannerNodes.forEach((pannerNode) => {
      if (pannerNode.maxDistance) {
        pannerNode.maxDistance = maxDistance;
      }
    });
  }
  
  /**
   * Set the rolloff factor for distance attenuation
   * 
   * @param {number} rolloffFactor - Roll-off factor
   */
  setRolloffFactor(rolloffFactor) {
    this.rolloffFactor = rolloffFactor;
    // Update all PannerNodes
    this.pannerNodes.forEach((pannerNode) => {
      if (pannerNode.rolloffFactor) {
        pannerNode.rolloffFactor = rolloffFactor;
      }
    });
  }
  
  /**
   * Set the panning model for PannerNode
   * 
   * @param {string} model - 'equalpower' or 'HRTF'
   */
  setPanningModel(model) {
    this.panningModel = model;
    this.pannerNodes.forEach((pannerNode) => {
      pannerNode.panningModel = model;
    });
  }
  
  /**
   * Update the position of a participant
   * 
   * @param {string} id - Participant ID
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  updatePosition(id, x, y) {
    this.positions.set(id, { x, y });
    
    // Update PannerNode if it exists
    if (this.pannerNodes.has(id)) {
      const pannerNode = this.pannerNodes.get(id);
      const listener = this.positions.get(this.listenerId) || { x: 0, y: 0 };
      
      // Convert 2D position to 3D position for PannerNode
      // Use X and Y for stereo panning, Z for distance
      const dx = x - listener.x;
      const dy = y - listener.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Set position relative to listener
      pannerNode.positionX.setValueAtTime(dx, this.audioContext?.currentTime || 0);
      pannerNode.positionY.setValueAtTime(dy, this.audioContext?.currentTime || 0);
      pannerNode.positionZ.setValueAtTime(-distance, this.audioContext?.currentTime || 0);
      
      // Set orientation (listener faces positive Z)
      pannerNode.orientationX.setValueAtTime(0, this.audioContext?.currentTime || 0);
      pannerNode.orientationY.setValueAtTime(0, this.audioContext?.currentTime || 0);
      pannerNode.orientationZ.setValueAtTime(-1, this.audioContext?.currentTime || 0);
    }
    
    // Update GainNode if it exists
    if (this.gainNodes.has(id)) {
      const gainNode = this.gainNodes.get(id);
      const coefficients = this.getAcousticCoefficients(id);
      gainNode.gain.setValueAtTime(coefficients.gain, this.audioContext?.currentTime || 0);
    }
  }
  
  /**
   * Get acoustic coefficients (gain and pan) for a sound source
   * 
   * @param {string} sourceId - Source participant ID
   * @returns {Object} Object with gain and pan properties
   */
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
      gain: parseFloat(calculateDistanceAttenuation(distance, this.maxDistance, this.rolloffFactor).toFixed(3)),
      pan: parseFloat(calculateStereoPan(listener, source).toFixed(3)),
      distance: parseFloat(distance.toFixed(1)),
    };
  }
  
  /**
   * Create a PannerNode for a participant
   * 
   * @param {string} id - Participant ID
   * @returns {PannerNode} The created PannerNode
   */
  createPannerNode(id) {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized. Call initAudioContext() first.');
    }
    
    const pannerNode = this.audioContext.createStereoPanner();
    // For StereoPannerNode, we use pan property directly
    
    this.pannerNodes.set(id, pannerNode);
    
    // Initialize position
    const position = this.positions.get(id) || { x: 0, y: 0 };
    const listener = this.positions.get(this.listenerId) || { x: 0, y: 0 };
    const dx = position.x - listener.x;
    const pan = calculateStereoPan(listener, position);
    pannerNode.pan.setValueAtTime(pan, this.audioContext.currentTime);
    
    return pannerNode;
  }
  
  /**
   * Create a 3D PannerNode for a participant (for true spatial audio)
   * 
   * @param {string} id - Participant ID
   * @returns {PannerNode} The created PannerNode
   */
  create3DPannerNode(id) {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized. Call initAudioContext() first.');
    }
    
    const pannerNode = this.audioContext.createPanner();
    pannerNode.panningModel = this.panningModel;
    pannerNode.distanceModel = this.distanceModel;
    pannerNode.refDistance = this.refDistance;
    pannerNode.maxDistance = this.maxDistancePanner;
    pannerNode.rolloffFactor = this.rolloffFactor;
    
    this.pannerNodes.set(id, pannerNode);
    
    // Initialize position
    const position = this.positions.get(id) || { x: 0, y: 0 };
    const listener = this.positions.get(this.listenerId) || { x: 0, y: 0 };
    const dx = position.x - listener.x;
    const dy = position.y - listener.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    pannerNode.positionX.setValueAtTime(dx, this.audioContext.currentTime);
    pannerNode.positionY.setValueAtTime(dy, this.audioContext.currentTime);
    pannerNode.positionZ.setValueAtTime(-distance, this.audioContext.currentTime);
    
    // Listener orientation (facing positive Z)
    pannerNode.orientationX.setValueAtTime(0, this.audioContext.currentTime);
    pannerNode.orientationY.setValueAtTime(0, this.audioContext.currentTime);
    pannerNode.orientationZ.setValueAtTime(-1, this.audioContext.currentTime);
    
    return pannerNode;
  }
  
  /**
   * Create a GainNode for volume control
   * 
   * @param {string} id - Participant ID
   * @returns {GainNode} The created GainNode
   */
  createGainNode(id) {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized. Call initAudioContext() first.');
    }
    
    const gainNode = this.audioContext.createGain();
    const coefficients = this.getAcousticCoefficients(id);
    gainNode.gain.setValueAtTime(coefficients.gain, this.audioContext.currentTime);
    
    this.gainNodes.set(id, gainNode);
    
    return gainNode;
  }
  
  /**
   * Connect an audio source to the spatial audio pipeline
   * 
   * This creates a complete audio pipeline: Source -> GainNode -> PannerNode -> Destination
   * 
   * @param {string} id - Participant ID
   * @param {AudioNode} source - Audio source node (e.g., MediaStreamAudioSourceNode)
   * @returns {Object} Object containing gainNode and pannerNode
   */
  connectSource(id, source) {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized. Call initAudioContext() first.');
    }
    
    // Create gain node
    const gainNode = this.createGainNode(id);
    
    // Create panner node (use StereoPanner for 2D, or Panner for 3D)
    // For simplicity and compatibility, we'll use StereoPanner
    const pannerNode = this.createPannerNode(id);
    
    // Store source
    this.audioSources.set(id, source);
    
    // Connect pipeline: source -> gain -> pan -> destination
    source.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.audioContext.destination);
    
    return { gainNode, pannerNode };
  }
  
  /**
   * Disconnect an audio source from the pipeline
   * 
   * @param {string} id - Participant ID
   */
  disconnectSource(id) {
    if (this.audioSources.has(id)) {
      const source = this.audioSources.get(id);
      source.disconnect();
      this.audioSources.delete(id);
    }
    
    if (this.gainNodes.has(id)) {
      const gainNode = this.gainNodes.get(id);
      gainNode.disconnect();
      this.gainNodes.delete(id);
    }
    
    if (this.pannerNodes.has(id)) {
      const pannerNode = this.pannerNodes.get(id);
      pannerNode.disconnect();
      this.pannerNodes.delete(id);
    }
  }
  
  /**
   * Update panner and gain for a specific source
   * 
   * @param {string} id - Participant ID
   */
  updateAudioNodes(id) {
    const coefficients = this.getAcousticCoefficients(id);
    
    if (this.gainNodes.has(id)) {
      const gainNode = this.gainNodes.get(id);
      gainNode.gain.setValueAtTime(coefficients.gain, this.audioContext?.currentTime || 0);
    }
    
    if (this.pannerNodes.has(id)) {
      const pannerNode = this.pannerNodes.get(id);
      const listener = this.positions.get(this.listenerId) || { x: 0, y: 0 };
      const source = this.positions.get(id) || { x: 0, y: 0 };
      
      // For StereoPannerNode
      if (pannerNode.pan) {
        const pan = calculateStereoPan(listener, source);
        pannerNode.pan.setValueAtTime(pan, this.audioContext?.currentTime || 0);
      }
      // For PannerNode
      else {
        const dx = source.x - listener.x;
        const dy = source.y - listener.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        pannerNode.positionX.setValueAtTime(dx, this.audioContext?.currentTime || 0);
        pannerNode.positionY.setValueAtTime(dy, this.audioContext?.currentTime || 0);
        pannerNode.positionZ.setValueAtTime(-distance, this.audioContext?.currentTime || 0);
      }
    }
  }
  
  /**
   * Get all participants with their acoustic coefficients
   * 
   * @returns {Array} Array of objects with participant info and coefficients
   */
  getAllParticipantsWithCoefficients() {
    const result = [];
    
    for (const [id, position] of this.positions) {
      const coefficients = this.getAcousticCoefficients(id);
      result.push({
        id,
        x: position.x,
        y: position.y,
        ...coefficients,
      });
    }
    
    return result;
  }
  
  /**
   * Clean up all audio nodes
   */
  cleanup() {
    // Disconnect all sources
    for (const id of this.audioSources.keys()) {
      this.disconnectSource(id);
    }
    
    this.audioSources.clear();
    this.gainNodes.clear();
    this.pannerNodes.clear();
  }
}

/**
 * Utility function to create a test tone for debugging
 * 
 * @param {AudioContext} audioContext - Web Audio API AudioContext
 * @param {number} frequency - Frequency of the test tone
 * @returns {OscillatorNode} Oscillator node for the test tone
 */
export function createTestTone(audioContext, frequency = 440) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  
  return oscillator;
}

export default SpatialAudioEngine;

