import React, { useState } from "react";
import { ShieldCheck, ArrowRight, X, Wallet, RefreshCw } from "lucide-react";
import NftPassCard from "./NftPassCard";

export default function NftTicketClaimModal({
  eventTitle = "Global Open Source Summit",
  isOpen = false,
  onClose = () => {},
}) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedTicket, setMintedTicket] = useState(null);

  if (!isOpen) return null;

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handleMintTicket = () => {
    setIsMinting(true);
    setTimeout(() => {
      setMintedTicket({
        tokenId: "4820",
        title: eventTitle,
        ownerWallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        faceValueEth: 0.05,
        maxAllowedResale: 0.055,
      });
      setIsMinting(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-gray-900 dark:text-white select-none">
      <div className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">EVM NFT Ticket Claim</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Box */}
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Claim your ticket as a verifiable EVM NFT. Re-selling on secondary markets is capped at a maximum of 10% markup to eliminate price gouging.
        </div>

        {mintedTicket ? (
          <div className="space-y-4">
            <NftPassCard ticket={mintedTicket} />
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              NFT Minted & Sent to Wallet!
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!walletConnected ? (
              <button
                onClick={handleConnectWallet}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                <Wallet className="w-4 h-4" /> Connect Web3 Wallet
              </button>
            ) : (
              <button
                onClick={handleMintTicket}
                disabled={isMinting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isMinting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Minting NFT Ticket...
                  </>
                ) : (
                  <>
                    Claim dynamic NFT ticket <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
