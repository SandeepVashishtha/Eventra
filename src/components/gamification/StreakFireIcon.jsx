import React from "react";
import { Flame } from "lucide-react";

export default function StreakFireIcon({ size = 20, active = true }) {
  return (
    <div className={`relative flex items-center justify-center ${active ? "animate-bounce" : ""}`}>
      <Flame
        size={size}
        className={active ? "text-orange-500 fill-current drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "text-slate-400"}
      />
    </div>
  );
}
