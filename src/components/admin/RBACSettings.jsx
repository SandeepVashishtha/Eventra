import React from "react";
import { useRBAC } from "../../context/RBACContext";
import { Shield, ShieldAlert, Check } from "lucide-react";

const RBACSettings = () => {
  const { policies } = useRBAC();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
          <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RBAC Policy Manager</h1>
          <p className="text-gray-500">Configure dynamic role-based access control policies for your organization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" /> Current Role Policies
          </h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Object.entries(policies).map(([role, permissions]) => (
            <div key={role} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">   
              <div className="w-48 shrink-0">
                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-sm rounded-full uppercase tracking-wider">
                  {role.replace("_", " ")}
                </span>
              </div>
              <div className="flex-1 flex flex-wrap gap-2">
                {permissions.map(perm => (
                  <div key={perm} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {perm}
                  </div>
                ))}
              </div>
              <div className="shrink-0">
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Edit Policy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RBACSettings;
