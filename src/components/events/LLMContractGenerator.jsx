import React, { useState } from 'react';

const LLMContractGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [contractReady, setContractReady] = useState(false);

  // Form State
  const [partyName, setPartyName] = useState('Dr. Alice Chen');
  const [role, setRole] = useState('Keynote Speaker');
  const [compensation, setCompensation] = useState('$5,000 + Travel Expenses');
  const [deliverables, setDeliverables] = useState('1 hr Keynote on AI Ethics, 30 min Q&A, 1 blog post.');

  const handleGenerate = (e) => {
    e.preventDefault();
    setGenerating(true);
    setContractReady(false);
    
    // Simulate LLM processing time
    setTimeout(() => {
      setGenerating(false);
      setContractReady(true);
    }, 2500);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-indigo-500/30">LLM Agent Active</span>
              <h1 className="text-3xl font-black text-white">Automated Contract Generation</h1>
            </div>
            <p className="text-slate-400 text-sm">Instantly draft customized, legally-sound contracts for speakers and vendors using AI.</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 font-mono text-sm text-slate-300">
            Model: Legal-GPT-4o
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <span className="text-xl mr-2">📝</span> Define Contract Parameters
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Counterparty Name</label>
                  <input 
                    type="text" 
                    value={partyName} 
                    onChange={(e) => setPartyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role / Type</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  >
                    <option>Keynote Speaker</option>
                    <option>Panelist</option>
                    <option>Sponsor</option>
                    <option>A/V Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Compensation Terms</label>
                <input 
                  type="text" 
                  value={compensation} 
                  onChange={(e) => setCompensation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deliverables & Requirements</label>
                <textarea 
                  value={deliverables} 
                  onChange={(e) => setDeliverables(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={generating}
                className={`w-full py-4 rounded-xl font-black shadow-lg transition flex items-center justify-center mt-4 ${generating ? 'bg-indigo-800 text-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
              >
                {generating ? (
                  <>
                    <span className="text-xl mr-2 animate-spin">⚙️</span> Drafting via LLM...
                  </>
                ) : (
                  'Generate Contract'
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Output & E-Sign */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col relative overflow-hidden h-[600px]">
            
            {!contractReady && !generating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                <span className="text-6xl mb-4">📄</span>
                <p className="font-medium text-sm">Awaiting parameters to generate draft.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                  <h3 className="font-bold text-white flex items-center">
                    <span className="text-emerald-400 mr-2">✓</span> Draft Generated
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {Math.floor(Math.random() * 100000)}</span>
                </div>
                
                {/* Document Preview Area */}
                <div className="flex-1 bg-white rounded-xl overflow-y-auto shadow-inner p-6 mb-6">
                  {generating ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-24 bg-slate-100 rounded w-full mt-8"></div>
                    </div>
                  ) : (
                    <div className="font-serif text-slate-800 text-sm leading-relaxed animate-fade-in">
                      <h2 className="text-center font-bold text-lg mb-6 uppercase tracking-wider">{role.toUpperCase()} AGREEMENT</h2>
                      
                      <p className="mb-4">
                        This Agreement is made effective as of <strong>August 10, 2026</strong>, by and between <strong>Eventra Organizers</strong> ("Organizer") and <strong>{partyName}</strong> ("{role}").
                      </p>
                      
                      <h4 className="font-bold mt-6 mb-2">1. DELIVERABLES & SERVICES</h4>
                      <p className="mb-4 text-justify">
                        The {role} agrees to provide the following services: <em>{deliverables}</em>. These services shall be delivered in a professional manner in accordance with industry standards.
                      </p>
                      
                      <h4 className="font-bold mt-6 mb-2">2. COMPENSATION</h4>
                      <p className="mb-4 text-justify">
                        In consideration for the services provided, the Organizer shall provide compensation in the amount of: <strong>{compensation}</strong>. Payment shall be disbursed within Net-30 days following the completion of the event.
                      </p>

                      <h4 className="font-bold mt-6 mb-2">3. CANCELLATION</h4>
                      <p className="mb-8 text-justify">
                        Either party may terminate this Agreement with 30 days written notice. Standard force majeure clauses apply.
                      </p>
                    </div>
                  )}
                </div>

                {/* E-Signature Call to Action */}
                {!generating && (
                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition z-10 relative flex items-center justify-center">
                    <span className="mr-2">✉️</span> Send for E-Signature
                  </button>
                )}
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default LLMContractGenerator;
