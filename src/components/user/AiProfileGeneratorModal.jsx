import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  FileText,
  Github,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Copy,
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
    setParsedData((prev) => ({ ...prev, [field]: value }));
  };

  const removeSkill = (skillToRemove) => {
    setParsedData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleApply = () => {
    onApplyProfile(parsedData);
    handleClose();
    toast.success("Profile fields populated! You can now review and save.");
  };

  const handleCopyBio = async () => {
    try {
      await navigator.clipboard.writeText(parsedData.bio || "");
      toast.success("Bio copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy bio");
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-white/5 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                AI Profile Auto-Fill
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract skills and bio instantly
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
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
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/5 dark:bg-slate-950">
                  <button
                    onClick={() => setInputMode("github")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      inputMode === "github"
                        ? "border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    <Github size={14} />
                    GitHub Profile
                  </button>
                  <button
                    onClick={() => setInputMode("resume")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      inputMode === "resume"
                        ? "border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-white"
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
                        <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          GitHub Profile URL
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"
                        />
                      </div>
                      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-900/10 dark:text-blue-300">
                        <Sparkles size={16} className="mt-0.5 shrink-0" />
                        <p className="text-xs leading-relaxed">
                          We will securely parse your public repositories, languages, and profile
                          bio to generate a detailed Eventra developer snapshot.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Upload Resume (PDF)
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                          resumeFile
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="application/pdf"
                          className="hidden"
                        />
                        <FileText
                          size={32}
                          className={
                            resumeFile
                              ? "mb-3 text-indigo-600 dark:text-indigo-400"
                              : "mb-3 text-slate-400"
                          }
                        />
                        <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">
                          {resumeFile ? resumeFile.name : "Click to browse or drag PDF here"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {resumeFile
                            ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB`
                            : "Maximum file size 5MB. PDF format only."}
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-500 dark:border-red-500/20 dark:bg-red-500/10">
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
                className="flex flex-col items-center justify-center space-y-6 py-16 text-center"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                  <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white">
                    Analyzing Profile Data
                  </h3>
                  <p className="mx-auto max-w-sm text-sm text-slate-500">
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
                <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="mb-1 text-sm font-bold">Extraction Successful!</p>
                    <p className="text-xs opacity-90">
                      Review and edit the extracted details below before applying them to your
                      profile. Nothing is saved permanently yet.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/5 dark:bg-slate-950/50">
                  {/* Bio */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Generated Bio Summary
                      </label>
                      <button
                        type="button"
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
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Detected Skills ({parsedData.skills?.length || 0})
                    </label>
                    <div className="flex min-h-[60px] flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
                      {parsedData.skills?.map((skill, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-lg border border-indigo-200/60 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-900/40 dark:text-indigo-300"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-indigo-400 transition-colors hover:text-indigo-800 dark:hover:text-indigo-200"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {(!parsedData.skills || parsedData.skills.length === 0) && (
                        <span className="py-1.5 text-xs text-slate-500">
                          No distinct skills identified.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={parsedData.github || ""}
                        onChange={(e) => handlePreviewChange("github", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Portfolio / Website
                      </label>
                      <input
                        type="url"
                        value={parsedData.portfolio || ""}
                        onChange={(e) => handlePreviewChange("portfolio", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-white/5 dark:bg-slate-950/50">
          {step === "preview" && (
            <button
              onClick={handleReset}
              className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Start Over
            </button>
          )}
          <button
            onClick={handleClose}
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>

          {step === "input" && (
            <button
              onClick={handleProcess}
              disabled={inputMode === "github" ? !githubUrl : !resumeFile}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Extract Details
              <ArrowRight size={14} />
            </button>
          )}

          {step === "preview" && (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-colors hover:bg-indigo-700"
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
