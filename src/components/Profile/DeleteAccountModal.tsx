"use client";
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ show, onClose }: Props) {
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleDelete = async () => {
    if (confirmText !== user?.email) return;
    setLoading(true);
    // Placeholder for actual delete API call
    setTimeout(() => {
      alert('Account deletion initiated. (Placeholder)');
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content profile-item-card border-danger" style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Delete Account
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p className="mb-3" style={{ color: 'var(--color-text-dark)' }}>
              This action is <strong>irreversible</strong>. This will permanently delete your account, 
              including all your profiles (Job Seeker, Employer, Business Promoter) and associated data.
            </p>
            <p style={{ color: 'var(--color-text-gray)', fontSize: '0.9rem' }}>
              Please type your email address (<strong>{user?.email}</strong>) to confirm.
            </p>
            <input 
              type="email" 
              className="profile-input mb-3" 
              placeholder={user?.email} 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <div className="modal-footer border-top-0 pt-0">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              type="button" 
              className="btn btn-danger" 
              disabled={confirmText !== user?.email || loading}
              onClick={handleDelete}
            >
              {loading ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
