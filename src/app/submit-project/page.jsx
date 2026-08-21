"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FolderKanban, 
  Code2, 
  Globe, 
  Image as ImageIcon, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock
} from "lucide-react";
import { createProject } from "@/lib/api";

function getAuthSnapshot() {
  try {
    return Boolean(
      localStorage.getItem("eventra_token") ||
      localStorage.getItem("eventra_user")
    );
  } catch {
    return false;
  }
}

function getServerAuthSnapshot() {
  return null;
}

function subscribeToAuth(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export default function SubmitProjectPage() {
  const router = useRouter();

  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Developer Tools",
    githubUrl: "",
    demoUrl: "",
    thumbnailUrl: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Please fill in both title and description.");
      return;
    }

    // Guard against duplicate submissions during redirect delay
    if (submitting) return;
    setSubmitting(true);

    let redirectTimer = null;

    try {
      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        githubUrl: formData.githubUrl.trim(),
        demoUrl: formData.demoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop"
      });

      setSuccessMessage("Project submitted successfully! Redirecting to projects gallery...");
      redirectTimer = setTimeout(() => {
        router.push("/projects");
      }, 1500);
    } catch (err) {
      // Only fall back to localStorage for network/server errors (status >= 500 or no response)
      // Do not silently save on 4xx validation errors from the server
      const isNetworkError = !err?.status || err?.status >= 500;
      if (isNetworkError && typeof window !== "undefined") {
        try {
          const storedProjects = JSON.parse(localStorage.getItem("eventra_custom_projects") || "[]");
          const newProj = {
            id: Date.now(),
            ...formData,
            upvotes: 0,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem("eventra_custom_projects", JSON.stringify([newProj, ...storedProjects]));
          setSuccessMessage("Project saved locally! Redirecting...");
          redirectTimer = setTimeout(() => {
            router.push("/projects");
          }, 1500);
        } catch (localErr) {
          setErrorMessage("Failed to submit project. Please check your connection and try again.");
        }
      } else {
        setErrorMessage(err?.message || "Failed to submit project. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  };

  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-20 text-center">
        <div className="text-sm font-semibold text-zinc-500">Verifying session...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#00b887]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900">Authentication Required</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Please sign in to your Eventra account before submitting an open-source project.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Sign In to Continue
            </Link>
            <Link
              href="/projects"
              className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors"
            >
              Back to Projects Gallery
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Gallery</span>
        </Link>

        {/* Card Form Container */}
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-sm space-y-6">
          
          <div className="space-y-2 border-b border-zinc-100 pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#00b887]" />
              <span>Showcase Community Project</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Submit Your Open Source Project
            </h1>
            <p className="text-xs text-zinc-500">
              Share your hackathon project, developer CLI, autonomous AI pipeline, or web application with the Eventra community.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
            <div>
              <label htmlFor="project-title" className="block mb-1.5 text-zinc-700">Project Title *</label>
              <input
                id="project-title"
                type="text"
                name="title"
                required
                placeholder="e.g. Eventra Developer CLI"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="project-description" className="block mb-1.5 text-zinc-700">Description *</label>
              <textarea
                id="project-description"
                name="description"
                required
                rows={4}
                placeholder="Briefly describe what your project builds, what problem it solves, and the technologies used..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-category" className="block mb-1.5 text-zinc-700">Category *</label>
                <select
                  id="project-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-800 cursor-pointer"
                >
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Autonomous Agents">AI & Autonomous Agents</option>
                  <option value="Cloud Native">Cloud Native</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>

              <div>
                <label htmlFor="project-github-url" className="block mb-1.5 text-zinc-700 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>GitHub Repository URL</span>
                </label>
                <input
                  id="project-github-url"
                  type="url"
                  name="githubUrl"
                  placeholder="https://github.com/username/repository"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-demo-url" className="block mb-1.5 text-zinc-700 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Live Demo URL</span>
                </label>
                <input
                  id="project-demo-url"
                  type="url"
                  name="demoUrl"
                  placeholder="https://my-demo-app.vercel.app"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400"
                />
              </div>

              <div>
                <label htmlFor="project-thumbnail-url" className="block mb-1.5 text-zinc-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Cover / Thumbnail Image URL</span>
                </label>
                <input
                  id="project-thumbnail-url"
                  type="url"
                  name="thumbnailUrl"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                  className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Publishing Project..." : "Publish Project"}</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </main>
  );
}
