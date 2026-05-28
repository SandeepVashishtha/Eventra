import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getPublicErrorMessage, AUTH_ERRORS } from "../../utils/errorMessages";
import { showAuthToast } from "../../utils/toast";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import { validate as fieldValidators } from "../../validation";
import { useFormSubmit } from "../../hooks/useFormSubmit";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check throttle status
    if (isThrottled) {
      toast.error("Too many attempts. Please wait 30 seconds before trying again.");
      return;
    }
    
    // Validate form before submitting
    if (!validateLoginForm()) return;

    try {
      const ok = await login(formData.usernameOrEmail, formData.password);
      if (ok) {
        setLoginAttempts(0);
        showAuthToast("Login successful! Redirecting...", () =>
          navigate(redirectPath, { replace: true }),
        );
      }
    } catch (err) {
      const newCount = loginAttempts + 1;
      setLoginAttempts(newCount);
      
      if (newCount >= 5) {
        setIsThrottled(true);
        toast.warn("Too many failed attempts. Locked for 30 seconds.");
        setTimeout(() => {
          setIsThrottled(false);
          setLoginAttempts(0);
        }, 30000);
      }
      
      const errorMsg = getPublicErrorMessage(err, AUTH_ERRORS.loginFailed);
      setError({ general: errorMsg });
      toast.error(errorMsg);
      console.error("Login error:", err);
    }
    // Note: loading state is now handled by authRequest.loading from context
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Email or username</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 rounded bg-blue-600 text-white">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Don't have an account? <Link to="/signup" className="text-blue-600">Create one</Link>
      </p>
    </div>
  );
};

export default LoginForm;