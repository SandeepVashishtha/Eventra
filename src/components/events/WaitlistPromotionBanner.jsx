import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
    <div className="bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-lg p-4 shadow-lg flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-3 mb-3 md:mb-0">
        <div className="bg-white/20 p-2 rounded-full">
          <Clock size={24} />
        </div>
        <div>
          <h4 className="font-bold text-lg">A spot opened up for {eventName}!</h4>
          <p className="text-sm text-orange-100">Claim your spot before the timer runs out.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="text-xl font-mono font-bold bg-black/20 px-3 py-1 rounded">
          {timeLeft}
        </div>
        <button 
          onClick={onClaim}
          className="bg-white text-orange-600 hover:bg-orange-50 font-bold py-2 px-4 rounded transition shadow"
        >
          Claim Spot
        </button>
        <button 
          onClick={onDecline}
          className="bg-transparent hover:bg-black/10 text-white font-medium py-2 px-3 rounded transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default WaitlistPromotionBanner;
