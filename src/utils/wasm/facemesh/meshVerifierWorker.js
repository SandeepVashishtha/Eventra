/**
 * TensorFlow facemesh coordinates comparison logic exporter (#16277)
 */

export function getFaceMeshWorkerSource() {
  return `
    self.onmessage = function(e) {
      const { baselineMesh, scanMesh } = e.data;
      if (!baselineMesh || !scanMesh) {
        self.postMessage({ match: false, score: 0 });
        return;
      }

      // Compute Euclidean distance between key coordinates
      let diff = 0;
      const length = Math.min(baselineMesh.length, scanMesh.length);
      for (let i = 0; i < length; i++) {
        const dx = baselineMesh[i].x - scanMesh[i].x;
        const dy = baselineMesh[i].y - scanMesh[i].y;
        diff += Math.sqrt(dx * dx + dy * dy);
      }

      const score = Math.max(0, 100 - (diff / length) * 5);
      self.postMessage({ match: score > 85, score });
    };
  `;
}
