import React, { useState } from 'react';
import { authService } from '../../services/authService';
import './Auth.css'; // Keeps their existing styling intact

export default function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const credentials = {
      usernameOrEmail: emailOrUsername,
      password: password
    };

    try {
      // Calls the service utility we verified in authService.js
      await authService.login(credentials);
      
      // Redirects user to dashboard on successful authentication
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login to Eventra</h2>
        
        {error && <div className="error-banner" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <div className="form-group">
          <label>Username or Email</label>
          <input 
            type="text" 
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            disabled={loading}
            required 
            placeholder="Enter your username or email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required 
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  );
}