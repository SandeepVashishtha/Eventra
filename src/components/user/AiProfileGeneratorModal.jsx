import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, FileText, Github, Loader2,
  CheckCircle2, AlertTriangle, ArrowRight, User, Copy
} from "lucide-react";
import { parseGithubProfile, parseResumePDF } from "../../utils/aiProfileParser";
import { toast } from "react-toastify";

const AiProfileGeneratorModal = ({ isOpen, onClose, onApplyProfile }) => {
  const [step, setStep] = useState("input"); // "input" | "processing" | "preview"
  const [inputMode, setInputMode] = useState("github"); // "github" | "resume"
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep("input");
    setGithubUrl("");
    setResumeFile(null);
    setParsedData(null);
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setError("");
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleProcess = async () => {
    setError("");
    setStep("processing");

    try {
      let data = null;
      if (inputMode === "github") {
        if (!githubUrl) throw new Error("Please enter a GitHub URL.");
        data = await parseGithubProfile(githubUrl);
      } else {
        if (!resumeFile) throw new Error("Please upload a resume PDF.");
        data = await parseResumePDF(resumeFile);
      }
      
      setParsedData(data);
      setStep("preview");
    } catch (err) {
      setError(err.message || "An error occurred during extraction.");
      setStep("input");
      toast.error(err.message || "Failed to extract profile.");
    }
  };

  const handlePreviewChange = (field, value) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  const removeSkill = (skillToRemove) => {
    setParsedData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleApply = () => {
    onApplyProfile(parsedData);
    handleClose();
    toast.success("Profile fields populated! You can now review and save.");
  };

  const handleCopyBio = async () => {
    console.log("BIO VALUE:", parsedData.bio);
  try {
    await navigator.clipboard.writeText(parsedData.bio || "");
    toast.success("Bio copied to clipboard!");
  } catch (err) {
    toast.error("Failed to copy bio");
  }
};

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">AI Profile Auto-Fill</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extract skills and bio instantly</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: INPUT */}
            {step === "input" && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Input Type Selector */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5">
                  <button
                    onClick={() => setInputMode("github")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      inputMode === "github" 
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" 
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    <Github size={14} />
                    GitHub Profile
                  </button>
                  <button
                    onClick={() => setInputMode("resume")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      inputMode === "resume" 
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" 
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    <FileText size={14} />
                    Resume PDF
                  </button>
                </div>

                {/* Input Fields */}
                <div className="pt-4">
                  {inputMode === "github" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">GitHub Profile URL</label>
                        <input 
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                        <Sparkles size={16} className="shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed">
                          We will securely parse your public repositories, languages, and profile bio to generate a detailed Eventra developer snapshot.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Upload Resume (PDF)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                          resumeFile 
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                            : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange}
                          accept="application/pdf" 
                          className="hidden" 
                        />
                        <FileText size={32} className={resumeFile ? "text-indigo-600 dark:text-indigo-400 mb-3" : "text-slate-400 mb-3"} />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          {resumeFile ? resumeFile.name : "Click to browse or drag PDF here"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : "Maximum file size 5MB. PDF format only."}
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
                      <AlertTriangle size={14} />
                      {error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROCESSING */}
            {step === "processing" && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Analyzing Profile Data</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    {inputMode === "github" 
                      ? "Fetching repositories, calculating primary languages, and structuring your developer bio..."
                      : "Extracting text, identifying technical skills, and summarizing your experience..."}
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PREVIEW & EDIT */}
            {step === "preview" && parsedData && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex gap-3 text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1 text-sm">Extraction Successful!</p>
                    <p className="text-xs opacity-90">Review and edit the extracted details below before applying them to your profile. Nothing is saved permanently yet.</p>
                  </div>
                </div>

                <div className="space-y-5 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                  {/* Bio */}
                  <div>
                    <div className = "flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Generated Bio Summary 
                      </label>
                      <button
                      type = "button"
                      onClick={handleCopyBio}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      <Copy size={12} />
                    </button>
                    </div>
                    
                    <textarea 
                      value={parsedData.bio || ""}
                      onChange={(e) => handlePreviewChange("bio", e.target.value)}
                      rows={3}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Detected Skills ({parsedData.skills?.length || 0})
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl min-h-[60px]">
                      {parsedData.skills?.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30 rounded-lg text-xs font-bold">
                          <span>{skill}</span>
                          <button 
                            onClick={() => removeSkill(skill)}
                            className="text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 ml-1 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {(!parsedData.skills || parsedData.skills.length === 0) && (
                        <span className="text-xs text-slate-500 py-1.5">No distinct skills identified.</span>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">GitHub URL</label>
                      <input 
                        type="url"
                        value={parsedData.github || ""}
                        onChange={(e) => handlePreviewChange("github", e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Portfolio / Website</label>
                      <input 
                        type="url"
                        value={parsedData.portfolio || ""}
                        onChange={(e) => handlePreviewChange("portfolio", e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3">
          {step === "preview" && (
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              Start Over
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          
          {step === "input" && (
            <button
              onClick={handleProcess}
              disabled={inputMode === "github" ? !githubUrl : !resumeFile}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Extract Details
              <ArrowRight size={14} />
            </button>
          )}

          {step === "preview" && (
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              Apply to Profile
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default AiProfileGeneratorModal;
