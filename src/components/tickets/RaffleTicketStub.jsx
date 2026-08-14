import React, { useState } from "react";
import { Ticket, Sparkles } from "lucide-react";
import "./raffle-ticket.css";

export default function RaffleTicketStub() {
  const [ticketNum, setTicketNum] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTicket = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const num = "EVT-" + Math.floor(100000 + Math.random() * 900000);
      setTicketNum(num);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="raffle-ticket-stub p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl max-w-sm mx-auto my-8 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 bottom-0 left-0 w-4 bg-slate-950 flex flex-col justify-around py-2 border-r border-slate-850">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-slate-900 mx-auto" />
        ))}
      </div>

      <div className="pl-6 w-full flex flex-col items-center text-center">
        <h3 className="text-base font-bold mb-4 flex items-center gap-1.5 justify-center">
          <Ticket className="text-indigo-400 w-5 h-5" />
          Virtual Event Raffle Stub
        </h3>

        <div className="ticket-number-box min-h-[50px] bg-slate-950 px-6 py-3.5 rounded-xl border border-slate-850 flex items-center justify-center font-mono text-sm tracking-widest text-indigo-400 mb-6 w-full max-w-[200px]">
          {ticketNum || "--- ---"}
        </div>

        <button
          onClick={generateTicket}
          disabled={isGenerating}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            "Generating..."
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Claim Ticket Stub
            </>
          )}
        </button>
      </div>
    </div>
  );
}
