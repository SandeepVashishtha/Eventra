import React, { useState, useRef, useEffect } from 'react';

const VirtualConciergeChatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi there! 👋 I am Eve, your virtual concierge. How can I help you navigate the summit today?',
      timestamp: '09:00 AM'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate NLP intent matching and response delay
    setTimeout(() => {
      let botResponse = "I'm sorry, I couldn't quite understand that. Could you rephrase?";
      
      const lowerInput = userMessage.text.toLowerCase();
      if (lowerInput.includes('coffee') || lowerInput.includes('food')) {
        botResponse = "The main Food Court is located in Expo Hall B. There is also a smaller coffee cart right outside the Main Keynote Stage on Level 1. ☕";
      } else if (lowerInput.includes('keynote') || lowerInput.includes('schedule')) {
        botResponse = "The Opening Keynote 'Future of AI' starts at 10:00 AM in the Main Stage. Would you like me to add it to your itinerary?";
      } else if (lowerInput.includes('restroom') || lowerInput.includes('bathroom')) {
        botResponse = "The nearest restrooms are located down the hall to your right, past the registration desk. 🚻";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const predefinedQuestions = [
    "Where is the nearest coffee?",
    "When is the keynote?",
    "Where are the restrooms?"
  ];

  const handleQuickReply = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 font-sans">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform focus:outline-none"
        >
          🤖
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col font-sans overflow-hidden z-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
              🤖
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm">Eve</h3>
            <p className="text-xs text-blue-200 font-medium">Virtual NLP Concierge</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-blue-200 transition focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <span className={`text-[10px] mt-1 block text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-4 shadow-sm flex space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="bg-white px-4 py-2 border-t border-slate-100 overflow-x-auto whitespace-nowrap flex space-x-2 hide-scrollbar">
        {predefinedQuestions.map((q, idx) => (
          <button 
            key={idx}
            onClick={() => handleQuickReply(q)}
            className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-full transition border border-slate-200"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-slate-100 border-none text-sm text-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <button 
            type="submit"
            disabled={!inputMessage.trim()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition shadow-sm ${inputMessage.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400'}`}
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default VirtualConciergeChatbot;
