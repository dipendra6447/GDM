"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import '@/app/login/Login.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [resendNote, setResendNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage('');
    setDevResetUrl('');
    setResendNote('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message || 'If an account exists with that email, a password reset link has been sent.');
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
        if (data.resendNote) {
          setResendNote(data.resendNote);
        }
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glow-circle circle-1" />
      <div className="auth-glow-circle circle-2" />

      {/* Left Branding Side */}
      <div className="auth-split-left">
        <div className="auth-brand-text">
          <h1 className="auth-brand-title">
            Recover Access <br /> To Your Account.
          </h1>
          <p className="auth-brand-subtitle">
            Don't worry! Enter your registered email address and we'll send you a secure link to reset your password via Resend.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-split-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Forgot Password</h2>
            <p className="auth-form-subtitle">
              Enter your email address below to receive password reset instructions.
            </p>
          </div>

          {error && (
            <div className="auth-error-msg">
              <i className="bi bi-exclamation-triangle-fill me-2" /> {error}
            </div>
          )}

          {message ? (
            <div className="alert alert-success border-0 p-4 mb-4" style={{ borderRadius: '16px', background: 'rgba(20, 184, 122, 0.1)', color: '#14b87a' }}>
              <div className="d-flex align-items-start gap-3">
                <i className="bi bi-check-circle-fill fs-3 mt-1" />
                <div>
                  <h5 className="fw-bold mb-1">Check Your Inbox</h5>
                  <p className="mb-2" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {message}
                  </p>

                  {resendNote && (
                    <div className="small text-warning-emphasis mb-2 p-2 bg-warning-subtle rounded">
                      <i className="bi bi-info-circle me-1" /> <strong>Resend Note:</strong> {resendNote}
                    </div>
                  )}

                  {devResetUrl && (
                    <div className="mt-3 pt-3 border-top border-success-subtle">
                      <span className="d-block small text-secondary fw-semibold mb-2">Development Reset Shortcut:</span>
                      <a 
                        href={devResetUrl} 
                        className="btn btn-sm btn-success fw-bold text-white px-3 py-2"
                        style={{ borderRadius: '8px', fontSize: '0.82rem' }}
                      >
                        <i className="bi bi-box-arrow-up-right me-1" /> Click to Reset Password Now
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Sending Email...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="auth-switch-text mt-4">
            Remembered your password?{' '}
            <Link href="/login" className="auth-switch-link" style={{ textDecoration: 'none' }}>
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
