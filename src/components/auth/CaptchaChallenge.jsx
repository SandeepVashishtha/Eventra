import React, { useRef, useEffect, useState } from "react";
import { RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";
import "./captcha.css";

export default function CaptchaChallenge({ onVerify }) {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState(null); // success, failed

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput("");
    setStatus(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background noise lines
    ctx.strokeStyle = "#cbd5e1";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw distorted text
    ctx.fillStyle = "#4f46e5";
    ctx.font = "italic bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 7);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (userInput === captchaText) {
      setStatus("success");
      if (onVerify) onVerify(true);
    } else {
      setStatus("failed");
      if (onVerify) onVerify(false);
    }
  };

  return (
    <div className="captcha-challenge-box p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-sm mx-auto my-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Challenge</span>
        <button type="button" onClick={generateCaptcha} className="text-indigo-600 hover:text-indigo-700">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-4 items-center mb-3">
        <canvas ref={canvasRef} width={150} height={50} className="bg-white border border-slate-200 dark:border-slate-800 rounded-lg" />
        <input
          type="text"
          placeholder="Type captcha code"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleVerify}
        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
      >
        Verify Challenge
      </button>

      {status === "success" && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-semibold">
          <CheckCircle className="w-4 h-4" /> Challenge Verified!
        </div>
      )}
      {status === "failed" && (
        <div className="flex items-center gap-1.5 text-xs text-red-650 mt-2 font-semibold">
          <ShieldAlert className="w-4 h-4" /> Verification Failed. Try again.
        </div>
      )}
    </div>
  );
}
