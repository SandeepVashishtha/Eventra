/* eslint-disable */
import React, { useState, useEffect } from 'react';

const RBACMatrixEditor = () => {
  const [activeRole, setActiveRole] = useState('Vendor');
  
  // Simulated backend DB state for RBAC policies
  const [policies, setPolicies] = useState({
      'Admin': {
          'Sales Data': { create: true, read: true, update: true, delete: true },
          'Security Logs': { create: true, read: true, update: true, delete: true },
          'Schedule API': { create: true, read: true, update: true, delete: true },
          'User PII': { create: true, read: true, update: true, delete: true }
      },
      'Security Director': {
          'Sales Data': { create: false, read: false, update: false, delete: false },
          'Security Logs': { create: true, read: true, update: true, delete: false },
          'Schedule API': { create: false, read: true, update: false, delete: false },
          'User PII': { create: false, read: true, update: false, delete: false }
      },
      'Vendor': {
          'Sales Data': { create: true, read: true, update: false, delete: false }, // Only their own data (multi-tenant logic handled in backend)
          'Security Logs': { create: false, read: false, update: false, delete: false },
          'Schedule API': { create: false, read: true, update: false, delete: false },
          'User PII': { create: false, read: false, update: false, delete: false }
      }
  });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'IAM Policy Engine connected. Super-Admin authenticated.' }
  ]);
  
  const [isUpdating, setIsUpdating] = useState(false);

  const togglePermission = (resource, action) => {
      // Prevent editing Admin
      if (activeRole === 'Admin') {
          addLog('CRIT', 'Action Denied. Super-Admin root policies cannot be modified.');
          return;
      }
      
      setIsUpdating(true);
      
      setPolicies(prev => {
          const newPolicies = { ...prev };
          newPolicies[activeRole][resource][action] = !newPolicies[activeRole][resource][action];
          return newPolicies;
      });
      
      addLog('ACTION', `Compiling IAM Policy Diff...`);
      
      setTimeout(() => {
          setIsUpdating(false);
          addLog('SUCCESS', `PATCH /api/v1/iam/roles/${activeRole.toLowerCase().replace(' ','-')} -> JWT Signatures invalidated.`);
      }, 800);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050e] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Cybersecurity & Identity Access
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-Tenant Role-Based <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500">Access Control (RBAC)</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The current admin dashboard gives a "Vendor" the same global database access as a "Security Director," creating a massive vulnerability for data breaches. Eventra solves this by implementing a strict, multi-tenant RBAC architecture on the backend. This visual "Permissions Matrix" allows super-admins to toggle granular CRUD (Create, Read, Update, Delete) permissions, dynamically compiling secure JSON Web Token (JWT) policies.
          </p>

          <div className="bg-[#0b0a17] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> IAM Role Selector
               </h3>
               
               <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                 {['Admin', 'Security Director', 'Vendor'].map(role => (
                     <button 
                         key={role}
                         onClick={() => {
                             setActiveRole(role);
                             addLog('SYS', `Loaded access matrix for Role: ${role}`);
                         }}
                         className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                           activeRole === role ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' :
                           'text-slate-500 hover:text-slate-400 hover:bg-slate-800'
                         }`}
                     >
                         {role}
                     </button>
                 ))}
               </div>
             </div>

             <div className="flex-1 flex flex-col justify-center mb-6 relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4 border-b border-slate-800 pb-2">
                   JWT Policy JSON Preview
                 </span>
                 
                 {isUpdating ? (
                     <div className="flex-1 flex items-center justify-center">
                         <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                     </div>
                 ) : (
                     <pre className="text-[9px] font-mono text-emerald-400 overflow-y-auto">
{`{
  "iss": "eventra-iam-core",
  "role": "${activeRole}",
  "permissions": [
${Object.entries(policies[activeRole]).map(([resource, actions]) => {
  const allowed = Object.entries(actions).filter(([_, val]) => val).map(([act]) => `"${act}"`);
  return `    { "resource": "${resource.toLowerCase().replace(' ','_')}", "actions": [${allowed.join(', ')}] }`;
}).join(',\n')}
  ]
}`}
                     </pre>
                 )}
                 
                 <div className="absolute top-2 right-2 text-3xl opacity-10">🔐</div>
             </div>
             
             {/* System Log */}
             <div className="h-32 bg-[#040308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Auth Pipeline</span>
                 {isUpdating && <span className="text-purple-400 font-black animate-pulse">RE-SIGNING TOKENS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-rose-600 px-1' :
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
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* IAM Matrix Dashboard */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Enterprise IAM Hub</span>
                      <span className="text-xs text-white font-bold">Granular Permissions Matrix</span>
                  </div>
                  <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${activeRole === 'Admin' ? 'bg-rose-500' : 'bg-purple-500'}`}></div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{activeRole}</span>
                  </div>
              </div>

              {/* Matrix Area */}
              <div className="flex-1 bg-slate-950 p-2 overflow-x-auto">
                  
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr>
                              <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Resource</th>
                              <th className="p-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-slate-800 text-center">Create</th>
                              <th className="p-3 text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-slate-800 text-center">Read</th>
                              <th className="p-3 text-[10px] font-black text-amber-500 uppercase tracking-widest border-b border-slate-800 text-center">Update</th>
                              <th className="p-3 text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-slate-800 text-center">Delete</th>
                          </tr>
                      </thead>
                      <tbody>
                          {Object.entries(policies[activeRole]).map(([resource, actions]) => (
                              <tr key={resource} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                                  <td className="p-3">
                                      <div className="text-xs font-bold text-slate-300">{resource}</div>
                                      <div className="text-[8px] text-slate-600 font-mono mt-1">/api/v1/{resource.toLowerCase().replace(' ','-')}</div>
                                  </td>
                                  
                                  {['create', 'read', 'update', 'delete'].map(action => (
                                      <td key={action} className="p-3 text-center">
                                          <button 
                                              onClick={() => togglePermission(resource, action)}
                                              disabled={isUpdating}
                                              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                                                  actions[action] ? 
                                                      (action === 'create' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                                                       action === 'read' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]' :
                                                       action === 'update' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                                                       'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(225,29,72,0.3)]')
                                                  : 'bg-slate-900 border border-slate-700 text-slate-700 hover:border-slate-500'
                                              }`}
                                          >
                                              {actions[action] ? '✓' : '×'}
                                          </button>
                                      </td>
                                  ))}
                              </tr>
                          ))}
                      </tbody>
                  </table>

                  {activeRole === 'Admin' && (
                      <div className="mt-4 mx-4 bg-rose-900/20 border border-rose-500/30 p-3 rounded-lg flex items-start">
                          <span className="text-rose-500 mr-2">⚠️</span>
                          <span className="text-[9px] text-rose-400 uppercase tracking-widest font-bold leading-relaxed">
                              Root Access Warning: The Admin role has immutable global access. Permissions cannot be modified from this matrix to prevent accidental lockouts.
                          </span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0a17] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">Granular CRUD Engine:</span>
               Select the <span className="text-slate-300 font-bold bg-slate-800 px-1 rounded">Vendor</span> role. Notice they are heavily restricted to prevent data breaches. Click the <span className="text-emerald-400 font-bold">Create</span> or <span className="text-blue-400 font-bold">Read</span> checkboxes in the matrix. The backend dynamically recompiles the IAM JSON Policy, instantly invalidating old JWT tokens across all active sessions.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default RBACMatrixEditor;
