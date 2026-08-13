/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ChatOpsIncidentResponse = () => {
  const [inputText, setInputText] = useState('');
  const [executionState, setExecutionState] = useState('IDLE'); // IDLE, EXECUTING, DONE
  
  const [chatLog, setChatLog] = useState([
      { id: 1, user: 'System', text: 'Welcome to the #secops-command channel. Type /help for commands.', time: '14:00' },
      { id: 2, user: 'Security Director', text: 'Lightning strike 2 miles out. Monitoring.', time: '15:22' }
  ]);
  
  const [apiStatus, setApiStatus] = useState({
      paSystem: 'idle', // idle, pending, success
      pushNotif: 'idle',
      turnstiles: 'idle',
      policeDisp: 'idle'
  });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '15:22:00', type: 'SYS', msg: 'Webhook listener active. Awaiting slash commands.' }
  ]);

  const handleCommand = () => {
      if (!inputText.trim()) return;
      
      const cmd = inputText.trim();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setChatLog(prev => [...prev, { id: Date.now(), user: 'Me (Commander)', text: cmd, time: timeStr }]);
      setInputText('');

      if (cmd === '/execute-evacuation') {
          triggerPlaybook();
      } else {
          setTimeout(() => {
              setChatLog(prev => [...prev, { id: Date.now(), user: 'EventraBot', text: 'Command not recognized. Try /execute-evacuation', time: timeStr }]);
          }, 500);
      }
  };

  const triggerPlaybook = () => {
      setExecutionState('EXECUTING');
      addLog('CRIT', 'RECEIVED /execute-evacuation. INITIALIZING CRISIS PLAYBOOK.');
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setTimeout(() => {
          setChatLog(prev => [...prev, { 
              id: Date.now(), user: 'EventraBot', 
              text: '🚨 SEVERE WEATHER EVACUATION INITIATED. Firing API hooks...', 
              time: timeStr, isBot: true 
          }]);
      }, 500);

      // Simulate sequential API calls
      setTimeout(() => {
          setApiStatus(prev => ({...prev, paSystem: 'pending'}));
          addLog('SYS', 'POST /api/v1/pa-system/override -> {"audio": "evac_script.mp3"}');
          setTimeout(() => setApiStatus(prev => ({...prev, paSystem: 'success'})), 800);
      }, 1500);

      setTimeout(() => {
          setApiStatus(prev => ({...prev, pushNotif: 'pending'}));
          addLog('SYS', 'POST /api/v1/sns/publish -> {"msg": "EVACUATE TO VEHICLES"}');
          setTimeout(() => setApiStatus(prev => ({...prev, pushNotif: 'success'})), 800);
      }, 2500);

      setTimeout(() => {
          setApiStatus(prev => ({...prev, turnstiles: 'pending'}));
          addLog('SYS', 'PATCH /api/v1/hardware/turnstiles/all -> {"mode": "OPEN_FREE_SPIN"}');
          setTimeout(() => setApiStatus(prev => ({...prev, turnstiles: 'success'})), 800);
      }, 3500);

      setTimeout(() => {
          setApiStatus(prev => ({...prev, policeDisp: 'pending'}));
          addLog('SYS', 'POST /api/v1/external/pd/dispatch -> {"code": "10-39", "loc": "Main"}');
          setTimeout(() => {
              setApiStatus(prev => ({...prev, policeDisp: 'success'}));
              setExecutionState('DONE');
              addLog('SUCCESS', 'PLAYBOOK EXECUTION COMPLETE. All systems overridden.');
              setChatLog(prev => [...prev, { 
                  id: Date.now(), user: 'EventraBot', 
                  text: '✅ Playbook complete. 100,000 users notified. Gates unlocked.', 
                  time: timeStr, isBot: true 
              }]);
          }, 800);
      }, 4500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const getStatusIcon = (status) => {
      if (status === 'idle') return <span className="text-slate-600">○</span>;
      if (status === 'pending') return <span className="text-amber-500 animate-spin flex items-center justify-center">⟳</span>;
      if (status === 'success') return <span className="text-emerald-500">✓</span>;
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💬</span> DevOps & ChatOps Integrations
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Incident <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-rose-500">Response Playbooks</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a severe weather evacuation is declared, the command center frantically tries to execute 50 different manual steps simultaneously (alerting police, triggering PA systems, pushing app notifications, opening exit gates). Eventra solves this by building a ChatOps integration. When the commander types `/execute-evacuation` in a secure Slack channel, the backend parses the command and programmatically orchestrates API requests to all third-party systems instantly.
          </p>

          <div className="bg-[#0b0f1a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Backend API Orchestrator
               </h3>
               
               <div className="flex space-x-2">
                 <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                     executionState === 'EXECUTING' ? 'bg-amber-900/50 border-amber-500 text-amber-400 animate-pulse' :
                     executionState === 'DONE' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' :
                     'bg-slate-900 border-slate-700 text-slate-500'
                 }`}>
                     {executionState === 'EXECUTING' ? 'ORCHESTRATING...' : executionState === 'DONE' ? 'PLAYBOOK COMPLETED' : 'AWAITING COMMAND'}
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
               
               {/* API endpoints statuses */}
               <div className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${apiStatus.paSystem === 'success' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'}`}>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Public Address Sys</span>
                   {getStatusIcon(apiStatus.paSystem)}
               </div>
               
               <div className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${apiStatus.pushNotif === 'success' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'}`}>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Push Notif</span>
                   {getStatusIcon(apiStatus.pushNotif)}
               </div>

               <div className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${apiStatus.turnstiles === 'success' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'}`}>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unlock Turnstiles</span>
                   {getStatusIcon(apiStatus.turnstiles)}
               </div>

               <div className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${apiStatus.policeDisp === 'success' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'}`}>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Local PD Dispatch</span>
                   {getStatusIcon(apiStatus.policeDisp)}
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Webhook Server Logs</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' : 
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* Chat UI Visualizer */}
            <div className={`w-full bg-[#1e1e24] rounded-xl border border-slate-700 shadow-2xl relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              {/* Slack-like Header */}
              <div className="bg-[#19191d] border-b border-slate-700 p-3 px-4 flex justify-between items-center z-10">
                  <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">#secops-command</span>
                      <span className="text-[10px] text-slate-400">Eventra Secure Comms</span>
                  </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-4 relative overflow-y-auto flex flex-col space-y-4">
                  
                  {chatLog.map(msg => (
                      <div key={msg.id} className="flex flex-col animate-fade-in-down">
                          <div className="flex items-baseline space-x-2 mb-1">
                              <span className={`text-xs font-bold ${msg.user === 'EventraBot' ? 'text-blue-400' : 'text-white'}`}>
                                  {msg.user} {msg.user === 'EventraBot' && <span className="bg-blue-600 text-white text-[8px] px-1 rounded ml-1 uppercase">APP</span>}
                              </span>
                              <span className="text-[9px] text-slate-500">{msg.time}</span>
                          </div>
                          
                          <div className={`text-sm ${msg.text.startsWith('/') ? 'font-mono text-emerald-400' : 'text-slate-300'}`}>
                              {msg.text}
                          </div>

                          {/* Bot rich attachment simulator */}
                          {msg.isBot && msg.text.includes('INITIATED') && (
                              <div className="mt-2 border-l-4 border-rose-500 pl-3 py-1">
                                  <div className="text-rose-500 font-bold text-xs uppercase mb-1">Executing Playbook: SEVERE_WEATHER</div>
                                  <div className="text-slate-400 text-xs font-mono">Tasks queued: 4</div>
                              </div>
                          )}
                      </div>
                  ))}

                  {executionState === 'EXECUTING' && (
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
                          <span className="ml-2">EventraBot is running...</span>
                      </div>
                  )}

              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#1e1e24]">
                  <div className="bg-[#292930] rounded-lg border border-slate-600 flex items-center p-2 px-3">
                      <span className="text-slate-400 mr-2">⚡️</span>
                      <input 
                          type="text" 
                          placeholder="Type /execute-evacuation..."
                          className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder-slate-500 font-mono"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                          disabled={executionState !== 'IDLE'}
                      />
                  </div>
              </div>

            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0f1a] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Webhook Automation:</span>
               In the chat simulator, type <span className="text-emerald-400 font-mono font-bold bg-slate-800 px-1 rounded">/execute-evacuation</span> and hit enter. The Eventra bot intercepts the webhook and programmatically orchestrates multiple REST API calls (PA System, Push Notifications, Gate Locks, Police Dispatch) synchronously, eliminating manual panic.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ChatOpsIncidentResponse;
