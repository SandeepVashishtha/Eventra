"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { registerUser } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      await registerUser({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-xl space-y-6">
        
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <Image
                src="/logo_transparent.png"
                alt="Eventra Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-zinc-900">Eventra</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Join thousands of developers hosting & competing on Eventra.
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-[#00b887] mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-zinc-900">Account Created!</h3>
            <p className="text-xs text-emerald-700">Redirecting to user dashboard...</p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 text-center text-xs text-zinc-500 border-t border-zinc-100">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-zinc-900 hover:text-[#00b887] transition-colors">
                Sign in
              </Link>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
