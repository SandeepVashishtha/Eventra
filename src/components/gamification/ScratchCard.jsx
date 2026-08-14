import React, { useRef, useEffect, useState } from "react";
import { Sparkles, Copy } from "lucide-react";
import "./scratch-card.css";

export default function ScratchCard({ couponCode = "GSSOC2026BOOST" }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [scratched, setScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    contextRef.current = ctx;

    // Fill silver scratch paint
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Write text instruction
    ctx.fillStyle = "#475569";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch to Reveal Reward!", canvas.width / 2, canvas.height / 2 + 4);
  }, []);

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || scratched) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = contextRef.current;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    checkScratchProgress();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i + 3] === 0) cleared++;
    }
    const percent = (cleared / (imgData.data.length / 4)) * 100;
    if (percent >= 65) {
      setScratched(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height); // reveal all
    }
  };

  return (
    <div className="scratch-card-box p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl max-w-sm mx-auto my-8 flex flex-col items-center">
      <h3 className="text-base font-bold mb-6 flex items-center gap-1.5">
        <Sparkles className="text-yellow-500 w-5 h-5 animate-pulse" />
        Voucher Reward scratch-off
      </h3>

      <div className="scratch-canvas-wrapper w-64 h-28 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden flex items-center justify-center mb-4">
        {/* Underlay reward code */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Your Promo Code</span>
          <span className="text-sm font-black font-mono text-indigo-400 tracking-wider select-all">{couponCode}</span>
        </div>

        {/* Overlay scratch canvas */}
        <canvas
          ref={canvasRef}
          width={256}
          height={112}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-300 ${
            scratched ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
}
