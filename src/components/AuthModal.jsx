"use client";

import React, { useState } from "react";
import { X, Sparkles, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function AuthModal({ isOpen, mode: initialMode, onClose }) {
  if (!isOpen) return null;

  return (
    <AuthModalContent
      key={initialMode}
      initialMode={initialMode}
      onClose={onClose}
    />
  );
}

function AuthModalContent({ initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (!submitted) return;
    const closeTimer = setTimeout(onClose, 1500);
    return () => clearTimeout(closeTimer);
  }, [submitted, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">
              {mode === "signin" ? "Welcome back!" : "Account Created!"}
            </h3>
            <p className="text-sm text-zinc-500">
              {mode === "signin"
                ? "Signed in successfully. Redirecting..."
                : "Your Eventra account is ready. Redirecting..."}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                {mode === "signin" ? "Sign in to Eventra" : "Create your account"}
              </h2>
              <p className="text-xs text-zinc-500">
                {mode === "signin"
                  ? "Access your registered events, hackathons & projects"
                  : "Join thousands of developers hosting & competing on Eventra"}
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-zinc-900" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-400 font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-5 text-center text-xs text-zinc-500">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-bold text-zinc-900 hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="font-bold text-zinc-900 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
