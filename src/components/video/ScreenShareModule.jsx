import React, { useState } from "react";
import { Monitor, Video, VideoOff, RefreshCw } from "lucide-react";
import ScreenPreview from "./ScreenPreview";
import "./screen-share.css";

export default function ScreenShareModule() {
  const [sharingStream, setSharingStream] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setSharingStream(stream);
      setIsSharing(true);

      // Listen for browser "Stop Sharing" button click
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Screen sharing permission denied or failed.", err);
    }
  };

  const stopScreenShare = () => {
    if (sharingStream) {
      sharingStream.getTracks().forEach(track => track.stop());
    }
    setSharingStream(null);
    setIsSharing(false);
  };

  return (
    <div className="screenshare-container p-6 bg-slate-900 text-white rounded-3xl shadow-xl max-w-xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Monitor className="text-indigo-400 w-5 h-5 animate-pulse" />
          Live Stream Presenter Panel
        </h3>
      </div>

      <div className="screenshare-box bg-slate-950 aspect-video rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden mb-6 relative shadow-inner">
        {isSharing ? (
          <ScreenPreview stream={sharingStream} />
        ) : (
          <div className="text-center text-slate-500">
            <Monitor className="w-12 h-12 text-slate-700 mx-auto mb-2" />
            <span className="text-xs uppercase font-semibold">No screen shared</span>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {isSharing ? (
          <button
            onClick={stopScreenShare}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md shadow-red-900/10"
          >
            <VideoOff className="w-4 h-4" /> Stop Sharing
          </button>
        ) : (
          <button
            onClick={startScreenShare}
            className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md shadow-indigo-900/10"
          >
            <Video className="w-4 h-4" /> Share screen
          </button>
        )}
      </div>
    </div>
  );
}
