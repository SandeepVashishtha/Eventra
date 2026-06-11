import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, MessageCircle, Share2, Award, Twitter, Linkedin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareBadgeModal = ({ activeShareBadge, setActiveShareBadge, currentLevel, t }) => {
  const [shareStory, setShareStory] = useState("");
  const [sharePlatform, setSharePlatform] = useState("twitter");

  return (
    <AnimatePresence>
      {activeShareBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card-bg border border-border rounded-3xl p-6 max-w-3xl w-full shadow-premium-lg relative space-y-5 text-left"
          >
            <button
              onClick={() => setActiveShareBadge(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-bg hover:opacity-90 border border-border text-text-light cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="text-md font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Share2 className="w-4 h-4 animate-pulse" /> Share Achievement
              </h3>
              <p className="text-xs text-text-light">Share your milestone with the developer community.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-light">Customize Story</label>
                  <textarea
                    value={shareStory}
                    onChange={(e) => setShareStory(e.target.value)}
                    rows={4}
                    className="w-full p-3.5 rounded-2xl bg-bg border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs text-text resize-none outline-none transition-all leading-relaxed"
                    placeholder="Tell your story about this achievement..."
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-500">
                    <span>Interactive Composer</span>
                    <span className={shareStory.length > 280 ? "text-rose-500 font-extrabold" : ""}>
                      {shareStory.length} characters
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-text-light">Quick Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["#GSSoC2026", "#OpenSource", "#DevLife", "#LearnToCode"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!shareStory.includes(tag)) {
                            setShareStory(prev => `${prev.trim()} ${tag}`);
                          }
                        }}
                        className="px-2.5 py-1 text-[9px] font-extrabold rounded-lg bg-bg hover:bg-card-bg text-text border border-border transition cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareStory)}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                        toast.success("Posted to X!");
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg hover:bg-card-bg text-xs font-bold text-text transition cursor-pointer"
                    >
                      <Twitter size={13} className="text-sky-400" />
                      <span>Post on X</span>
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://eventra.dev")}&summary=${encodeURIComponent(shareStory)}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                        toast.success("Shared on LinkedIn!");
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg hover:bg-card-bg text-xs font-bold text-text transition cursor-pointer"
                    >
                      <Linkedin size={13} className="text-blue-500" />
                      <span>LinkedIn</span>
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareStory);
                        toast.success("Story copied to clipboard!");
                      } catch {
                        toast.error("Failed to copy.");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-bg hover:bg-card-bg border border-border text-xs font-bold text-text transition cursor-pointer"
                  >
                    <CheckCircle size={13} className="text-emerald-500" />
                    <span>Copy Story</span>
                  </button>

                  <button
                    onClick={() => {
                      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
                        <rect width="100%" height="100%" fill="#0f172a" rx="20"/>
                        <circle cx="200" cy="80" r="40" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
                        <text x="200" y="88" font-family="Arial" font-size="36" text-anchor="middle" fill="#fff">${activeShareBadge.icon}</text>
                        <text x="200" y="150" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#e2e8f0">${activeShareBadge.name}</text>
                        <text x="200" y="175" font-family="Arial" font-size="12" text-anchor="middle" fill="#94a3b8">EVENTRA ACHIEVER TOKEN</text>
                        <text x="200" y="205" font-family="Arial" font-size="10" text-anchor="middle" fill="#6366f1">Level ${currentLevel} Developer</text>
                      </svg>`;
                      const blob = new Blob([svgContent], { type: "image/svg+xml" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${activeShareBadge.id}-certificate.svg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success("Certificate downloaded!");
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-xs font-black uppercase tracking-wider text-white transition cursor-pointer shadow-premium-md hover:shadow-glow-sm"
                  >
                    <Award size={13} className="text-yellow-350" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 bg-bg/40 border border-border rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-light">Live Feed Preview</span>
                  <div className="flex gap-1.5">
                    {["twitter", "linkedin"].map(plat => (
                      <button
                        key={plat}
                        onClick={() => setSharePlatform(plat)}
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition cursor-pointer ${
                          sharePlatform === plat
                            ? "bg-primary text-white"
                            : "bg-bg text-text-light hover:text-text"
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>

                {sharePlatform === "twitter" ? (
                  <div className="p-4 bg-black rounded-xl border border-slate-850/85 text-left text-white space-y-3 shadow-none select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-400">EV</div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold hover:underline">Developer Achievement</span>
                          <span className="w-3 h-3 text-sky-400">✔️</span>
                        </div>
                        <p className="text-[10px] text-slate-500">@eventra_developer</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                      {shareStory || "I just unlocked a milestone badge on Eventra!"}
                    </p>
                    <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/70">
                      <div className="p-5 bg-gradient-to-br from-indigo-950/50 to-slate-950 text-center border-b border-slate-850">
                        <span className="inline-block p-3 rounded-2xl bg-indigo-900/30 border border-indigo-500/25 text-3xl mx-auto shadow-none">
                          {activeShareBadge.icon}
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-3 tracking-tight">{activeShareBadge.name}</h4>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Verified Achieve Token</p>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">eventra.dev</p>
                        <h5 className="text-[11px] font-extrabold text-slate-200 mt-0.5">Claimed Level {currentLevel} Attendee Badge!</h5>
                        <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1">Register for meetups, unlock streak multipliers, and grow your XP.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-card-bg rounded-xl border border-border text-left text-text-light space-y-3 shadow-none select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-xs font-black text-primary">EV</div>
                      <div>
                        <h4 className="text-xs font-black hover:underline hover:text-blue-600">Eventra Developer</h4>
                        <p className="text-[9px] text-slate-500 leading-none mt-1">GSSoC Achiever • Event Progression Engine</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                      {shareStory || "I just unlocked a milestone badge on Eventra!"}
                    </p>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-bg/80">
                      <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-950 text-center border-b border-slate-200 dark:border-slate-800">
                        <span className="inline-block p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300/30 dark:border-indigo-500/25 text-3xl mx-auto shadow-none">
                          {activeShareBadge.icon}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">{activeShareBadge.name}</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">Achiever Token Certification</p>
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold">EVENTRA.DEV</p>
                        <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Unlocked Badge Milestone on Eventra</h5>
                        <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1">Developer successfully completed the challenges.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-center text-slate-550 leading-snug">
                  Select Twitter or LinkedIn tab to preview the card layout.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareBadgeModal;
