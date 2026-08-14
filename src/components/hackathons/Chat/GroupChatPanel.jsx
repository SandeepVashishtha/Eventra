import React, { useState } from "react";
import { MessageCircle, Send, Smile } from "lucide-react";
import ChatMessage from "./ChatMessage";
import "./chat.css";

export default function GroupChatPanel({ teamId = "team-alpha" }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Let's push the initial repo structure.", sender: "Raj", time: "11:20" },
    { id: 2, text: "Adding the API router config files.", sender: "Priya", time: "11:22" }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: input,
      sender: "You",
      time: new Date().toTimeString().split(" ")[0].slice(0, 5)
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="group-chat-panel p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto my-8 flex flex-col h-[450px]">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <MessageCircle className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
        <h3 className="font-bold text-slate-900 dark:text-white">Team Chat Room: {teamId}</h3>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-850 rounded-2xl">
        <input
          type="text"
          placeholder="Send group chat..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-800 dark:text-slate-205 focus:outline-none"
        />
        <button type="submit" className="p-2 bg-indigo-655 text-white hover:bg-indigo-700 rounded-xl transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
