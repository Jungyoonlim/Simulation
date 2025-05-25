/* eslint-disable no-undef */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Dummy login simulation - auth functionality removed
    console.log('Dummy login: auth functionality removed.');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient" />
        <div className="auth-pattern" />
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">🤖 RoboMap Validator</h1>
            <p className="auth-tagline">Professional SLAM Mesh Annotation for Robotics Teams</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@robotics-startup.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-divider">
              <span>New to RoboMap?</span>
            </div>

            <Link to="/signup" className="auth-button secondary">
              Create Free Account
            </Link>
            <button type="button" className="auth-button secondary" onClick={() => navigate('/dashboard')}>
              Skip Login (Bypass Validation)
            </button>
          </form>

          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>AI-powered auto-snap</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👥</span>
              <span>Real-time collaboration</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Enterprise security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 