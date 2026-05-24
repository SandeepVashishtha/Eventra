import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(emailOrUsername, password);
      
      if (result?.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Sign in to manage your digital profile
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 dark:focus:ring-offset-slate-800 transition-colors"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;