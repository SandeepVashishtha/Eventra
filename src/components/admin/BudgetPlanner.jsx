import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { Sparkles } from 'lucide-react';

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
  const [budget, setBudget] = useState(initialBudget);

  const handleExportCSV = () => {
    const data = [{ ...budget }];
    exportToCSV(data, 'budget_report');
  };

  const handleExportJSON = () => {
    const data = [{ ...budget }];
    exportToJSON(data, 'budget_report');
  };

  const handleOptimize = () => {
    // Placeholder for AI optimizer – currently just shows a toast
    alert('AI optimizer is not yet implemented.');
  };

  const totalCosts = Object.values(budget.costs).reduce((a, b) => a + b, 0);

  return (
    <section className="p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Budget Planner</h2>
        <button
          onClick={handleOptimize}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
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
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg h-64">
          <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Break‑Even Point</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={breakEvenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="#ef4444" name="Costs" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Distribution Pie */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg h-64">
        <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Cost Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={Object.entries(budget.costs).map(([name, value], i) => ({ name, value, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
            >
              {Object.entries(budget.costs).map((_, i) => (
                <Cell key={`cell-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition"
        >Export CSV</button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition"
        >Export JSON</button>
      </div>
    </section>
  );
};

export default BudgetPlanner;
