
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';

const CSPViolationDashboard = () => {
  const { token } = useAuth();
  const { data: violations = [], loading, error } = useFetch('/api/admin/csp-reports', {
    headers: { Authorization: `Bearer ${token}` }
  });

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-red-500 mb-4">CSP Security Violations</h3>
      {loading && <div className="text-slate-500 text-sm">Loading violations...</div>}
      {error && <div className="text-red-500 text-sm">Error: {error}</div>}
      {!loading && !error && (
        <div className="space-y-3">
          {violations.map((v, i) => (
            <div key={i} className="p-3 bg-slate-800 rounded text-xs text-slate-300 font-mono">
              <div><strong>Directive:</strong> {v.violatedDirective}</div>
              <div><strong>Blocked URI:</strong> {v.blockedUri}</div>
            </div>
          ))}
          {violations.length === 0 && <div className="text-slate-500 text-sm">No violations logged. System secure.</div>}
        </div>
      )}
    </div>
  );
};

export default CSPViolationDashboard;
