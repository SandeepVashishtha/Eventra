import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Eye,
  CheckCircle,
  TrendingUp,
  Download,
  Calendar,
  CreditCard
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock Data for Charts
const registrationData = [
  { name: "Day 1", registrations: 12 },
  { name: "Day 2", registrations: 25 },
  { name: "Day 3", registrations: 40 },
  { name: "Day 4", registrations: 30 },
  { name: "Day 5", registrations: 55 },
  { name: "Day 6", registrations: 85 },
  { name: "Today", registrations: 120 }
];

const demographicsData = [
  { name: "Developers", value: 45 },
  { name: "Designers", value: 25 },
  { name: "Product Managers", value: 20 },
  { name: "Founders/Other", value: 10 }
];

const COLORS = ["#6366f1", "#ec4899", "#8b5cf6", "#10b981"];

const StatCard = ({ title, value, change, icon: Icon, colorClass, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[100px] pointer-events-none`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</h3>
        <p className={`text-xs font-bold ${change.startsWith("+") ? "text-emerald-500" : "text-red-500"} flex items-center gap-1`}>
          {change.startsWith("+") ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
          {change} from last week
        </p>
      </div>
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

const EventAnalyticsDashboard = () => {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                Event Analytics Dashboard
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Calendar size={14} /> Event ID: {eventId}
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all active:scale-95">
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Registrations" 
            value="1,248" 
            change="+12.5%" 
            icon={Users} 
            colorClass="from-indigo-500 to-indigo-600" 
            index={0} 
          />
          <StatCard 
            title="Page Views" 
            value="8,405" 
            change="+24.1%" 
            icon={Eye} 
            colorClass="from-pink-500 to-pink-600" 
            index={1} 
          />
          <StatCard 
            title="Check-in Rate" 
            value="68%" 
            change="+5.2%" 
            icon={CheckCircle} 
            colorClass="from-emerald-500 to-emerald-600" 
            index={2} 
          />
          <StatCard 
            title="Est. Ticket Revenue" 
            value="$12,400" 
            change="+18.0%" 
            icon={CreditCard} 
            colorClass="from-amber-500 to-orange-500" 
            index={3} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={20} />
              Registration Trends (Last 7 Days)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Demographics Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col"
          >
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Users className="text-pink-500" size={20} />
              Attendee Breakdown
            </h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold">Recent Registrations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Attendee</th>
                  <th className="px-6 py-4">Ticket Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {[
                  { name: "Alice Chen", role: "Developer", type: "Early Bird", date: "2 mins ago", status: "Confirmed" },
                  { name: "Bob Smith", role: "Designer", type: "General Admission", date: "15 mins ago", status: "Confirmed" },
                  { name: "Charlie Davis", role: "Product Manager", type: "VIP", date: "1 hour ago", status: "Checked In" },
                  { name: "Diana Prince", role: "Developer", type: "General Admission", date: "3 hours ago", status: "Pending" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold">{row.name} <span className="block text-xs font-normal text-slate-500">{row.role}</span></td>
                    <td className="px-6 py-4">{row.type}</td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.status === "Confirmed" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" :
                        row.status === "Checked In" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;
