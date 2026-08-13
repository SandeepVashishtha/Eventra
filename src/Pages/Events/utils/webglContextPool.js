/**
 * Singleton WebGL Context Pool & Resource Disposal Utility
 * Prevents WEBGL_LOSE_CONTEXT and memory leaks during virtual venue walkthrough navigation.
 */
import { logger } from "utils/logger";

class WebGLContextPool {
  constructor() {
    this.activeContext = null;
    this.canvasElement = null;
    this.isContextLost = false;
    this.resourceDisposables = new Set();
  }

  /**
   * Acquire or reuse singleton WebGL canvas context
   */
  getOrCreateContext(canvasRef) {
    if (!canvasRef?.current) return null;

    if (this.canvasElement && this.canvasElement !== canvasRef.current) {
      this.disposeAllResources();
    }

    this.canvasElement = canvasRef.current;

    if (!this.activeContext || this.canvasElement !== canvasRef.current) {
      try {
        this.activeContext =
          this.canvasElement.getContext("webgl2") ||
          this.canvasElement.getContext("webgl") ||
          this.canvasElement.getContext("experimental-webgl");

        if (this.activeContext) {
          this.setupContextLostListeners();
        }
      } catch (err) {
        logger.warn("[WebGLContextPool] Failed to initialize WebGL context:", err);
      }
    }

    return this.activeContext;
  }

  setupContextLostListeners() {
    if (!this.canvasElement) return;

    this.canvasElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.isContextLost = true;
      logger.warn("[WebGLContextPool] WEBGL_LOSE_CONTEXT detected. Switching to 2D fallback mode.");
    });

    this.canvasElement.addEventListener("webglcontextrestored", () => {
      this.isContextLost = false;
      logger.info("[WebGLContextPool] WEBGL context restored.");
    });
  }

  /**
   * Register WebGL geometry/texture/shader for garbage collection tracking
   */
  registerDisposable(resource) {
    if (resource && typeof resource.dispose === "function") {
      this.resourceDisposables.add(resource);
    }
  }

  /**
   * Dispose all active WebGL GPU memory allocations
   */
  disposeAllResources() {
    this.resourceDisposables.forEach((res) => {
      try {
        res.dispose();
      } catch {}
    });
    this.resourceDisposables.clear();

    if (this.activeContext) {
      const numTextureUnits = this.activeContext.getParameter(this.activeContext.MAX_TEXTURE_IMAGE_UNITS);
      for (let unit = 0; unit < numTextureUnits; unit++) {
        this.activeContext.activeTexture(this.activeContext.TEXTURE0 + unit);
        this.activeContext.bindTexture(this.activeContext.TEXTURE_2D, null);
        this.activeContext.bindTexture(this.activeContext.TEXTURE_CUBE_MAP, null);
      }
    }
  }

  /**
   * Clean up WebGL instance on component unmount
   */
  releaseContext() {
    this.disposeAllResources();
    this.isContextLost = false;
  }
}

export const webglPool = new WebGLContextPool();
export default webglPool;
