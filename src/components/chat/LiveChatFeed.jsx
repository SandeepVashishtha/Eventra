import React, { useRef, useEffect } from "react";
import { MessageSquare, ArrowDown } from "lucide-react";

export default function LiveChatFeed({ messages = [] }) {
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    
    // Shift scroll mutations to non-blocking requestAnimationFrame queue (#16467)
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <span className="font-bold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Live Chat feed
        </span>
      </div>

      {/* Contain styles isolated to prevent reflow cascading */}
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto rounded-3xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950 space-y-3"
        style={{ contain: "content" }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-850 flex items-start gap-2.5">
            {/* Fixed dimensions placeholder prevents sub-pixel reflows */}
            <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 aspect-square" />
            <div className="space-y-1">
              <span className="font-bold">{msg.user}</span>
              <p className="text-gray-600 dark:text-gray-300">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
