"use client";
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/app/login/Login.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password. Link may have expired.');
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
            Set Your New <br /> Password.
          </h1>
          <p className="auth-brand-subtitle">
            Choose a strong password to protect your JobNest account and access your recruitment dashboard.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-split-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Reset Password</h2>
            <p className="auth-form-subtitle">
              Enter your new password below.
            </p>
          </div>

          {!token && (
            <div className="alert alert-warning border-0 p-3 mb-4" style={{ borderRadius: '12px' }}>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              Missing reset token in URL. Please click the full link in your email.
            </div>
          )}

          {error && (
            <div className="auth-error-msg">
              <i className="bi bi-exclamation-triangle-fill me-2" /> {error}
            </div>
          )}

          {success ? (
            <div className="alert alert-success border-0 p-4 mb-4 text-center" style={{ borderRadius: '16px', background: 'rgba(20, 184, 122, 0.1)', color: '#14b87a' }}>
              <i className="bi bi-check-circle-fill fs-1 mb-2 d-block" />
              <h5 className="fw-bold mb-2">Password Reset Successful!</h5>
              <p className="mb-3" style={{ fontSize: '0.9rem' }}>
                Your password has been updated. Redirecting to login page...
              </p>
              <Link href="/login" className="btn btn-sm btn-success fw-bold px-4 py-2" style={{ borderRadius: '8px' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="reset-password">New Password</label>
                <div className="auth-password-wrapper">
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="reset-confirm-password">Confirm New Password</label>
                <div className="auth-password-wrapper">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading || !token}>
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="auth-switch-text mt-4">
            <Link href="/login" className="auth-switch-link" style={{ textDecoration: 'none' }}>
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
