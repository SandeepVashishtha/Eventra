import React, { useState } from "react";
import { AlertCircle, Key, Eye, EyeOff, ShieldAlert } from "lucide-react";
import "./password-expiry.css";

export default function PasswordExpiryNotification({
  isOpen = true,
  passwordAgeDays = 92,
  onClose,
  onUpdatePassword
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState("");

  if (!isOpen) return null;

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Simple strength calculations
    if (value.length < 6) setStrength("Weak");
    else if (/[A-Z]/.test(value) && /[0-9]/.test(value)) setStrength("Strong");
    else setStrength("Medium");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdatePassword) onUpdatePassword(password);
  };

  return (
    <div className="expiry-modal-overlay">
      <div className="expiry-modal-card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full text-slate-850 dark:text-white">
        <div className="flex items-center gap-2 text-red-500 mb-3">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <h3 className="text-base font-bold">Password Expired</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-normal">
          Your current password is **{passwordAgeDays} days** old. Security policy requires changing passwords every 90 days.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {password && (
            <div className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
              <span>Password Strength:</span>
              <span className={strength === "Strong" ? "text-emerald-500" : strength === "Medium" ? "text-amber-500" : "text-red-500"}>
                {strength}
              </span>
            </div>
          )}

          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650">
              Skip
            </button>
            <button type="submit" disabled={!password} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
