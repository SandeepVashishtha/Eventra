import { useState, useEffect } from "react";
import {
  BarChart,
  Users,
  Link as LinkIcon,
  MessageSquare,
  Save,
  Layout,
  Shield,
  Mail,
  Briefcase,
  Info,
  Download,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { safeJsonParse } from "../../utils/safeJsonParse";

const DEFAULT_SETTINGS = {
  id: "sp-custom",
  label: "My Awesome Company",
  isSponsorBooth: true,
  sponsorLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
  sponsorContact: "careers@mycompany.com",
  sponsorDescription: "We build the future of tech. Come join our amazing team of developers!",
  sponsorJobs: "Senior Frontend Engineer, Backend Developer, UI/UX Designer",
};

const SponsorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState({
    boothVisits: 0,
    qrScans: 0,
    engagementRate: 0,
  });
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
        setSettings(safeJsonParse(saved, {}));
      } catch (e) {
        console.error("Failed to parse sponsor settings", e);
      }
    }

    // Load captured leads
    const savedLeads = localStorage.getItem("eventra_sponsor_leads");

    if (savedLeads) {
      try {
        const parsedLeads = safeJsonParse(savedLeads, []);

        setLeads([...parsedLeads].reverse());

        setAnalytics({
          boothVisits: parsedLeads.length * 3,
          qrScans: parsedLeads.length,
          engagementRate:
            parsedLeads.length > 0
              ? ((parsedLeads.length / (parsedLeads.length * 3)) * 100).toFixed(1)
              : 0,
        });
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
      toast.success(
        "Booth settings updated successfully! Changes will reflect in the Virtual Venue.",
        {
          icon: <CheckCircle2 className="text-emerald-500" />,
        }
      );
    }, 800);
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast.error("No leads available to export.");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Action,Contact,Time\n" +
      leads.map((l) => `${l.name},${l.action},${l.contact},${l.time}`).join("\n");

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

      setAnalytics({
        boothVisits: 0,
        qrScans: 0,
        engagementRate: 0,
      });
      toast.success("Leads cleared.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900 transition-colors dark:bg-[#07070c] dark:text-white">
      {/* Top Navigation / Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
                <Shield size={20} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Sponsor Portal</h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Overview & Leads
              </button>
              <button
                onClick={() => setActiveTab("customize")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "customize"
                    ? "border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Booth Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeTab === "overview" && (
          <div className="animate-fade-in space-y-8">
            {/* Analytics Cards */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
                <BarChart size={18} className="text-indigo-500" />
                Real-Time Booth Analytics
              </h2>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900">
                  <h3 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Booth Visits
                  </h3>
                  <p className="text-3xl font-black">{analytics.boothVisits}</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900">
                  <h3 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    QR Lead Scans
                  </h3>
                  <p className="text-3xl font-black">{analytics.qrScans}</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900">
                  <h3 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Engagement Rate
                  </h3>
                  <p className="text-3xl font-black">{analytics.engagementRate}%</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
                  <div className="mb-4 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Users size={16} />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Total Footfall
                    </span>
                  </div>
                  <div className="text-4xl font-black">{stats.footfall}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    +12% from last hour
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
                  <div className="mb-4 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <LinkIcon size={16} />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Job Links Clicked
                    </span>
                  </div>
                  <div className="text-4xl font-black">{stats.jobClicks}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    High engagement rate
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
                  <div className="mb-4 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <MessageSquare size={16} />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Chat Initiations
                    </span>
                  </div>
                  <div className="text-4xl font-black">{stats.chatInitiations}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    Live chat active
                  </div>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <Users size={18} className="text-indigo-500" />
                  Collected Leads ({leads.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearLeads}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                  <button
                    onClick={handleExportLeads}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <Download size={12} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-slate-900">
                {leads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase dark:bg-slate-950/50 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Lead Name</th>
                          <th className="px-6 py-4">Action Taken</th>
                          <th className="px-6 py-4">Contact / Email</th>
                          <th className="px-6 py-4 text-right">Time Captured</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {leads.map((lead, idx) => (
                          <tr
                            key={idx}
                            className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                          >
                            <td className="flex items-center gap-3 px-6 py-4 font-bold text-slate-900 dark:text-white">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                {lead.name.substring(0, 2).toUpperCase()}
                              </div>
                              {lead.name}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider uppercase ${
                                  lead.action.includes("Applied")
                                    ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400"
                                }`}
                              >
                                {lead.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                              {lead.contact}
                            </td>
                            <td className="px-6 py-4 text-right text-xs font-medium text-slate-400 dark:text-slate-500">
                              {lead.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <Users size={24} />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                      No leads captured yet
                    </h3>
                    <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                      When attendees visit your virtual booth and apply for jobs or initiate chats,
                      their information will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "customize" && (
          <div className="animate-fade-in max-w-3xl space-y-6 pb-12">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-black">
                <Layout size={18} className="text-indigo-500" />
                Booth Customization
              </h2>
              <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">
                Update your virtual exhibition booth details. Changes will reflect instantly for all
                attendees visiting the Virtual Venue.
              </p>
            </div>

            <form
              onSubmit={handleSaveSettings}
              className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-white/5 dark:bg-slate-900"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    <Info size={14} className="text-indigo-500" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.label}
                    onChange={(e) => setSettings({ ...settings, label: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    <Mail size={14} className="text-indigo-500" />
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.sponsorContact}
                    onChange={(e) => setSettings({ ...settings, sponsorContact: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  <LinkIcon size={14} className="text-indigo-500" />
                  Company Logo URL (Square Image Recommended)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-950">
                    {settings.sponsorLogo ? (
                      <img
                        src={settings.sponsorLogo}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={settings.sponsorLogo}
                    onChange={(e) => setSettings({ ...settings, sponsorLogo: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  <Briefcase size={14} className="text-indigo-500" />
                  Open Positions (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={settings.sponsorJobs}
                  onChange={(e) => setSettings({ ...settings, sponsorJobs: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"
                  placeholder="e.g. Frontend Engineer, Product Manager"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  <Layout size={14} className="text-indigo-500" />
                  Company Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={settings.sponsorDescription}
                  onChange={(e) => setSettings({ ...settings, sponsorDescription: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-white/5">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
