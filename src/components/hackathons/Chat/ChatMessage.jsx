import React from "react";

export default function ChatMessage({ msg }) {
  const isMe = msg.sender === "You";

  return (
    <div className={`flex flex-col max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
      <span className="text-[10px] text-slate-400 mb-1 px-1 font-bold">{msg.sender}</span>
      <div className={`p-3 rounded-2xl text-xs leading-normal font-medium shadow-sm ${
        isMe
          ? "bg-indigo-600 text-white rounded-br-none"
          : "bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-bl-none"
      }`}>
        <p>{msg.text}</p>
        <span className="text-[8px] text-right block mt-1.5 opacity-60 font-bold">{msg.time}</span>
      </div>
    </div>
  );
}
