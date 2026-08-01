"use client";
import React, { useEffect, useState } from "react";
import "./ApplyJobModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface ResumeItem {
  id?: string;
  title: string;
  fileUrl: string;
  isPrimary?: boolean;
}

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    companyName?: string;
    location?: string;
  };
  onSuccess: () => void;
  onUpgradeRequired: (reason: string) => void;
}

export default function ApplyJobModal({
  isOpen,
  onClose,
  job,
  onSuccess,
  onUpgradeRequired,
}: ApplyJobModalProps) {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Inline upload state for empty slots
  const [uploadSlotIndex, setUploadSlotIndex] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // Fetch user profile to get resumes
    const fetchProfileResumes = async () => {
      setLoadingProfile(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/profiles/job-seeker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const profileData = json.data;
          let list: ResumeItem[] = [];

          if (Array.isArray(profileData?.resumes) && profileData.resumes.length > 0) {
            list = profileData.resumes.filter((r: any) => r.fileUrl);
          } else if (profileData?.resumeUrl) {
            list = [
              {
                id: "1",
                title: profileData.resumeTitle || "Primary Resume",
                fileUrl: profileData.resumeUrl,
                isPrimary: true,
              },
            ];
          }

          setResumes(list);

          // Find primary or select first
          const primaryIdx = list.findIndex((r) => r.isPrimary);
          setSelectedIndex(primaryIdx !== -1 ? primaryIdx : 0);
        }
      } catch (err) {
        console.error("Failed to load profile resumes:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileResumes();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Watch / Preview Resume in browser in a new tab
  const handleWatchInNewTab = (fileUrl: string) => {
    const fullUrl = fileUrl.startsWith("http")
      ? fileUrl
      : `${API_BASE}${fileUrl}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  // Handle Inline Upload of a New Resume directly from Apply Modal
  const handleSaveInlineUpload = async () => {
    if (!newFile) {
      setErrorMsg("Please select a resume file (PDF or DOC).");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const targetIndex = uploadSlotIndex !== null ? uploadSlotIndex : resumes.length;

      const formData = new FormData();
      formData.append(`resume_file_${targetIndex}`, newFile);
      formData.append(
        `resume_title_${targetIndex}`,
        newTitle || newFile.name.replace(/\.[^/.]+$/, "")
      );

      const updatedList = [...resumes];
      updatedList[targetIndex] = {
        id: String(Date.now()),
        title: newTitle || newFile.name.replace(/\.[^/.]+$/, ""),
        fileUrl: "",
        isPrimary: targetIndex === 0,
      };

      formData.append("resumes", JSON.stringify(updatedList.slice(0, 3)));

      const res = await fetch(`${API_BASE}/api/profiles/job-seeker`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to upload resume");
      }

      const json = await res.json();
      const updatedProfile = json.data;
      if (Array.isArray(updatedProfile?.resumes)) {
        const validResumes = updatedProfile.resumes.filter((r: any) => r.fileUrl);
        setResumes(validResumes);
        // Automatically select the newly uploaded resume by default
        const newSelIdx = validResumes.length - 1;
        setSelectedIndex(newSelIdx >= 0 ? newSelIdx : 0);
      }

      setUploadSlotIndex(null);
      setNewFile(null);
      setNewTitle("");
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle Discarding / Removing a resume
  const handleDiscardResume = async (idxToDiscard: number) => {
    if (!confirm("Are you sure you want to discard this resume?")) return;

    try {
      const token = localStorage.getItem("token");
      const updatedResumes = resumes.filter((_, idx) => idx !== idxToDiscard);

      const formData = new FormData();
      formData.append("resumes", JSON.stringify(updatedResumes));
      if (updatedResumes[0]?.fileUrl) {
        formData.append("resumeUrl", updatedResumes[0].fileUrl);
        formData.append("resumeTitle", updatedResumes[0].title);
      }

      await fetch(`${API_BASE}/api/profiles/job-seeker`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setResumes(updatedResumes);
      if (selectedIndex >= updatedResumes.length) {
        setSelectedIndex(Math.max(0, updatedResumes.length - 1));
      }
    } catch (err) {
      console.error("Failed to discard resume:", err);
    }
  };

  // Submit Job Application with Selected Resume
  const handleSubmitApplication = async () => {
    const selectedResume = resumes[selectedIndex];
    if (!selectedResume || !selectedResume.fileUrl) {
      setErrorMsg("Please select or upload a resume to submit your application.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeUrl: selectedResume.fileUrl,
          resumeTitle: selectedResume.title,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onSuccess();
        onClose();
      } else if (res.status === 403) {
        onClose();
        onUpgradeRequired(json.message || "Limit reached. Please upgrade plan.");
      } else {
        setErrorMsg(json.message || "Failed to submit application");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-modal-overlay" onClick={onClose}>
      <div
        className="apply-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
      >
        <button
          type="button"
          className="apply-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="apply-modal-header">
          <div className="apply-modal-badge">🚀 Submit Application</div>
          <h3 id="apply-modal-title" className="apply-modal-title">
            Apply to <span className="apply-job-accent">{job.title}</span>
          </h3>
          {job.companyName && (
            <p className="apply-modal-sub">
              🏢 {job.companyName} {job.location ? `• 📍 ${job.location}` : ""}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="apply-modal-error">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {errorMsg}
          </div>
        )}

        {/* Body — 3 Resumes Display */}
        <div className="apply-modal-body">
          <div className="apply-resumes-label-row">
            <span className="apply-resumes-heading">
              📑 Choose a Resume for Application ({resumes.length} / 3 Uploaded)
            </span>
          </div>

          {loadingProfile ? (
            <div className="apply-loading-box">
              <div className="spinner-border text-primary spinner-border-sm me-2" />
              Loading your uploaded resumes…
            </div>
          ) : (
            <div className="apply-resumes-grid">
              {resumes.map((resItem, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`apply-resume-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <div className="apply-card-top">
                      <label className="apply-radio-wrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="selectedResume"
                          checked={isSelected}
                          onChange={() => setSelectedIndex(idx)}
                        />
                        <span className="apply-radio-custom" />
                      </label>
                      <div className="apply-card-title-wrap">
                        <span className="apply-card-title text-truncate">
                          {resItem.title || `Resume ${idx + 1}`}
                        </span>
                        {resItem.isPrimary && (
                          <span className="apply-primary-pill">★ Primary</span>
                        )}
                      </div>
                    </div>

                    <div className="apply-card-file-info">
                      <i className="bi bi-file-earmark-pdf-fill apply-pdf-icon" />
                      <span className="apply-filename text-truncate">
                        {resItem.fileUrl ? resItem.fileUrl.split("/").pop() : "resume.pdf"}
                      </span>
                    </div>

                    {/* Actions: View in New Tab & Discard */}
                    <div className="apply-card-actions">
                      <button
                        type="button"
                        className="apply-btn-watch"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatchInNewTab(resItem.fileUrl);
                        }}
                        title="Open & watch resume in new tab"
                      >
                        <i className="bi bi-box-arrow-up-right me-1" /> Watch in New Tab
                      </button>

                      <button
                        type="button"
                        className="apply-btn-discard"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscardResume(idx);
                        }}
                        title="Discard this resume"
                      >
                        <i className="bi bi-trash" /> Discard
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Upload New Resume Slot (if < 3) */}
              {resumes.length < 3 && uploadSlotIndex === null && (
                <div
                  className="apply-resume-card add-slot"
                  onClick={() => setUploadSlotIndex(resumes.length)}
                >
                  <i className="bi bi-cloud-arrow-up fs-2 text-primary mb-2" />
                  <span className="fw-bold" style={{ fontSize: "0.9rem" }}>
                    + Upload New Resume
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Add resume {resumes.length + 1} of 3
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Inline Upload Form */}
          {uploadSlotIndex !== null && (
            <div className="apply-inline-upload-form">
              <h5 className="apply-inline-title">
                📤 Upload New Resume (Slot {uploadSlotIndex + 1} of 3)
              </h5>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="apply-form-label">Resume Title</label>
                  <input
                    type="text"
                    className="form-control form-control-sm apply-form-input"
                    placeholder="e.g. Lead Engineer Resume"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="apply-form-label">File (PDF/DOC)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="form-control form-control-sm apply-form-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setUploadSlotIndex(null);
                    setNewFile(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleSaveInlineUpload}
                  disabled={uploading || !newFile}
                >
                  {uploading ? "Uploading…" : "Save & Attach Resume"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="apply-modal-footer">
          <button
            type="button"
            className="apply-btn-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="apply-btn-submit"
            onClick={handleSubmitApplication}
            disabled={submitting || resumes.length === 0 || loadingProfile}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Submitting Application…
              </>
            ) : (
              <>
                <i className="bi bi-send-fill me-2" />
                Submit Application with Selected Resume
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
