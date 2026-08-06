import React, { useState, useEffect } from 'react';

const ChatSentimentAnalysis = () => {
  const [sentiment, setSentiment] = useState({
    excited: 45,
    confused: 15,
    bored: 10,
    neutral: 30
  });

  const [liveMessages, setLiveMessages] = useState([
    { id: 1, user: 'Alex', text: 'Wait, could you go back to the API slide?', type: 'confused' },
    { id: 2, user: 'Sam', text: 'This new feature is insane 🔥', type: 'excited' },
    { id: 3, user: 'Jamie', text: 'I didn\'t catch that last point.', type: 'confused' }
  ]);

  const [dominantMood, setDominantMood] = useState('Excited');
  const [speakerAlert, setSpeakerAlert] = useState(null);

  // Simulate real-time stream analysis
  useEffect(() => {
    const interval = setInterval(() => {
      setSentiment(prev => {
        // Randomly fluctuate values slightly
        let e = prev.excited + (Math.floor(Math.random() * 11) - 5);
        let c = prev.confused + (Math.floor(Math.random() * 9) - 4);
        let b = prev.bored + (Math.floor(Math.random() * 5) - 2);
        
        // Ensure values stay positive and sum to roughly 100
        e = Math.max(10, Math.min(80, e));
        c = Math.max(5, Math.min(60, c));
        b = Math.max(5, Math.min(40, b));
        const n = Math.max(0, 100 - e - c - b);

        // Determine dominant mood
        if (c > 35) {
          setDominantMood('Confused');
          setSpeakerAlert('High confusion detected. Consider pausing for Q&A.');
        } else if (e > 50) {
          setDominantMood('Excited');
          setSpeakerAlert('Audience is highly engaged! Great pacing.');
        } else if (b > 25) {
          setDominantMood('Bored / Disengaged');
          setSpeakerAlert('Engagement dropping. Consider an interactive poll.');
        } else {
          setDominantMood('Neutral');
          setSpeakerAlert(null);
        }

        return { excited: e, confused: c, bored: b, neutral: n };
      });

      // Occasionally add a new message based on the dominant mood
      if (Math.random() > 0.6) {
        const types = ['excited', 'confused', 'bored', 'neutral'];
        const currentType = types[Math.floor(Math.random() * types.length)];
        
        let newText = '';
        if (currentType === 'excited') newText = 'Mind blown by this demo! 🤯';
        if (currentType === 'confused') newText = 'Can someone explain the architecture again?';
        if (currentType === 'bored') newText = 'When is the break?';
        if (currentType === 'neutral') newText = 'Checking audio, can everyone hear?';

        setLiveMessages(prev => {
          const newMsg = { id: Date.now(), user: 'User' + Math.floor(Math.random()*100), text: newText, type: currentType };
          return [newMsg, ...prev].slice(0, 5); // Keep last 5
        });
      }

    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm">
                Real-Time NLP AI
              </span>
              <h1 className="text-3xl font-black text-white">Live Sentiment Teleprompter</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">Don't present blindly to a screen. Our NLP pipeline reads the chat stream and provides speakers with a real-time "Mood Graph" to instantly adjust pacing and address confusion.</p>
          </div>
          
          <div className="mt-4 md:mt-0 bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
             <div>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analyzing Stream</p>
               <p className="text-sm font-black text-white">14,204 messages/min</p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Speaker Teleprompter Dashboard */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* Main Mood Indicator */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
            
            {/* Background Glow based on mood */}
            <div className={`absolute inset-0 opacity-20 blur-[100px] transition-colors duration-1000 ${
              dominantMood === 'Excited' ? 'bg-emerald-500' : 
              dominantMood === 'Confused' ? 'bg-amber-500' : 
              dominantMood === 'Bored / Disengaged' ? 'bg-slate-500' : 'bg-blue-500'
            }`}></div>
            
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 relative z-10">Current Audience Mood</p>
            <h2 className={`text-5xl md:text-6xl font-black mb-6 relative z-10 transition-colors duration-500 ${
              dominantMood === 'Excited' ? 'text-emerald-400' : 
              dominantMood === 'Confused' ? 'text-amber-400' : 
              dominantMood === 'Bored / Disengaged' ? 'text-slate-400' : 'text-blue-400'
            }`}>
              {dominantMood}
            </h2>

            {/* Smart Alert Banner */}
            <div className={`relative z-10 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
              speakerAlert ? (
                dominantMood === 'Confused' ? 'bg-amber-900/50 border-amber-500/50 text-amber-200' :
                dominantMood === 'Excited' ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-200' :
                'bg-slate-800 border-slate-600 text-slate-300'
              ) : 'opacity-0 scale-95'
            }`}>
              <p className="text-sm font-bold flex items-center">
                <span className="mr-2">💡</span> {speakerAlert || 'Listening...'}
              </p>
            </div>
          </div>

          {/* Real-time Sentiment Bar Charts */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 grid grid-cols-4 gap-4 items-end h-48">
            <div className="flex flex-col items-center h-full justify-end group">
              <span className="text-emerald-400 font-bold mb-2 opacity-0 group-hover:opacity-100 transition">{sentiment.excited}%</span>
              <div className="w-full bg-emerald-500 rounded-t-lg transition-all duration-700 ease-out" style={{ height: `${sentiment.excited}%` }}></div>
              <span className="text-[10px] text-slate-400 uppercase mt-2 font-bold">Excited</span>
            </div>
            <div className="flex flex-col items-center h-full justify-end group">
              <span className="text-amber-400 font-bold mb-2 opacity-0 group-hover:opacity-100 transition">{sentiment.confused}%</span>
              <div className="w-full bg-amber-500 rounded-t-lg transition-all duration-700 ease-out" style={{ height: `${sentiment.confused}%` }}></div>
              <span className="text-[10px] text-slate-400 uppercase mt-2 font-bold">Confused</span>
            </div>
            <div className="flex flex-col items-center h-full justify-end group">
              <span className="text-slate-500 font-bold mb-2 opacity-0 group-hover:opacity-100 transition">{sentiment.bored}%</span>
              <div className="w-full bg-slate-600 rounded-t-lg transition-all duration-700 ease-out" style={{ height: `${sentiment.bored}%` }}></div>
              <span className="text-[10px] text-slate-400 uppercase mt-2 font-bold">Bored</span>
            </div>
            <div className="flex flex-col items-center h-full justify-end group">
              <span className="text-blue-400 font-bold mb-2 opacity-0 group-hover:opacity-100 transition">{sentiment.neutral}%</span>
              <div className="w-full bg-blue-500 rounded-t-lg transition-all duration-700 ease-out" style={{ height: `${sentiment.neutral}%` }}></div>
              <span className="text-[10px] text-slate-400 uppercase mt-2 font-bold">Neutral</span>
            </div>
          </div>

        </div>

        {/* Right Column: AI Filtered Chat Feed */}
        <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col max-h-[550px]">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Filtered Feed</h3>
            <span className="bg-amber-900/40 text-amber-500 text-[10px] px-2 py-1 rounded border border-amber-700/50 font-bold">
              Showing: Confused
            </span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            
            {/* Top fade for new messages appearing */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-slate-900 to-transparent z-10"></div>

            <div className="space-y-4">
              {liveMessages.filter(m => m.type === 'confused').map((msg) => (
                <div key={msg.id} className="bg-slate-950 p-4 rounded-xl border border-amber-900/30 animate-fade-in-up">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400">{msg.user}</span>
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest">Confused (89% Confidence)</span>
                  </div>
                  <p className="text-sm text-slate-200">{msg.text}</p>
                </div>
              ))}
              
              {liveMessages.filter(m => m.type === 'confused').length === 0 && (
                <div className="text-center text-slate-500 text-sm mt-10">
                  No confusing topics detected in chat currently.
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">NLP Engine trained on 5M+ event transcripts.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ChatSentimentAnalysis;
