/**
 * Refactoring LoginPage.js into tsx for type safety 
 */

import React, { useState, useCallback } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

type FormState = {
    email: string;
    password: string; 
};

type uiError = string | null; 

export default function LoginPage(){
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>({ email: "", password: "" });
    const [error, setError] = useState<uiError>("");
    const [loading, setLoading] = useState(false); 

    const handleChange = 
        useCallback(<K extends keyof FormState>(key: K) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => ({ ...prev, [key]: e.target.value }));
        }, []);
    
    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try { 
            navigate("/dashboard");
        } catch (error) {
            const msg = error instanceof Error ? error.message: "unexpected error"; 
            setError(msg); 
        } finally { 
            setLoading(false);
        }
    }, [navigate]);

    return ( 
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-gradient" />
                <div className="auth-pattern" />
            </div>

            <div className="auth-content">
                <div className="auth-card">
                    <h1 className="auth-logo">Simulation Platform</h1>
                    <p className="auth-tagline">Annotation for Design, Robotics, and 3D duties.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" aria-busy={loading}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="team@3d.com"
                        required
                        disabled={loading}
                        autoComplete="email"
                        inputMode="email"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange("password")}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        autoComplete="current-password"
                    />
                </div>

                {error && (
                    <div className="error-message" role="alert" aria-live="polite">
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
              <span>New to Sim?</span>
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
    )
}