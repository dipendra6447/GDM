"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileSettings() {
  const { user, refetch } = useAuth();
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      const succ = params.get('success');
      if (err === 'google_already_linked') {
        setMessage({ text: 'This Google account is already linked to another user.', type: 'error' });
      } else if (err === 'oauth_failed') {
        setMessage({ text: 'Failed to connect Google account. Please try again.', type: 'error' });
      } else if (succ === 'google_connected') {
        setMessage({ text: 'Google account connected successfully!', type: 'success' });
      }
      
      // Clean query params from URL
      if (err || succ) {
        const newUrl = window.location.pathname + '?tab=settings';
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password reset functionality would go here.");
  };

  const handleGoogleConnect = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google account?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Google account disconnected successfully.', type: 'success' });
        if (refetch) await refetch();
      } else {
        setMessage({ text: data.message || 'Failed to disconnect Google account.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred.', type: 'error' });
    }
  };

  return (
    <div id="settings" className="profile-settings-panel">
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success bg-transparent border-success text-success' : 'alert-danger bg-transparent border-danger text-danger'} mb-4 p-3`} style={{ fontSize: '0.85rem' }}>
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle-fill'} me-2`} />
          {message.text}
        </div>
      )}
      
      {/* Security & Password */}
      <div className="profile-section-divider">
        <span className="profile-section-divider-label">Security</span>
        <div className="profile-section-divider-line" />
      </div>

      <div className="profile-item-card mb-4">
        <div className="profile-item-card-header mb-3">
          <h5 className="profile-item-card-title mb-0" style={{ color: 'var(--color-navy)' }}>Change Password</h5>
        </div>
        {!user?.googleId ? (
          <form onSubmit={handlePasswordReset}>
            <div className="row">
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Current Password</label>
                <input type="password" name="currentPassword" className="profile-input" placeholder="••••••••" />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">New Password</label>
                <input type="password" name="newPassword" className="profile-input" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="btn btn-sm btn-outline-primary mt-2">
              Update Password
            </button>
          </form>
        ) : (
          <div className="alert alert-info bg-transparent border-info text-info mb-0 p-3" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-info-circle me-2"></i>
            You signed in using a connected Google account. Password management is handled by your provider.
          </div>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="profile-section-divider">
        <span className="profile-section-divider-label">Connected Accounts</span>
        <div className="profile-section-divider-line" />
      </div>

      <div className="profile-item-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.65-.15-3.22-.42-4.75H24v9h12.75c-.55 2.94-2.22 5.44-4.72 7.12l7.31 5.67C43.6 36.87 46.5 31.02 46.5 24z"/>
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                <path fill="#34A853" d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.28-5.65c-2.25 1.55-5.15 2.46-8.61 2.46z"/>
              </svg>
            </div>
            <div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem', color: 'var(--color-navy)' }}>Google</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-gray)' }}>
                {user?.googleId ? 'Connected' : 'Not connected'}
              </div>
            </div>
          </div>
          <button 
            type="button"
            className={`btn btn-sm ${user?.googleId ? 'btn-outline-danger' : 'btn-outline-primary'}`}
            onClick={user?.googleId ? handleGoogleDisconnect : handleGoogleConnect}
          >
            {user?.googleId ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

    </div>
  );
}
