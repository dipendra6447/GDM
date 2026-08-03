"use client";
import React, { useState, useEffect, useRef } from 'react';
import './OtpVerificationModal.css';

interface OtpVerificationModalProps {
  isOpen: boolean;
  type: 'email' | 'phone';
  identifier: string; // email address or phone number
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  type,
  identifier,
  userId,
  onClose,
  onSuccess,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendNote, setResendNote] = useState('');
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(''));
      setError('');
      setResendNote('');
      setTimer(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          identifier,
          otpCode: fullOtp,
          userId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Invalid or expired code. Please try again.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    setResendNote('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, identifier, userId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTimer(60);
        if (data.resendNote) {
          setResendNote(data.resendNote);
        }
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError('Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="otp-modal-container">
        <button className="otp-modal-close" onClick={onClose} aria-label="Close modal">
          <i className="bi bi-x-lg" />
        </button>

        <div className="otp-modal-header text-center">
          <div className="otp-icon-badge">
            <i className={`bi ${type === 'email' ? 'bi-envelope-check' : 'bi-phone'}`} />
          </div>
          <h3 className="otp-modal-title">Verify Your {type === 'email' ? 'Email' : 'Phone'}</h3>
          <p className="otp-modal-subtitle">
            We sent a 6-digit code to{' '}
            <strong className="text-navy">{identifier}</strong>
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3 text-center style-alert" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-1" /> {error}
          </div>
        )}

        {resendNote && (
          <div className="alert alert-info py-2 px-3 mb-3 text-center style-alert" role="alert">
            <i className="bi bi-info-circle-fill me-1" /> {resendNote}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="otp-inputs-grid mb-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="otp-digit-input"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 rounded-pill fw-bold mb-3 otp-submit-btn"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            ) : (
              <i className="bi bi-check-circle-fill me-2" />
            )}
            Verify & Continue
          </button>
        </form>

        <div className="otp-modal-footer text-center">
          <p className="resend-text text-muted mb-0">
            Didn't receive the code?{' '}
            {timer > 0 ? (
              <span className="fw-semibold text-primary">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
