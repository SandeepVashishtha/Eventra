import React, { useRef, useEffect } from "react";

export default function ScreenPreview({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full h-full relative">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute top-2 left-2 bg-red-600/80 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase animate-pulse">
        Sharing Active
      </div>
    </div>
  );
}
