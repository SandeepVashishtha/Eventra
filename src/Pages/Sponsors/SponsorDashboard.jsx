import { useState, useEffect } from "react";
import {
  BarChart, Users, Link as LinkIcon, MessageSquare,
  Save, Layout, Shield, Mail, Briefcase, Info, Download, Trash2, CheckCircle2
} from "lucide-react";
import { toast } from "react-toastify";

const DEFAULT_SETTINGS = {
  id: "sp-custom",
  label: "My Awesome Company",
  isSponsorBooth: true,
  sponsorLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
  sponsorContact: "careers@mycompany.com",
  sponsorDescription: "We build the future of tech. Come join our amazing team of developers!",
  sponsorJobs: "Senior Frontend Engineer, Backend Developer, UI/UX Designer"
};

const SponsorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [leads, setLeads] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Mock analytics for the dashboard
  const [stats] = useState({
    footfall: Math.floor(Math.random() * 500) + 120,
    jobClicks: Math.floor(Math.random() * 200) + 45,
    chatInitiations: Math.floor(Math.random() * 100) + 20,
  });

  useEffect(() => {
    // Load custom settings
    const saved = localStorage.getItem("eventra_sponsor_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sponsor settings", e);
      }
    }

    // Load captured leads
    const savedLeads = localStorage.getItem("eventra_sponsor_leads");
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads).reverse()); // Newest first
      } catch (e) {
        console.error("Failed to parse sponsor leads", e);
      }
    }
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      localStorage.setItem("eventra_sponsor_settings", JSON.stringify(settings));
      setIsSaving(false);
      toast.success("Booth settings updated successfully! Changes will reflect in the Virtual Venue.", {
        icon: <CheckCircle2 className="text-emerald-500" />
      });
    }, 800);
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast.error("No leads available to export.");
      return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Action,Contact,Time\n"
      + leads.map(l => `${l.name},${l.action},${l.contact},${l.time}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "eventra_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${leads.length} leads successfully!`);
  };

  const clearLeads = () => {
    if (window.confirm("Are you sure you want to clear all leads? This cannot be undone.")) {
      localStorage.removeItem("eventra_sponsor_leads");
      setLeads([]);
      toast.success("Leads cleared.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white pb-12 transition-colors">
      
      {/* Top Navigation / Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Shield size={20} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Sponsor Portal</h1>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "overview" 
                    ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                Overview & Leads
              </button>
              <button 
                onClick={() => setActiveTab("customize")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "customize" 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                Booth Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Analytics Cards */}
            <div>
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <BarChart size={18} className="text-indigo-500" />
                Real-Time Booth Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
                    <Users size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Footfall</span>
                  </div>
                  <div className="text-4xl font-black">{stats.footfall}</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                    +12% from last hour
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
                    <LinkIcon size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Job Links Clicked</span>
                  </div>
                  <div className="text-4xl font-black">{stats.jobClicks}</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                    High engagement rate
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
                    <MessageSquare size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Chat Initiations</span>
                  </div>
                  <div className="text-4xl font-black">{stats.chatInitiations}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                    Live chat active
                  </div>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Users size={18} className="text-indigo-500" />
                  Collected Leads ({leads.length})
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={clearLeads}
                    className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-xs font-bold flex items-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                  <button 
                    onClick={handleExportLeads}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={12} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                {leads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider uppercase">
                        <tr>
                          <th className="px-6 py-4">Lead Name</th>
                          <th className="px-6 py-4">Action Taken</th>
                          <th className="px-6 py-4">Contact / Email</th>
                          <th className="px-6 py-4 text-right">Time Captured</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {leads.map((lead, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                                {lead.name.substring(0, 2).toUpperCase()}
                              </div>
                              {lead.name}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                lead.action.includes("Applied") 
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                              }`}>
                                {lead.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                              {lead.contact}
                            </td>
                            <td className="px-6 py-4 text-right text-slate-400 dark:text-slate-500 text-xs font-medium">
                              {lead.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                      <Users size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No leads captured yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                      When attendees visit your virtual booth and apply for jobs or initiate chats, their information will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "customize" && (
          <div className="max-w-3xl space-y-6 animate-fade-in pb-12">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2 mb-1">
                <Layout size={18} className="text-indigo-500" />
                Booth Customization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Update your virtual exhibition booth details. Changes will reflect instantly for all attendees visiting the Virtual Venue.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={14} className="text-indigo-500" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.label}
                    onChange={(e) => setSettings({...settings, label: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-500" />
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.sponsorContact}
                    onChange={(e) => setSettings({...settings, sponsorContact: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon size={14} className="text-indigo-500" />
                  Company Logo URL (Square Image Recommended)
                </label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {settings.sponsorLogo ? (
                      <img src={settings.sponsorLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={settings.sponsorLogo}
                    onChange={(e) => setSettings({...settings, sponsorLogo: e.target.value})}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={14} className="text-indigo-500" />
                  Open Positions (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={settings.sponsorJobs}
                  onChange={(e) => setSettings({...settings, sponsorJobs: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. Frontend Engineer, Product Manager"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout size={14} className="text-indigo-500" />
                  Company Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={settings.sponsorDescription}
                  onChange={(e) => setSettings({...settings, sponsorDescription: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorDashboard;
