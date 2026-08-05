import React, { useState, useRef, useEffect } from 'react';

const NLPChatbotSupport = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi there! I\'m your Eventra Virtual Concierge. How can I help you navigate the summit today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInputText('');
    setIsTyping(true);

    // Simulated NLP logic based on keywords
    setTimeout(() => {
      let botReply = '';
      const lowerQuery = userQuery.toLowerCase();
      
      if (lowerQuery.includes('restroom') || lowerQuery.includes('bathroom') || lowerQuery.includes('toilet')) {
        botReply = 'The nearest restrooms are located in the North Wing, just past the main escalators next to Sponsor Booth C4.';
      } else if (lowerQuery.includes('keynote') || lowerQuery.includes('time')) {
        botReply = 'The opening keynote by Sarah Jenkins begins at 10:00 AM on the Main Stage (Level 1).';
      } else if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
        botReply = 'The venue WiFi network is "Eventra-Guest" and the password is "Summit2026!".';
      } else if (lowerQuery.includes('coffee') || lowerQuery.includes('food')) {
        botReply = 'Complimentary coffee is available in the Networking Lounge on Level 2 until 11:30 AM.';
      } else if (lowerQuery.includes('human') || lowerQuery.includes('staff')) {
        botReply = 'I am escalating this to a human staff member. Someone from the Info Desk will reply in this chat shortly.';
      } else {
        botReply = 'I\'m not entirely sure about that. Let me connect you with a human staff member who can help!';
      }

      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1500); // 1.5s typing delay
  };

  const predefinedQueries = [
    "Where is the restroom?",
    "What time is the keynote?",
    "What is the WiFi password?"
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            NLP Knowledge Base
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Virtual Concierge <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">Event Chatbot</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Stop overwhelming your human staff with repetitive logistics questions. Deploy a custom AI trained on your venue map and schedule to provide instant, 24/7 support to all attendees.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-2xl mb-2 text-sky-500 block">🤖</span>
              <h4 className="font-bold text-slate-800 text-sm">Instant Answers</h4>
              <p className="text-xs text-slate-500 mt-1">Zero wait time for attendees.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-2xl mb-2 text-indigo-500 block">🙋</span>
              <h4 className="font-bold text-slate-800 text-sm">Smart Escalation</h4>
              <p className="text-xs text-slate-500 mt-1">Routes complex issues to staff.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mobile App Chat Interface */}
        <div className="flex justify-center relative">
          
          <div className="w-[360px] h-[720px] bg-white rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
            </div>

            {/* Chat Header */}
            <div className="bg-sky-600 pt-10 pb-4 px-6 shadow-md z-10 flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner mr-3 relative">
                🤖
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="text-white font-black text-lg leading-tight">Eventra Bot</h2>
                <p className="text-sky-200 text-[10px] font-bold uppercase tracking-widest">Always Online</p>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm leading-relaxed'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex space-x-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Predefined Chips */}
            <div className="bg-slate-50 px-4 pb-2 pt-1 flex overflow-x-auto space-x-2 no-scrollbar border-t border-slate-100">
              {predefinedQueries.map((query, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setInputText(query); }}
                  className="whitespace-nowrap bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full shadow-sm hover:border-sky-300 transition"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-slate-100 border-transparent rounded-full px-4 py-3 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${inputText.trim() ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NLPChatbotSupport;
