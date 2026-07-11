import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOSDevice && !isStandalone) setIsIOS(true);
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <>
      <button onClick={handleInstallClick} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow transition-all">Install App</button>
      {isIOS && showIOSPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-slideUp">
          <button onClick={() => setShowIOSPrompt(false)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"><X size={16} /></button>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Install Eventra</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 flex-wrap">
            Tap <Share size={14} className="text-blue-500" /> then <PlusSquare size={14} className="text-slate-500" /> "Add to Home Screen"
          </p>
        </div>
      )}
    </>
  );
}
