import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Users, DollarSign, Download, Calendar, 
  Map as MapIcon, ArrowUpRight, ArrowDownRight, Filter
} from "lucide-react";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// ── Components ───────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
          {trend === "up" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
  </motion.div>
);

const EventAnalyticsDashboard = ({ eventId, eventData }) => {
  const [dateRange, setDateRange] = useState("7d");

  // Mock data for demonstration (In production, this would come from RealTimeContext/API)
  const registrationData = useMemo(() => [
    { day: "Mon", registrations: 45, sales: 2400 },
    { day: "Tue", registrations: 52, sales: 3100 },
    { day: "Wed", registrations: 38, sales: 1800 },
    { day: "Thu", registrations: 65, sales: 4200 },
    { day: "Fri", registrations: 48, sales: 2900 },
    { day: "Sat", registrations: 89, sales: 5600 },
    { day: "Sun", registrations: 72, sales: 4800 },
  ], []);

  const tierData = [
    { name: "Early Bird", value: 400, color: "#6366f1" },
    { name: "General", value: 300, color: "#8b5cf6" },
    { name: "VIP", value: 150, color: "#ec4899" },
  ];

  const handleExport = async () => {
    const dashboard = document.getElementById("analytics-dashboard");
    if (!dashboard) return;

    toast.info("Generating report...");
    try {
      const canvas = await html2canvas(dashboard, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`event-analytics-${eventId}.pdf`);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate report.");
    }
  };

  return (
    <div id="analytics-dashboard" className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time performance metrics for {eventData?.title || "Your Event"}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Download size={18} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
            <Calendar size={18} /> Share Dashboard
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registrations" value="1,284" icon={Users} trend="up" trendValue="12" color="indigo" />
        <StatCard title="Total Revenue" value="₹48,250" icon={DollarSign} trend="up" trendValue="8" color="emerald" />
        <StatCard title="Avg. Ticket Price" value="₹375" icon={TrendingUp} trend="down" trendValue="3" color="amber" />
        <StatCard title="Scan Rate" value="94%" icon={CheckCircle} trend="up" trendValue="5" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" /> Registration Velocity
            </h3>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Tiers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-500" /> Ticket Tier Mix
          </h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold dark:text-white">850</span>
              <span className="text-xs text-gray-500">Sold</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {tierData.map((tier) => (
              <div key={tier.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tier.name}</span>
                </div>
                <span className="text-sm font-semibold dark:text-white">{tier.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;
