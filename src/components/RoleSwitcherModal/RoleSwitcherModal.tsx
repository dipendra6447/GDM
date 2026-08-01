"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import RoleUpgradeModal from "../RoleUpgradeModal/RoleUpgradeModal";

export type UserRole = "jobseeker" | "employer" | "business";

interface RoleSwitcherModalProps {
  currentRole: UserRole;
  targetRole: UserRole;
  onConfirm: () => void;
  onCancel: () => void;
  isLight?: boolean;
}

const roleDetails: Record<UserRole, { icon: string; label: string; color: string; roleNum: 1 | 2 | 3 }> = {
  jobseeker: {
    icon: "👤",
    label: "Job Seeker",
    color: "#2454FF",
    roleNum: 1,
  },
  employer: {
    icon: "🏢",
    label: "Employer",
    color: "#2454FF",
    roleNum: 2,
  },
  business: {
    icon: "📣",
    label: "Business Promoter",
    color: "#D4AF37",
    roleNum: 3,
  },
};

const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  currentRole,
  targetRole,
  onConfirm,
  onCancel,
  isLight = false,
}) => {
  const { user, switchRole } = useAuth();
  const from = roleDetails[currentRole] || roleDetails.jobseeker;
  const to = roleDetails[targetRole] || roleDetails.employer;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasTargetRole = user?.roles?.includes(to.roleNum) ?? false;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  const handleConfirm = () => {
    if (hasTargetRole) {
      onConfirm();
      switchRole(to.roleNum);
    } else {
      setShowUpgradeModal(true);
    }
  };

  if (showUpgradeModal) {
    return (
      <RoleUpgradeModal
        isOpen={true}
        onClose={() => {
          setShowUpgradeModal(false);
          onCancel();
        }}
        targetRole={to.roleNum}
      />
    );
  }

  return (
    <div
      className={`role-restricted-overlay ${isLight ? "light-mode" : "dark-mode"}`}
      onClick={onCancel}
      id="role-switcher-modal"
    >
      <div
        className="role-restricted-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
      >
        <button
          className="role-restricted-close"
          onClick={onCancel}
          id="role-modal-close"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="role-restricted-icon-wrap">
          <div className="role-restricted-icon-circle">
            <span className="role-restricted-icon">{hasTargetRole ? "🔄" : "✨"}</span>
          </div>
        </div>

        <h3 className="role-restricted-title" id="role-modal-title">
          {hasTargetRole ? "Switch Active Role" : `Register as ${to.label}`}
        </h3>

        <div className="role-restricted-notice">
          <p className="role-restricted-main-text">
            {hasTargetRole ? (
              <>
                You are currently in the <span className="role-highlight current">{from.label}</span> mode.
              </>
            ) : (
              <>
                You are currently registered as a <span className="role-highlight current">{from.label}</span>.
              </>
            )}
          </p>
          <p className="role-restricted-sub-text">
            {hasTargetRole ? (
              <>
                Click below to switch your active role to <span className="role-highlight target">{to.label}</span> and view your dashboard/subscriptions for this role.
              </>
            ) : (
              <>
                To post jobs, access employer tools, or manage subscriptions for <span className="role-highlight target">{to.label}</span>, register yourself as a <span className="role-highlight target">{to.label}</span>.
              </>
            )}
          </p>
        </div>

        <div className="role-restricted-comparison">
          <div className="role-comp-card from">
            <span className="role-comp-badge">Current Role</span>
            <span className="role-comp-name">
              {from.icon} {from.label}
            </span>
          </div>

          <div className="role-comp-arrow">
            <i className="bi bi-arrow-right" />
          </div>

          <div className="role-comp-card to">
            <span className="role-comp-badge">{hasTargetRole ? "Target Role" : "New Role"}</span>
            <span className="role-comp-name">
              {to.icon} {to.label}
            </span>
          </div>
        </div>

        <div className="role-restricted-actions">
          <button
            className="role-btn-cancel-action"
            onClick={onCancel}
            id="role-modal-cancel"
          >
            Cancel
          </button>
          <button
            className="role-btn-switch-action"
            onClick={handleConfirm}
            id="role-modal-confirm"
          >
            {hasTargetRole ? `Switch to ${to.label}` : `Register as ${to.label}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcherModal;
