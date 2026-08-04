import React, { useState, useEffect } from 'react';

const LiveSentimentPolling = () => {
  const [responses, setResponses] = useState(142);
  const [sentiment, setSentiment] = useState({ positive: 65, neutral: 25, negative: 10 });
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const keywords = [
    { text: 'Innovation', size: 'text-4xl', color: 'text-emerald-500' },
    { text: 'Confusing', size: 'text-lg', color: 'text-red-400' },
    { text: 'AI Models', size: 'text-3xl', color: 'text-blue-500' },
    { text: 'Inspiring', size: 'text-2xl', color: 'text-emerald-400' },
    { text: 'Too Fast', size: 'text-sm', color: 'text-amber-500' },
    { text: 'Scalability', size: 'text-xl', color: 'text-blue-400' },
    { text: 'Security', size: 'text-2xl', color: 'text-slate-600' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setInputText('');
      setResponses(prev => prev + 1);
      
      // Slightly shift sentiment based on arbitrary length to simulate real-time update
      setSentiment(prev => ({
        positive: Math.min(100, prev.positive + (inputText.length % 2 === 0 ? 1 : -1)),
        neutral: prev.neutral,
        negative: Math.max(0, prev.negative + (inputText.length % 2 !== 0 ? 1 : -1))
      }));
    }, 800);
  };

  // Simulate incoming live data
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setResponses(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded animate-pulse">Live</span>
              <h1 className="text-2xl font-black text-white">Speaker Dashboard: Q&A Sentiment</h1>
            </div>
            <p className="text-slate-400 text-sm">Session: The Future of Cloud Architecture</p>
          </div>
          <div className="mt-4 md:mt-0 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 flex items-center space-x-3">
            <span className="text-2xl text-blue-400">👥</span>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Responses</p>
              <p className="font-black text-xl text-white leading-none">{responses}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Mood Meter */}
          <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl relative overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6 z-10 relative">Real-Time Audience Mood Meter</h2>
            
            <div className="flex-1 flex flex-col justify-center z-10 relative">
              {/* Visual Sentiment Bar */}
              <div className="h-16 w-full rounded-2xl overflow-hidden flex shadow-inner bg-slate-900 mb-8 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center transition-all duration-1000 ease-out"
                  style={{ width: `${sentiment.positive}%` }}
                >
                  {sentiment.positive > 15 && <span className="font-black text-emerald-900 text-sm">Positive {sentiment.positive}%</span>}
                </div>
                <div 
                  className="h-full bg-slate-500 flex items-center justify-center transition-all duration-1000 ease-out"
                  style={{ width: `${sentiment.neutral}%` }}
                >
                  {sentiment.neutral > 15 && <span className="font-black text-white text-sm">{sentiment.neutral}%</span>}
                </div>
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center transition-all duration-1000 ease-out"
                  style={{ width: `${sentiment.negative}%` }}
                >
                  {sentiment.negative > 15 && <span className="font-black text-red-900 text-sm">Negative {sentiment.negative}%</span>}
                </div>
              </div>

              {/* Dynamic Word Cloud */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 min-h-[200px] flex flex-wrap items-center justify-center gap-4 relative">
                <p className="absolute top-4 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">NLP Theme Extraction</p>
                {keywords.map((kw, i) => (
                  <span 
                    key={i} 
                    className={`font-black tracking-tight ${kw.size} ${kw.color} hover:scale-110 transition-transform cursor-pointer drop-shadow-lg`}
                  >
                    {kw.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Ambient Background Glow based on primary sentiment */}
            <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${sentiment.positive > 50 ? 'bg-emerald-500' : sentiment.negative > 30 ? 'bg-red-500' : 'bg-slate-500'}`}></div>
          </div>

          {/* Attendee Input Simulation */}
          <div className="lg:col-span-1 bg-gradient-to-b from-blue-900/50 to-slate-800 rounded-3xl p-6 border border-blue-500/30 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-white mb-2">Attendee View</h2>
            <p className="text-xs text-blue-300 mb-6 font-medium">Test the NLP pipeline by submitting an open-text response.</p>
            
            <div className="flex-1 flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-bold text-slate-300">
                  What are your thoughts on the new architecture?
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your feedback here..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 transition"
                  disabled={submitting}
                />
                <button 
                  type="submit"
                  disabled={submitting || !inputText.trim()}
                  className={`w-full py-3 rounded-xl font-black shadow-lg transition flex items-center justify-center ${submitting ? 'bg-blue-800 text-blue-400 cursor-wait' : !inputText.trim() ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {submitting ? 'Analyzing Sentiment...' : 'Submit Response'}
                </button>
              </form>
            </div>
            
            <div className="mt-8 bg-blue-900/40 p-4 rounded-xl border border-blue-500/30">
              <p className="text-xs text-blue-200 leading-relaxed font-medium">
                <span className="font-bold text-blue-400">Speaker Tip:</span> The audience is highly engaged ("Innovation", "AI Models"), but a segment finds the pacing "Too Fast". Consider slowing down the next section.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveSentimentPolling;
