import React, { useState, useEffect, useRef } from 'react';

const RealTimeTranslationChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Kenji', text: 'こんにちは、あなたの基調講演をとても楽しく拝見しました。', translatedText: 'Hello, I really enjoyed your keynote presentation.', lang: 'ja', showOriginal: false, isMe: false },
    { id: 2, sender: 'You', text: 'Thank you! Are you also working in the AI sector?', lang: 'en', isMe: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef(null);

  const simulateIncomingMessage = () => {
    setIsTranslating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newMsg = { 
        id: Date.now(), 
        sender: 'Kenji', 
        text: 'はい、私は東京を拠点とするスタートアップでNLPモデルを構築しています。', 
        translatedText: 'Yes, I am building NLP models at a startup based in Tokyo.', 
        lang: 'ja', 
        showOriginal: false, 
        isMe: false 
      };
      
      setMessages(prev => [...prev, newMsg]);
      setIsTranslating(false);
    }, 1200);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), sender: 'You', text: inputText, lang: 'en', isMe: true };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    // Trigger Kenji's response after a short delay
    setTimeout(simulateIncomingMessage, 2000);
  };

  const toggleOriginal = (id) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, showOriginal: !msg.showOriginal } : msg
    ));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTranslating]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Global Networking
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Chat Translation</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Break down borders and unlock global business opportunities. Our integrated AI translation engine automatically translates 1-on-1 direct messages into the user's native language the millisecond they arrive.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
             <div className="flex items-center space-x-4 mb-4">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">🌐</div>
               <div>
                 <h3 className="font-bold text-slate-900">Powered by Neural Machine Translation</h3>
                 <p className="text-xs text-slate-500">Supports 130+ languages instantly.</p>
               </div>
             </div>
             <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
               "This feature alone doubled the number of meaningful networking connections made at our international summit." <br/>— <span className="font-bold">Event Director</span>
             </p>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="flex justify-center">
          
          <div className="w-full max-w-[400px] h-[600px] bg-white rounded-3xl border border-slate-200 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Chat Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shadow-md z-10">
               <div className="flex items-center space-x-3">
                 <div className="relative">
                   <div className="w-10 h-10 bg-indigo-300 rounded-full flex items-center justify-center text-lg shadow-inner">🇯🇵</div>
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full"></div>
                 </div>
                 <div>
                   <h3 className="font-bold text-sm leading-tight">Kenji Sato</h3>
                   <p className="text-[10px] text-indigo-200 font-bold tracking-wider">Tokyo, Japan (Translating: JA → EN)</p>
                 </div>
               </div>
               <button className="text-indigo-200 hover:text-white transition">⋮</button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col space-y-4">
               <div className="text-center mb-4">
                 <span className="bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Today</span>
               </div>

               {messages.map((msg) => (
                 <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                   <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1 mr-1">{msg.sender}</span>
                   
                   <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                     
                     {/* Translated View vs Original View */}
                     {!msg.isMe ? (
                       msg.showOriginal ? (
                         <p className="text-sm">{msg.text}</p>
                       ) : (
                         <div className="relative">
                           <p className="text-sm font-medium">{msg.translatedText}</p>
                           <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-slate-100">
                             <span className="text-indigo-500 text-[12px]">✨</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Translated by AI</span>
                           </div>
                         </div>
                       )
                     ) : (
                       <p className="text-sm">{msg.text}</p>
                     )}
                   </div>
                   
                   {/* Toggle Button for received messages */}
                   {!msg.isMe && (
                     <button 
                       onClick={() => toggleOriginal(msg.id)}
                       className="text-[10px] text-indigo-500 font-bold hover:underline mt-1 ml-1"
                     >
                       {msg.showOriginal ? 'See Translation' : 'View Original (Japanese)'}
                     </button>
                   )}
                 </div>
               ))}

               {isTranslating && (
                 <div className="flex flex-col items-start animate-fade-in">
                   <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1">Kenji</span>
                   <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm flex items-center space-x-2">
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                     <span className="text-xs text-slate-400 font-bold ml-2">Translating...</span>
                   </div>
                 </div>
               )}
               
               <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-200">
               <form onSubmit={handleSend} className="flex items-center bg-slate-100 rounded-full border border-slate-200 p-1 pr-2 shadow-inner">
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   placeholder="Type a message (English)..." 
                   className="flex-1 bg-transparent text-sm p-2 px-3 outline-none"
                 />
                 <button 
                   type="submit"
                   disabled={!inputText.trim()}
                   className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm"
                 >
                   ↗
                 </button>
               </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RealTimeTranslationChat;
