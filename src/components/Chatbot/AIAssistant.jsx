import React, { useState, useRef, useEffect } from "react";
import { generateAIResponse } from "../../utils/aiAssistant";
import { Send, Bot, User, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Eventra AI Assistant. How can I help you discover events today? 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await generateAIResponse(input, []); // Passing empty events for simulation
      setMessages(prev => [...prev, { role: "assistant", content: response.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having some trouble processing that right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight text-white">Eventra AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-indigo-100">Intelligent Assistant (RAG)</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/50 dark:bg-gray-900/50"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-indigo-600 shadow-sm"
              }`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-200 dark:shadow-none shadow-lg" 
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-600 shadow-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-indigo-600 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-600 shadow-sm flex gap-1">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about Eventra..."
            className="w-full pl-4 pr-14 py-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-400 font-medium px-1">
          <Sparkles size={10} className="text-amber-500" />
          <span>AI can make mistakes. Verify important info.</span>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
