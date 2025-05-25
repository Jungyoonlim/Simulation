/* eslint-disable no-undef */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    plan: 'free'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await auth.signUp(
        formData.email, 
        formData.password, 
        formData.organizationName
      );
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        analytics.trackEvent('user_signup', { 
          method: 'email',
          plan: formData.plan 
        });
        
        // Show success message
        alert('Success! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
            <p className="auth-tagline">Start your 14-day free trial</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Acme Robotics Inc."
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Work Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                minLength="8"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Select Your Plan</label>
              <div className="plan-selector">
                <div className="plan-option">
                  <input
                    type="radio"
                    id="plan-free"
                    name="plan"
                    value="free"
                    checked={formData.plan === 'free'}
                    onChange={handleChange}
                  />
                  <label htmlFor="plan-free" className="plan-label">
                    <span className="plan-name">Starter</span>
                    <span className="plan-price">Free forever</span>
                  </label>
                </div>
                <div className="plan-option">
                  <input
                    type="radio"
                    id="plan-pro"
                    name="plan"
                    value="pro"
                    checked={formData.plan === 'pro'}
                    onChange={handleChange}
                  />
                  <label htmlFor="plan-pro" className="plan-label">
                    <span className="plan-name">Pro</span>
                    <span className="plan-price">$49/seat/mo</span>
                  </label>
                </div>
              </div>
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
              {loading ? 'Creating account...' : 'Start Free Trial'}
            </button>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="auth-button secondary">
              Sign In
            </Link>
          </form>

          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">🚀</span>
              <span>No credit card required</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <span>SOC 2 compliant</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Unlimited annotations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 