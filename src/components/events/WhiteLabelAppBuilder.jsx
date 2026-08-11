import React, { useState } from 'react';

const WhiteLabelAppBuilder = () => {
  const [appName, setAppName] = useState('TechCon 2026');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [buildState, setBuildState] = useState('idle'); // idle, compiling, success
  const [progress, setProgress] = useState(0);

  const startBuildPipeline = () => {
    setBuildState('compiling');
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 2;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setBuildState('success'), 600);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-5xl mx-auto mt-8 border border-gray-100 flex flex-col md:flex-row gap-8">
      
      {/* Settings Panel */}
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">White-label App Builder</h2>
          <p className="text-sm text-gray-500 mt-1">Configure and compile your event's standalone iOS/Android app.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">App Name (App Store / Play Store)</label>
            <input 
              type="text" 
              value={appName} 
              onChange={(e) => setAppName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Primary Brand Color</label>
            <div className="flex items-center space-x-3">
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 border-0 rounded cursor-pointer"
              />
              <span className="font-mono text-gray-600 text-sm">{primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">App Icon</label>
            <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
              <span className="text-xl">⬆️</span>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-bold text-amber-800 text-sm mb-1">Premium Feature</h4>
            <p className="text-xs text-amber-700">
              Compiling a standalone app will incur a $999 deployment fee, which includes automated submission to Apple and Google review processes.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          {buildState === 'idle' ? (
            <button 
              onClick={startBuildPipeline}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition shadow-md"
            >
              Compile & Submit App
            </button>
          ) : buildState === 'compiling' ? (
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-white text-sm font-bold mb-2 flex items-center">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                Running CI/CD Pipeline...
              </p>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-gray-400 font-mono text-xs mt-2">
                {progress > 80 ? 'Signing binaries...' : progress > 50 ? 'Compiling React Native bridge...' : 'Bundling assets...'}
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <span className="text-2xl mb-2 block">🚀</span>
              <h4 className="font-bold text-green-800">Build Successful</h4>
              <p className="text-xs text-green-700 mt-1">Binaries submitted to TestFlight and Google Play Console.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-8">
        {/* Mobile Device Mockup */}
        <div className="w-[300px] h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>
          
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2.25rem] overflow-hidden relative flex flex-col">
            
            {/* Header */}
            <div 
              className="pt-12 pb-6 px-6 text-white transition-colors duration-300"
              style={{ backgroundColor: primaryColor }}
            >
              <h1 className="text-2xl font-black">{appName || 'App Name'}</h1>
              <p className="text-white/80 text-sm mt-1">Oct 12 - 14, San Francisco</p>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 space-y-4 bg-gray-50">
              <div className="w-full h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex space-x-4">
                <div className="flex-1 h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1 h-24 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Tab Bar */}
            <div className="h-20 bg-white border-t border-gray-200 flex justify-around items-center px-4 pb-4">
              <div className="w-10 h-10 rounded-full flex flex-col items-center justify-center" style={{ color: primaryColor }}>
                <span className="text-xl">🏠</span>
              </div>
              <div className="w-10 h-10 text-gray-400 flex flex-col items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div className="w-10 h-10 text-gray-400 flex flex-col items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WhiteLabelAppBuilder;
