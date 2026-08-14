import React, { useState } from "react";
import { Sparkles, Play } from "lucide-react";
import "./prize-wheel.css";

export default function PrizeWheel() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const data = ["Siddharth", "Priya", "Amit", "Rohan", "Ananya", "Riya"];

  const [rotation, setRotation] = useState(0);

  const startSpin = () => {
    if (mustSpin) return;
    const randomPrize = Math.floor(Math.random() * data.length);
    const extraSpins = 5 * 360; // 5 full loops
    const degreesPerSlice = 360 / data.length;
    const targetDeg = extraSpins + (data.length - randomPrize) * degreesPerSlice;

    setRotation(targetDeg);
    setPrizeNumber(randomPrize);
    setMustSpin(true);

    setTimeout(() => {
      setMustSpin(false);
      alert(`Winner Selected: ${data[randomPrize]}!`);
    }, 4000);
  };

  return (
    <div className="prize-wheel-container p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl max-w-sm mx-auto my-8 flex flex-col items-center">
      <h3 className="text-base font-bold mb-6 flex items-center gap-1.5">
        <Sparkles className="text-yellow-500 w-5 h-5 animate-pulse" />
        Closing Ceremony Prize Wheel
      </h3>

      <div className="wheel-wrapper relative w-64 h-64 border-4 border-slate-850 rounded-full flex items-center justify-center overflow-hidden mb-6 shadow-2xl">
        <div className="absolute top-0 w-1 h-8 bg-red-500 z-10" />
        <div
          style={{ transform: `rotate(${rotation}deg)` }}
          className="wheel-canvas w-full h-full rounded-full transition-transform duration-[4000ms] cubic-bezier(0.1, 1, 0.1, 1) relative bg-indigo-900"
        >
          {data.map((name, idx) => {
            const angle = (360 / data.length) * idx;
            return (
              <div
                key={idx}
                style={{ transform: `rotate(${angle}deg)` }}
                className="absolute inset-0 flex items-start justify-center pt-4 font-bold text-xs origin-center text-slate-100"
              >
                {name}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={startSpin}
        disabled={mustSpin}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-2.5 rounded-full transition-all shadow-md shadow-indigo-900/10 disabled:opacity-50"
      >
        <Play className="w-4 h-4 fill-current" /> Spin Wheel
      </button>
    </div>
  );
}
