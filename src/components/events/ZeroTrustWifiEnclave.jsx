/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ZeroTrustWifiEnclave = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [authState, setAuthState] = useState('IDLE'); // IDLE, SCANNING, PROVISIONING, CONNECTED
  
  // Network Metrics
  const [activeLeases, setActiveLeases] = useState(0); 
  const [rogueDevicesBlocked, setRogueDevicesBlocked] = useState(1402); 
  const [networkThroughput, setNetworkThroughput] = useState(0); // Gbps
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '17:00:00', type: 'SYS', msg: '802.1X RADIUS server online. WPA2-PSK disabled.' },
    { id: 2, time: '17:00:02', type: 'SYS', msg: 'Zero-Trust architecture enforcing strict MAC isolation.' }
  ]);

  // Visualizer State
  const [currentCert, setCurrentCert] = useState(null);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (authState === 'CONNECTED') {
              setNetworkThroughput(4.2 + (Math.random() * 0.8)); // High speed
              setActiveLeases(prev => Math.min(850, prev + Math.floor(Math.random() * 3)));
          } else {
              setNetworkThroughput(0.1 + (Math.random() * 0.2));
          }

          // Randomly block script kiddies trying to guess passwords
          if (Math.random() > 0.7) {
              setRogueDevicesBlocked(prev => prev + 1);
          }

      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, authState]);

  const simulateRfidScan = () => {
      if (!systemActive || authState !== 'IDLE') return;
      
      setAuthState('SCANNING');
      addLog('ACTION', 'RFID Wristband Scanned at VIP Lounge Entrance.');
      
      setTimeout(() => {
          setAuthState('PROVISIONING');
          addLog('SYS', 'Verifying VIP ticket status. Requesting temporary EAP-TLS certificate.');
          
          setTimeout(() => {
              const certId = `CERT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
              setCurrentCert(certId);
              addLog('SUCCESS', `Issued 802.1X payload to device keychain: ${certId}`);
              
              setTimeout(() => {
                  setAuthState('CONNECTED');
                  addLog('SUCCESS', 'Device authenticated via Zero-Trust certificate. Full gigabit access granted.');
              }, 1200);

          }, 1500);
      }, 1000);
  };

  const disconnectDevice = () => {
      setAuthState('IDLE');
      setCurrentCert(null);
      setNetworkThroughput(0);
      addLog('WARN', 'Device disconnected. Temporary certificate automatically revoked.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveLeases(812);
      addLog('SYS', 'VIP Wi-Fi Enclave activated. Blocking all uncertified MAC addresses.');
    } else {
      setSystemActive(false);
      setAuthState('IDLE');
      setCurrentCert(null);
      setActiveLeases(0);
      setNetworkThroughput(0);
      addLog('CRIT', 'RADIUS server offline. Network reverting to open/vulnerable state.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Network Security
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Zero-Trust Network <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">for VIP Enclaves</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Standard VIP Wi-Fi passwords (e.g., "VIP2026") are immediately leaked to the general admission crowd, completely crashing the network intended for premium guests and artists. Changing the password every hour infuriates actual VIPs. Eventra solves this by implementing a Zero-Trust network architecture using 802.1X certificate-based authentication. When a VIP scans their RFID wristband at the lounge entrance, the app automatically provisions a temporary, device-specific, non-transferable network certificate to their phone's keychain, granting seamless Wi-Fi access without ever exposing a password.
          </p>

          <div className="bg-[#0b0811] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> RADIUS Server Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Zero-Trust' : 'Enforce 802.1X Auth'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Authentication State */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 authState === 'PROVISIONING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50 animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 
                 authState === 'CONNECTED' ? 'bg-emerald-950/40 border-emerald-500/50' : 
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   EAP-TLS Status
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     authState === 'PROVISIONING' ? 'text-fuchsia-400' : 
                     authState === 'CONNECTED' ? 'text-emerald-400' : 
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {authState}
                   </span>
                 </div>
               </div>

               {/* Active Leases */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Certs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activeLeases}
                   </span>
                 </div>
               </div>
               
               {/* Rogue Blocks */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Rogue Blocks
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         systemActive ? 'text-red-400' : 'text-slate-600'
                       }`}>
                         {(rogueDevicesBlocked / 1000).toFixed(1)}k
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040205] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>RADIUS Policy Ledger</span>
                 {authState === 'PROVISIONING' && <span className="text-fuchsia-400 font-black animate-pulse">GENERATING KEYPAIR...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* VIP Lounge MDM Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 bg-slate-900 transition-colors duration-500`}>
              
              <div className="pt-12 pb-4 px-6 bg-black border-b border-slate-800 flex justify-between items-center z-20">
                  <span className="text-sm font-black tracking-widest text-white uppercase">WIFI SETTINGS</span>
                  <div className="w-6 h-4 bg-emerald-500 rounded-full flex items-center justify-end px-0.5">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
              </div>

              <div className="flex-1 flex flex-col p-6 relative z-10 overflow-y-auto">
                  
                  {/* Network List */}
                  <div className="bg-slate-800 rounded-xl overflow-hidden mb-6 border border-slate-700">
                      
                      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 hover:bg-slate-700 transition cursor-pointer">
                          <div>
                              <span className="text-white font-bold block mb-1">Eventra_Public</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Unsecured Network</span>
                          </div>
                          <span className="text-slate-500 text-xl">📶</span>
                      </div>

                      <div className={`p-4 flex justify-between items-center transition-colors cursor-pointer ${
                          authState === 'CONNECTED' ? 'bg-emerald-900/20' : 'bg-slate-800 hover:bg-slate-700'
                      }`}>
                          <div>
                              <span className={`font-bold block mb-1 ${authState === 'CONNECTED' ? 'text-emerald-400' : 'text-white'}`}>
                                  Eventra_VIP_Secure
                              </span>
                              <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold flex items-center">
                                  <span className="mr-1">🔒</span> 802.1X EAP-TLS
                              </span>
                          </div>
                          <div className="flex items-center">
                              {authState === 'CONNECTED' && <span className="text-emerald-500 mr-2 text-sm">✔️</span>}
                              <span className={authState === 'CONNECTED' ? 'text-emerald-500 text-xl' : 'text-slate-500 text-xl'}>📶</span>
                          </div>
                      </div>

                  </div>

                  {/* Simulated MDM / Keychain Popup */}
                  {authState === 'PROVISIONING' && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-6 animate-fade-in-up">
                          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full p-6 text-center shadow-2xl">
                              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center text-purple-400 text-2xl mx-auto mb-4 animate-spin">
                                  ⚙️
                              </div>
                              <span className="text-sm font-black text-white uppercase tracking-widest block mb-2">Installing Profile</span>
                              <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
                                  Eventra is installing a temporary Zero-Trust security certificate to your device keychain.
                              </p>
                              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500 w-full animate-[progress_1.5s_ease-in-out]"></div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Connected State UI */}
                  {authState === 'CONNECTED' && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center animate-fade-in-up">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Connection Details</span>
                          
                          <div className="w-full bg-black rounded p-3 mb-4 font-mono text-[8px] text-emerald-500 border border-slate-800 break-all leading-tight">
                              CERT: {currentCert}<br/>
                              ALGO: SHA-256 with RSA<br/>
                              VALID: 72 HOURS
                          </div>

                          <div className="flex justify-between w-full mb-6">
                              <div className="text-center w-1/2 border-r border-slate-800">
                                  <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Throughput</span>
                                  <span className="text-lg font-mono text-white">{networkThroughput.toFixed(1)} <span className="text-[10px] text-slate-400">Gbps</span></span>
                              </div>
                              <div className="text-center w-1/2">
                                  <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Ping</span>
                                  <span className="text-lg font-mono text-white">4 <span className="text-[10px] text-slate-400">ms</span></span>
                              </div>
                          </div>

                          <button 
                              onClick={disconnectDevice}
                              className="w-full py-2 bg-red-900/30 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-900/50 transition border border-red-900/50"
                          >
                              Revoke & Disconnect
                          </button>
                      </div>
                  )}

              </div>
              
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0b0811] p-4 rounded-xl border border-slate-800">
               <button 
                   onClick={simulateRfidScan}
                   disabled={!systemActive || authState !== 'IDLE'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || authState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-600 text-purple-400 hover:bg-purple-900/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                   }`}
                 >
                   📲 Tap VIP RFID Wristband
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ZeroTrustWifiEnclave;
