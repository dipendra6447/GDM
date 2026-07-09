"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import './RoleUpgradeModal.css';

interface RoleUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 1 | 2 | 3 | null;
}

const ROLE_CONTENT: Record<number, { title: string; desc: string; terms: string }> = {
  1: {
    title: 'Activate Job Seeker Account',
    desc: 'Ready to find your next great opportunity? Upgrade to a Job Seeker profile to discover jobs, upload your resume, and track applications seamlessly.',
    terms: 'I agree to the Job Seeker Terms & Conditions and Privacy Policy.'
  },
  2: {
    title: 'Activate Employer Account',
    desc: 'Start hiring top talent today. By upgrading to an Employer account, you can post jobs, manage candidates, and build your company brand.',
    terms: 'I agree to the Employer Terms & Conditions, Data Processing Agreement, and Privacy Policy.'
  },
  3: {
    title: 'Activate Business Promoter Account',
    desc: 'Boost your business visibility. Add a Business Promoter profile to launch ad campaigns and feature your business across our platform.',
    terms: 'I agree to the Business Advertising Terms, Payment Policy, and Privacy Policy.'
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function RoleUpgradeModal({ isOpen, onClose, targetRole }: RoleUpgradeModalProps) {
  const { refetch } = useAuth();
  const router = useRouter();
  
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !targetRole) return null;

  const content = ROLE_CONTENT[targetRole];

  const handleUpgrade = async () => {
    if (!agreed) return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/add-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roleId: targetRole })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add role');
      }

      // Success! Update auth state and redirect to the correct tab
      await refetch();
      onClose();
      // Use ?tab= to auto-open the newly added profile section
      router.push(`/profile?tab=${targetRole}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-modal-overlay">
      <div className="role-modal-content">
        <button className="role-modal-close" onClick={onClose} type="button">
          <i className="bi bi-x-lg" />
        </button>
        
        <div className="role-modal-header">
          <div className="role-modal-icon">
            <i className={`bi ${targetRole === 1 ? 'bi-person-badge' : targetRole === 2 ? 'bi-building' : 'bi-megaphone'}`} />
          </div>
          <h2>{content.title}</h2>
          <p>{content.desc}</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '10px' }}>
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>
        )}

        <div className="role-modal-terms">
          <label className="terms-checkbox-container">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="checkmark" />
            <span className="terms-text">{content.terms}</span>
          </label>
        </div>

        <div className="role-modal-actions">
          <button className="btn-role-cancel" onClick={onClose} disabled={loading} type="button">
            Cancel
          </button>
          <button 
            className="btn-role-confirm" 
            disabled={!agreed || loading}
            onClick={handleUpgrade}
            type="button"
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Activating...' : 'Agree and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
