import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast'; 

// Mock data for budgeting
const initialBudget = {
  revenue: 50000,
  costs: {
    venue: 15000,
    marketing: 8000,
    staff: 12000,
    miscellaneous: 3000,
  },
  profit: 12000,
};

const breakEvenData = [
  { month: 'Jan', revenue: 8000, costs: 7000 },
  { month: 'Feb', revenue: 12000, costs: 9000 },
  { month: 'Mar', revenue: 18000, costs: 13000 },
  { month: 'Apr', revenue: 24000, costs: 17000 },
  { month: 'May', revenue: 30000, costs: 21000 },
  { month: 'Jun', revenue: 38000, costs: 25000 },
];

const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const BudgetPlanner = () => {
  const [budget] = useState(initialBudget);

  // 🔥 FIX 1: React Performance Optimization (useMemo)
  // Prevents endless remounting of Recharts nodes by preserving array reference
  const pieChartData = useMemo(() => {
    return Object.entries(budget.costs).map(([name, value], i) => ({
      name,
      value,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    }));
  }, [budget.costs]);

  const handleExportCSV = () => {
    // 🔥 FIX 2: Flattened the nested object so CSV parsers don't output [object Object]
    const flatData = [{
      revenue: budget.revenue,
      profit: budget.profit,
      ...budget.costs
    }];
    exportToCSV(flatData, 'budget_report');
  };

  const handleExportJSON = () => {
    const data = [{ ...budget }];
    exportToJSON(data, 'budget_report');
  };

  const handleOptimize = () => {
    // Placeholder for AI optimizer – currently just shows a toast
    toast('AI optimizer is not yet implemented. Stay tuned!');
  };

  return (
    <section className="p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Budget Planner</h2>
        <button
          onClick={handleOptimize}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <Sparkles className="w-4 h-4" /> Optimize
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Ledger */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Operational Ledger</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Revenue: <span className="font-medium">${budget.revenue.toLocaleString()}</span></li>
            {Object.entries(budget.costs).map(([k, v]) => (
              <li key={k}>{k.charAt(0).toUpperCase() + k.slice(1)}: <span className="font-medium">${v.toLocaleString()}</span></li>
            ))}
            <li className="mt-2 font-bold">Profit: <span className="text-green-600">${budget.profit.toLocaleString()}</span></li>
          </ul>
        </div>

        {/* Break‑Even Chart */}
        {/* 🔥 FIX 3: Added text-slate-500 class so 'currentColor' adapts to Dark Mode */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg h-64 text-slate-500 dark:text-slate-400">
          <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Break‑Even Point</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={breakEvenData}>
              {/* Swapped static hex colors for currentColor to support theme switching */}
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
              <XAxis dataKey="month" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Distribution Pie */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg h-64 text-slate-500 dark:text-slate-400">
        <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Cost Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
            >
              {pieChartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >Export CSV</button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >Export JSON</button>
      </div>
    </section>
  );
};

export default BudgetPlanner;