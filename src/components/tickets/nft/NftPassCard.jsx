import React from "react";
import { ShieldCheck, Tag, Cpu, ExternalLink } from "lucide-react";

export default function NftPassCard({
  ticket = {
    tokenId: "1024",
    title: "Global Open Source Summit",
    ownerWallet: "0x71C76...976F",
    faceValueEth: 0.05,
    maxAllowedResale: 0.055,
  },
}) {
  return (
    <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[3/4] max-w-[280px] mx-auto select-none group">
      {/* Holographic Glowing Backdrop Effect */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-indigo-600/20 blur-3xl group-hover:bg-indigo-600/30 transition-all" />

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-indigo-400">
        <span>Eventra NFT Ticket</span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Polygon
        </span>
      </div>

      {/* Ticket Details */}
      <div className="space-y-2 mt-8 z-10">
        <h3 className="font-extrabold text-sm leading-tight line-clamp-2">
          {ticket.title}
        </h3>
        <p className="text-[10px] text-slate-400 font-mono">
          Token ID: #{ticket.tokenId}
        </p>
      </div>

      {/* Wallet Owner Info */}
      <div className="space-y-3 mt-auto">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono space-y-1">
          <div className="text-slate-400">Owner Wallet</div>
          <div className="text-white font-semibold truncate">{ticket.ownerWallet}</div>
        </div>

        {/* Secondary Resale Cap Badges */}
        <div className="flex items-center justify-between text-[9px] font-mono pt-1 text-slate-400">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-400" /> Face: {ticket.faceValueEth} ETH
          </span>
          <span className="text-emerald-400 font-bold">
            Max Resale: {ticket.maxAllowedResale} ETH
          </span>
        </div>
      </div>
    </div>
  );
}
