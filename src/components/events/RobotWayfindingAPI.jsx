import React, { useState } from 'react';

const RobotWayfindingAPI = () => {
  const [robotStatus, setRobotStatus] = useState('idle'); // idle, listening, calculating, guiding
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pathData, setPathData] = useState(null);
  
  // Robot Fleet Data
  const fleet = [
    { id: 'R-77X', model: 'Softbank Pepper', location: 'North Lobby', battery: 88, state: robotStatus === 'idle' ? 'Standby' : 'Active Engagement' },
    { id: 'B-92D', model: 'Boston Dynamics Spot', location: 'Expo Hall C', battery: 42, state: 'Patrol' }
  ];

  const simulateInteraction = (query) => {
    setSearchQuery(query);
    setRobotStatus('listening');
    
    setTimeout(() => {
      setRobotStatus('calculating');
      
      setTimeout(() => {
        setRobotStatus('guiding');
        
        // Mock spatial data response from Eventra API
        setPathData({
          destination: query,
          boothId: 'Booth 1402',
          distance: '142 meters',
          eta: '2.5 mins',
          obstacles: 'Medium Foot Traffic in Aisle 4'
        });
        
        // Reset after simulated journey
        setTimeout(() => {
          setRobotStatus('idle');
          setPathData(null);
          setSearchQuery('');
        }, 6000);
        
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col font-sans text-neutral-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black p-6 rounded-3xl border border-neutral-800 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-900/50 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Robotics Integration
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Autonomous Wayfinding API</h1>
            </div>
            <p className="text-neutral-400 text-sm max-w-3xl">
              Don't rely on human volunteers to memorize 2,000 booth locations. Eventra exposes a secure spatial API designed specifically for autonomous venue robots. When an attendee asks for directions, the robot queries the live floorplan, calculates the optimal A* path, and physically guides them to the booth.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Robot Fleet & API Status (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl flex-1 flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Robot Fleet Telemetry</h3>
              <span className="bg-emerald-900/50 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded border border-emerald-500/30 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span> Spatial API Live
              </span>
            </div>

            <div className="space-y-4 mb-8">
              {fleet.map(robot => (
                <div key={robot.id} className={`p-4 rounded-xl border transition-colors ${robot.id === 'R-77X' && robotStatus !== 'idle' ? 'bg-blue-950/30 border-blue-500/50' : 'bg-neutral-900 border-neutral-800'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{robot.id} <span className="text-[10px] text-neutral-500 font-mono ml-2">{robot.model}</span></h4>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${robot.state === 'Active Engagement' ? 'bg-blue-900/50 text-blue-400' : 'bg-neutral-800 text-neutral-400'}`}>
                      {robot.state}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-800/50">
                    <span className="text-xs text-neutral-400 font-mono">LOC: {robot.location}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">BATTERY</span>
                      <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full ${robot.battery > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${robot.battery}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* API Console */}
            <div className="mt-auto bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-[10px] overflow-hidden">
              <span className="text-neutral-500 block mb-2 border-b border-neutral-800 pb-1 uppercase font-sans tracking-widest font-bold">API Traffic Log</span>
              
              <div className="space-y-1 opacity-80">
                <div className="text-neutral-600">GET /api/v2/robots/status - 200 OK</div>
                
                {robotStatus !== 'idle' && (
                  <div className="animate-fade-in-up text-blue-400">
                    <br/>
                    <div className="text-neutral-400">POST /api/v2/spatial/query</div>
                    <div>{`{ "robot_id": "R-77X", "query": "${searchQuery || '...'}" }`}</div>
                  </div>
                )}
                
                {robotStatus === 'calculating' && (
                  <div className="animate-fade-in-up text-amber-400 mt-1">
                    <div>[Processing A* Pathfinding...]</div>
                    <div>[Checking Live Heatmaps for Obstacles...]</div>
                  </div>
                )}
                
                {robotStatus === 'guiding' && pathData && (
                  <div className="animate-fade-in-up text-emerald-400 mt-1">
                    <div>200 OK Response:</div>
                    <div>{`{ "target": "${pathData.boothId}", "vectors": [array_data], "distance": ${pathData.distance} }`}</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Robot POV & Interaction (Col span 7) */}
        <div className="lg:col-span-7 bg-black rounded-3xl border-4 border-neutral-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-black/60 backdrop-blur-sm border border-neutral-700 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span> Robot POV (Unit R-77X)
            </span>
          </div>

          <div className="flex-1 relative bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
            
            {/* Robot Vision Overlay Filter */}
            <div className="absolute inset-0 bg-blue-900/20 mix-blend-color z-0"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz4KPC9zdmc+')] z-10 pointer-events-none"></div>

            {/* Computer Vision Target Boxes */}
            {robotStatus !== 'idle' && (
              <div className="absolute top-1/3 left-1/3 w-32 h-64 border-2 border-emerald-500 z-10 animate-pulse">
                <div className="absolute -top-6 left-0 bg-emerald-500 text-black text-[8px] font-black uppercase px-1">HUMAN TARGET IDENTIFIED</div>
              </div>
            )}

            {/* Interaction UI Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8 pt-32 z-20">
              
              {robotStatus === 'idle' ? (
                <div className="text-center animate-fade-in">
                  <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">"Hello! Where can I help you find today?"</h3>
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={() => simulateInteraction('AWS Booth')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg"
                    >
                      Ask: "Where is the AWS Booth?"
                    </button>
                    <button 
                      onClick={() => simulateInteraction('Keynote Stage')}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-6 rounded-xl transition border border-neutral-700"
                    >
                      Ask: "Where is the Keynote?"
                    </button>
                  </div>
                </div>
              ) : robotStatus === 'listening' ? (
                <div className="text-center animate-fade-in-up">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-blue-400">Processing Audio Input...</h3>
                  <p className="text-white text-lg mt-2 font-mono">"{searchQuery}"</p>
                </div>
              ) : robotStatus === 'calculating' ? (
                <div className="text-center animate-fade-in-up">
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <h3 className="text-xl font-bold text-amber-400">Querying Eventra Spatial API</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-2 uppercase tracking-widest">Calculating optimal A* Path</p>
                </div>
              ) : (
                <div className="animate-fade-in-up bg-neutral-900/80 backdrop-blur-md border border-neutral-700 p-6 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Route Established</span>
                      <h3 className="text-2xl font-black text-white">"Please follow me!"</h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-black text-white">{pathData.distance}</span>
                      <span className="block text-[10px] text-neutral-400 uppercase tracking-widest">To Destination</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-black/50 p-4 rounded-xl border border-neutral-800">
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Target</span>
                      <span className="block text-sm font-bold text-blue-400">{pathData.boothId}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Estimated Time</span>
                      <span className="block text-sm font-bold text-white">{pathData.eta}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Dynamic Routing Notes</span>
                      <span className="block text-xs text-amber-400 font-mono">{pathData.obstacles}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RobotWayfindingAPI;
