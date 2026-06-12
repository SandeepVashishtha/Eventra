import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const WaitlistPromotionBanner = ({ eventName, expirationTime, onClaim, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expirationTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("EXPIRED");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expirationTime]);

  if (timeLeft === "EXPIRED") return null;

  return (
    <div className="flex flex-col items-center justify-between rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white shadow-lg md:flex-row">
      <div className="mb-3 flex items-center gap-3 md:mb-0">
        <div className="rounded-full bg-white/20 p-2">
          <Clock size={24} />
        </div>
        <div>
          <h4 className="text-lg font-bold">A spot opened up for {eventName}!</h4>
          <p className="text-sm text-orange-100">Claim your spot before the timer runs out.</p>
        </div>
      </div>

      <div className="flex w-full items-center gap-4 md:w-auto">
        <div className="rounded bg-black/20 px-3 py-1 font-mono text-xl font-bold">{timeLeft}</div>
        <button
          onClick={onClaim}
          className="rounded bg-white px-4 py-2 font-bold text-orange-600 shadow transition hover:bg-orange-50"
        >
          Claim Spot
        </button>
        <button
          onClick={onDecline}
          className="rounded bg-transparent px-3 py-2 font-medium text-white transition hover:bg-black/10"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default WaitlistPromotionBanner;
