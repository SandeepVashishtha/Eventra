import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignupForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Minimal placeholder behavior to keep build stable
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full py-2 rounded bg-blue-600 text-white">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
      </p>
    </div>
  );
};

export default SignupForm;