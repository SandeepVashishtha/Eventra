import React, { useState, useEffect } from 'react';

const GamifiedMicroLearning = () => {
  const [sessionTime, setSessionTime] = useState(14.8); // minutes
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizState, setQuizState] = useState('idle'); // idle, answering, graded, complete
  
  const [certProgress, setCertProgress] = useState(75); // percentage
  const [creditsEarned, setCreditsEarned] = useState(1.5);

  const questions = [
    {
      q: "Which receptor is primarily targeted by the new class of ACE inhibitors discussed?",
      options: ["AT1 Receptor", "AT2 Receptor", "Beta-1 Adrenergic", "Calcium Channels"],
      correct: 0
    },
    {
      q: "What is the most common adverse effect observed in Phase 3 trials?",
      options: ["Hyperkalemia", "Dry Cough", "Hypotension", "Angioedema"],
      correct: 1
    }
  ];

  const simulateLectureTimer = () => {
    // Fast forward to 15 minute mark to trigger quiz
    let time = 14.8;
    const interval = setInterval(() => {
      time += 0.05;
      setSessionTime(time);
      if (time >= 15.0) {
        clearInterval(interval);
        setQuizActive(true);
      }
    }, 200);
  };

  const handleAnswer = (index) => {
    if (quizState !== 'idle' && quizState !== 'answering') return;
    
    setSelectedAnswer(index);
    setQuizState('answering');
    
    setTimeout(() => {
      setQuizState('graded');
      
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setQuizState('idle');
        } else {
          setQuizState('complete');
          setCertProgress(prev => Math.min(prev + 12.5, 100));
          setCreditsEarned(prev => prev + 0.25);
          
          setTimeout(() => {
            setQuizActive(false);
            setQuizState('idle');
            setCurrentQuestion(0);
            setSelectedAnswer(null);
            setSessionTime(15.1);
          }, 3000);
        }
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Presenter View (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎓</span> Continuing Education (CME)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Micro-Learning <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Certification Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Transform passive lectures into active learning environments. For CME/CLE professional events, Eventra's engine interrupts the standard stream every 15 minutes to push a rapid-fire micro-quiz directly to the audience's devices based on the speaker's current slide. Attendees must pass in real-time to earn their official certification credits.
          </p>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
             
             {/* Simulated Stage/Presentation Screen */}
             <div className="h-64 bg-slate-900 relative p-6 flex flex-col justify-between overflow-hidden">
               
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 filter grayscale"></div>
               
               <div className="relative z-10 flex justify-between items-start">
                 <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded flex items-center shadow-lg">
                   <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span> LIVE
                 </span>
                 <div className="bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-xs font-mono font-bold">
                   Session Timer: {Math.floor(sessionTime)}:{(Math.floor((sessionTime % 1) * 60)).toString().padStart(2, '0')}
                 </div>
               </div>

               {quizActive ? (
                 <div className="relative z-10 text-center animate-fade-in">
                   <span className="text-4xl mb-2 block">📱</span>
                   <h3 className="text-2xl font-black text-white mb-1">Knowledge Check Initiated</h3>
                   <p className="text-slate-300 text-sm">Please check your mobile device to complete the micro-learning module.</p>
                 </div>
               ) : (
                 <div className="relative z-10 text-center pt-8">
                   <h3 className="text-3xl font-black text-white drop-shadow-md">Advanced Pharmacology 401</h3>
                   <p className="text-slate-300 text-sm font-bold">Dr. H. Chen • Section 2</p>
                 </div>
               )}

             </div>

             <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
               <div>
                 <h4 className="font-bold text-slate-800 text-sm">Speaker Control Panel</h4>
                 <p className="text-xs text-slate-500 font-mono mt-1">Quiz triggers automatically at 15m intervals.</p>
               </div>
               <button 
                 onClick={simulateLectureTimer}
                 disabled={quizActive || sessionTime >= 15}
                 className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition shadow ${
                   quizActive || sessionTime >= 15 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30 hover:shadow-lg'
                 }`}
               >
                 Simulate 15m Mark
               </button>
             </div>
          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-slate-50">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
              
              {!quizActive ? (
                // Standard Viewing App
                <div className="flex-1 flex flex-col p-6 animate-fade-in pt-12">
                  <div className="w-full aspect-video bg-slate-800 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
                    <span className="text-slate-500 font-black">Video Stream</span>
                    <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Live</span>
                  </div>
                  
                  <h3 className="font-black text-xl text-slate-900 mb-1">Advanced Pharmacology</h3>
                  <span className="text-xs font-bold text-slate-500 block mb-6">CME Credit Code: PHRM-401</span>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certification Progress</span>
                      <span className="text-xs font-black text-purple-600">{certProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${certProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Credits Earned:</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-black text-sm">{creditsEarned} CME</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Active Quiz Overlay
                <div className="absolute inset-0 bg-purple-600 z-20 flex flex-col animate-fade-in-up">
                  
                  <div className="p-6 pb-2 text-white flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest block mb-1">Live Knowledge Check</span>
                      <h3 className="font-black text-xl">Module {currentQuestion + 1} of {questions.length}</h3>
                    </div>
                    <span className="text-3xl animate-bounce">⏱️</span>
                  </div>

                  <div className="flex-1 bg-white rounded-t-3xl mt-4 p-6 flex flex-col shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                    
                    {quizState === 'complete' ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg border border-emerald-200">
                          <span className="text-emerald-500 text-5xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Module Passed!</h2>
                        <p className="text-slate-500 text-sm mb-6">Excellent work. Your CME ledger has been updated.</p>
                        <div className="bg-purple-50 border border-purple-100 px-6 py-3 rounded-xl">
                          <span className="text-purple-600 font-black">+0.25 Credits Earned</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-slate-800 mb-8 leading-snug">
                          {questions[currentQuestion].q}
                        </p>

                        <div className="space-y-3 mt-auto mb-6">
                          {questions[currentQuestion].options.map((opt, idx) => {
                            
                            let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                            let icon = "";
                            
                            if (quizState === 'answering' && selectedAnswer === idx) {
                              btnStyle = "bg-purple-100 border-purple-400 text-purple-800";
                            } else if (quizState === 'graded') {
                              if (idx === questions[currentQuestion].correct) {
                                btnStyle = "bg-emerald-100 border-emerald-400 text-emerald-800 font-bold";
                                icon = "✓";
                              } else if (selectedAnswer === idx) {
                                btnStyle = "bg-rose-100 border-rose-400 text-rose-800";
                                icon = "✗";
                              } else {
                                btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                              }
                            }

                            return (
                              <button 
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={quizState !== 'idle'}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {icon && <span className={`font-black ${icon === '✓' ? 'text-emerald-600' : 'text-rose-600'}`}>{icon}</span>}
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                           {quizState === 'idle' && (
                             <div className="h-full bg-rose-500 w-full animate-[progress_15s_linear_forwards]"></div>
                           )}
                        </div>
                        <span className="text-center block mt-2 text-[10px] font-bold text-slate-400 uppercase">You have 15 seconds to answer</span>
                      </>
                    )}

                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}} />
    </div>
  );
};

export default GamifiedMicroLearning;
