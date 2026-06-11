import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  FileDown, 
  Image as ImageIcon, 
  User, 
  X,
  Shield,
  Zap,
  Award
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import toast from 'react-hot-toast';

// Predefined premium templates
const BADGE_TEMPLATES = {
  vip: {
    id: "vip",
    name: "VIP Neon",
    borderClass: "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]",
    bgGradient: "from-slate-950 via-slate-900 to-indigo-950",
    badgeLabel: "🏆 VIP Pass",
    badgeLabelClass: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    ringClass: "from-pink-500 to-indigo-500",
    glowClass: "bg-pink-500/10",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Mentor",
    borderClass: "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    bgGradient: "from-slate-950 via-zinc-900 to-emerald-950",
    badgeLabel: "🎓 Project Mentor",
    badgeLabelClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ringClass: "from-emerald-500 to-teal-500",
    glowClass: "bg-emerald-500/10",
  },
  cobalt: {
    id: "cobalt",
    name: "Cobalt Builder",
    borderClass: "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    bgGradient: "from-slate-950 via-slate-900 to-cyan-950",
    badgeLabel: "💻 Core Builder",
    badgeLabelClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    ringClass: "from-cyan-500 to-blue-500",
    glowClass: "bg-cyan-500/10",
  }
};

export default function EventBadgeGenerator({ onClose, userStats = {} }) {
  const { totalEvents = 0, currentStreak = 0, unlockedCount = 0 } = userStats;

  // Local state for customizations
  const [selectedTemplate, setSelectedTemplate] = useState("vip");
  const [avatar, setAvatar] = useState(null);
  const [attendeeName, setAttendeeName] = useState("Aditya Narayan");
  const [attendeeRole, setAttendeeRole] = useState("Open Source Developer");
  const [exporting, setExporting] = useState(false);

  const badgeRef = useRef(null);

  // Verification Checklist Items
  const checklist = [
    { id: "registered", text: "Registered for at least 1 Event", done: totalEvents >= 1, xp: 100 },
    { id: "streak", text: "Maintain active Event Streak", done: currentStreak >= 1, xp: 150 },
    { id: "badges", text: "Claimed a Milestone Token", done: unlockedCount >= 1, xp: 250 }
  ];
  const completedCount = checklist.filter(item => item.done).length;
  const isFullyVerified = completedCount === checklist.length;

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatar(uploadEvent.target.result);
        toast.success("Profile avatar uploaded successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger PNG download using html2canvas
  const downloadPNG = async () => {
    if (!badgeRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(badgeRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `eventra-badge-${attendeeName.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      toast.success("PNG Badge exported successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PNG image.");
    } finally {
      setExporting(false);
    }
  };

  // Trigger PDF download using html2canvas and jsPDF
  const downloadPDF = async () => {
    if (!badgeRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(badgeRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL("image/png");
      
      // A4 dimensions: 210 x 297 mm. Render badge in center.
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 90; // Badge width in mm
      const imgHeight = 135; // Badge height in mm
      const xOffset = (210 - imgWidth) / 2;
      const yOffset = (297 - imgHeight) / 2;

      pdf.setFillColor(15, 23, 42); // Dark slate background fill
      pdf.rect(0, 0, 210, 297, "F");

      // Add elegant borders on A4
      pdf.setDrawColor(99, 102, 241);
      pdf.setLineWidth(1.5);
      pdf.rect(10, 10, 190, 277);

      // Render badge
      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);

      // Certify text at bottom
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("OFFICIAL ATTENDEE EVENT CREDENTIAL", 105, 45, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184);
      pdf.text("This badge grants access to the Eventra Contribution Arena.", 105, 55, { align: "center" });
      
      pdf.save(`eventra-badge-${attendeeName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("PDF Pass generated and downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF document.");
    } finally {
      setExporting(false);
    }
  };

  const currentTemplate = BADGE_TEMPLATES[selectedTemplate];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* --- LEFT COLUMN: CONTROLS & CHECKLIST --- */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-black text-xs tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin-slow" />
                Badge Studio
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Generate Attendee Badge</h2>
              <p className="text-xs text-slate-400 mt-1">Design a certified visual pass demonstrating your achievements.</p>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Verification Checklist</span>
                <span className="text-xs font-black text-slate-400">{completedCount} / 3 Complete</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                  animate={{ width: `${(completedCount / 3) * 100}%` }}
                />
              </div>

              <div className="space-y-2 pt-1">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border border-slate-700 rounded-full shrink-0 flex items-center justify-center text-[8px] text-slate-500 font-bold" />
                    )}
                    <span className={item.done ? "text-slate-350" : "text-slate-500"}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customized Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Attendee Name</label>
                <input 
                  type="text" 
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Attendee Title / Role</label>
                <input 
                  type="text" 
                  value={attendeeRole}
                  onChange={(e) => setAttendeeRole(e.target.value)}
                  placeholder="Enter role (e.g. Developer)"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Upload Avatar */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Profile Image</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 border border-slate-800 bg-slate-950 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-350 cursor-pointer transition flex items-center gap-1.5 active:scale-[0.98]">
                    <ImageIcon size={14} />
                    <span>Upload Image</span>
                    <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  </label>
                  {avatar && (
                    <button 
                      onClick={() => setAvatar(null)}
                      className="text-xs text-rose-500 hover:text-rose-400 font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Theme Preset</label>
                <div className="flex gap-2">
                  {Object.values(BADGE_TEMPLATES).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wide transition cursor-pointer ${
                        selectedTemplate === t.id
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadPNG}
                disabled={exporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 text-xs font-bold text-slate-350 transition cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                <Download size={14} />
                <span>Export PNG</span>
              </button>
              
              <button
                onClick={downloadPDF}
                disabled={exporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-md shadow-indigo-500/10"
              >
                <FileDown size={14} />
                <span>Export Pass</span>
              </button>
            </div>
            {exporting && (
              <p className="text-[10px] text-center text-slate-550 animate-pulse font-medium">Generating digital pass document, please hold...</p>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: INTERACTIVE PREVIEW PASS --- */}
        <div className="flex items-center justify-center bg-slate-950/30 p-4 border border-slate-850 rounded-2xl relative overflow-hidden">
          {/* Neon Grid decoration background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

          {/* Badge element to snapshot */}
          <div 
            ref={badgeRef}
            className={`w-[260px] h-[400px] bg-gradient-to-b ${currentTemplate.bgGradient} border-2 ${currentTemplate.borderClass} rounded-3xl relative overflow-hidden flex flex-col justify-between items-center p-5 select-none`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {/* Template Ambient Glow Overlay */}
            <div className={`absolute -top-12 -left-12 w-28 h-28 ${currentTemplate.glowClass} rounded-full blur-2xl pointer-events-none`} />
            <div className={`absolute -bottom-12 -right-12 w-28 h-28 ${currentTemplate.glowClass} rounded-full blur-2xl pointer-events-none`} />

            {/* Pass Header */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 z-10">
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Eventra 2026</span>
              <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border ${currentTemplate.badgeLabelClass}`}>
                {currentTemplate.badgeLabel}
              </span>
            </div>

            {/* Avatar & Profile */}
            <div className="flex flex-col items-center space-y-3 z-10 mt-3">
              <div className="relative">
                {/* Aura border */}
                <span className={`absolute -inset-1 rounded-full bg-gradient-to-r ${currentTemplate.ringClass} blur-xs opacity-80 animate-pulse`} />
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <User className="w-8 h-8 text-slate-655" />
                  )}
                </div>
                {isFullyVerified && (
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center bg-emerald-500 border border-slate-950 rounded-full w-5 h-5 text-white shadow" title="Verified Attendee">
                    <Shield size={10} className="fill-white" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-0.5">
                <h4 className="text-sm font-black text-white leading-none tracking-tight">{attendeeName}</h4>
                <p className="text-[9px] text-slate-450 uppercase tracking-widest font-extrabold">{attendeeRole}</p>
              </div>
            </div>

            {/* Checklist Badges / Credentials metrics inside Badge */}
            <div className="w-full bg-slate-950/70 border border-slate-850 p-2.5 rounded-2xl flex justify-around text-center z-10">
              <div>
                <span className="text-[7px] font-black text-slate-400 uppercase block tracking-wider">Events</span>
                <span className="text-xs font-black text-indigo-400 mt-0.5 block flex items-center justify-center gap-0.5">
                  <Award size={10} />
                  {totalEvents}
                </span>
              </div>
              <div className="border-r border-slate-800" />
              <div>
                <span className="text-[7px] font-black text-slate-400 uppercase block tracking-wider">Streak</span>
                <span className="text-xs font-black text-pink-400 mt-0.5 block flex items-center justify-center gap-0.5">
                  <Zap size={10} />
                  {currentStreak}
                </span>
              </div>
              <div className="border-r border-slate-800" />
              <div>
                <span className="text-[7px] font-black text-slate-400 uppercase block tracking-wider">Tokens</span>
                <span className="text-xs font-black text-emerald-400 mt-0.5 block flex items-center justify-center gap-0.5">
                  <CheckCircle2 size={10} />
                  {unlockedCount}
                </span>
              </div>
            </div>

            {/* QR Code Verification Footer */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-white/5 z-10">
              <div className="text-left">
                <span className="text-[7px] font-black text-slate-550 uppercase tracking-wide block leading-none">Security Verification</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-1">Verified Member</span>
              </div>
              <div className="p-1 bg-white rounded-md shrink-0">
                <QRCode 
                  value={`https://eventra.dev/verify/attendee/${attendeeName.toLowerCase().replace(/\s+/g, "-")}`}
                  size={36} 
                  level="M" 
                  bgColor="#ffffff"
                  fgColor="#020617"
                />
              </div>
            </div>

            {/* Custom Background Decors inside Card */}
            <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
