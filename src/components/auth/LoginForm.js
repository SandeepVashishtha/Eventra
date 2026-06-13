import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Auth.css';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const credentials = {
      usernameOrEmail: emailOrUsername,
      password,
    };

    try {
      await authService.login(credentials);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="auth-form">

        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Sign in to continue your Eventra journey
        </p>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="login-email">Username or Email</label>
          <input
            id="login-email"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            disabled={loading}
            required
            placeholder="Enter your username or email"
            className="
              w-full
              px-4
              py-3.5
              rounded-2xl
              border
              border-slate-300/20
              bg-white/5
              backdrop-blur-sm
              focus:ring-2
              focus:ring-indigo-500/30
              focus:border-indigo-500
              transition-all
              duration-300
            "
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>

          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              placeholder="Enter your password"
              className="
                w-full
                px-4
                pr-12
                py-3.5
                rounded-2xl
                border
                border-slate-300/20
                bg-white/5
                backdrop-blur-sm
                focus:ring-2
                focus:ring-indigo-500/30
                focus:border-indigo-500
                transition-all
                duration-300
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right mt-2">
          <Link
            to="/password-reset"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-4
            mt-4
            rounded-2xl
            font-semibold
            text-white
            bg-gradient-to-r
            from-indigo-600
            via-purple-600
            to-pink-600
            hover:scale-[1.02]
            shadow-xl
            transition-all
            duration-300
          "
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <Link
            to="/signup"
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Create Account
          </Link>
        </p>

      </form>
    </div>
  );
}