"use client";
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileSettings() {
  const { user } = useAuth();

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password reset functionality would go here.");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion flow would trigger here.");
    }
  };

  return (
    <div id="settings" className="profile-settings-panel">
      
      {/* Security & Password */}
      <div className="profile-section-divider">
        <span className="profile-section-divider-label">Security</span>
        <div className="profile-section-divider-line" />
      </div>

      <div className="profile-item-card mb-4">
        <div className="profile-item-card-header mb-3">
          <h5 className="profile-item-card-title text-white mb-0">Change Password</h5>
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
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="20" />
            </div>
            <div>
              <div className="text-white fw-semibold" style={{ fontSize: '0.9rem' }}>Google</div>
              <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                {user?.googleId ? 'Connected' : 'Not connected'}
              </div>
            </div>
          </div>
          <button className={`btn btn-sm ${user?.googleId ? 'btn-outline-danger' : 'btn-outline-primary'}`}>
            {user?.googleId ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="profile-section-divider">
        <span className="profile-section-divider-label text-danger">Danger Zone</span>
        <div className="profile-section-divider-line" style={{ background: 'rgba(239, 68, 68, 0.2)' }} />
      </div>

      <div className="profile-item-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-white fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>Delete Account</div>
            <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
              Permanently remove your account and all associated data. This action is irreversible.
            </div>
          </div>
          <button type="button" className="btn btn-sm btn-danger" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}
