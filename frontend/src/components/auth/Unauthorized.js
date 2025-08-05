import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page</p>
        </div>

        <div className="unauthorized-content">
          <div className="unauthorized-icon">
            🚫
          </div>
          <p className="unauthorized-message">
            This page requires special permissions that your account doesn't have. 
            Please contact an administrator if you believe this is an error.
          </p>
        </div>

        <div className="auth-footer">
          <Link to="/" className="btn-primary">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
