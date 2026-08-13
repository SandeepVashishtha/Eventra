import React, { useEffect, useRef, useState } from "react";
import { Compass, Box } from "lucide-react";
import MeshDetailsCard from "./MeshDetailsCard";

export default function SpatialExhibitionHall() {
  const canvasRef = useRef(null);
  const [selectedBooth, setSelectedBooth] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported, falling back to 2D view");
      return;
    }

    // Set canvas clear color to dark slate grey
    gl.clearColor(0.05, 0.05, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Dynamic shaders initialization (#17661)
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    const fsSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.3, 0.25, 0.9, 0.8);
      }
    `;

    const loadShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Draw simple central mesh representation
    const vertices = new Float32Array([
      -0.5,  0.5, 0.0,
      -0.5, -0.5, 0.0,
       0.5, -0.5, 0.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <span className="font-bold flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 3D Spatial Exhibition Hall
        </span>
        <button
          onClick={() => setSelectedBooth({ sponsor: "Google Cloud", level: "Platinum" })}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Box className="w-3.5 h-3.5" /> Inspect Selected Booth
        </button>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center border border-gray-150 dark:border-gray-800">
        <canvas ref={canvasRef} className="w-full h-full block" width={800} height={450} />
      </div>

      {selectedBooth && <MeshDetailsCard booth={selectedBooth} onClose={() => setSelectedBooth(null)} />}
    </div>
  );
}
