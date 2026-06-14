
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CSPViolationDashboard = () => {
  const [violations, setViolations] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetch('/api/admin/csp-reports', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setViolations).catch(() => {});
  }, [token]);

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-red-500 mb-4">CSP Security Violations</h3>
      <div className="space-y-3">
        {violations.map((v, i) => (
          <div key={i} className="p-3 bg-slate-800 rounded text-xs text-slate-300 font-mono">
            <div><strong>Directive:</strong> {v.violatedDirective}</div>
            <div><strong>Blocked URI:</strong> {v.blockedUri}</div>
          </div>
        ))}
        {violations.length === 0 && <div className="text-slate-500 text-sm">No violations logged. System secure.</div>}
      </div>
    </div>
  );
};

export default CSPViolationDashboard;
