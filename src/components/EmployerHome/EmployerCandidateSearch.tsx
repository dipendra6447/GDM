"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import "./EmployerCandidateSearch.css";

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string | null;
  role: string;
  experience: string;
  location: string;
  salary: string;
  skills: string[];
  category: string;
  verified: boolean;
  resumeUrl?: string | null;
}

interface ToastState {
  text: string;
  type: 'success' | 'warning' | 'info';
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache validity

const EmployerCandidateSearch: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  // Client-side SWR Cache Map (category -> { data, timestamp })
  const cacheRef = useRef<Map<string, { data: Candidate[]; timestamp: number }>>(new Map());

  const fetchCandidates = useCallback(async (cat: string) => {
    const cachedEntry = cacheRef.current.get(cat);
    const now = Date.now();

    // 1. If cache exists, serve cached data instantly (Zero loading delay)
    if (cachedEntry) {
      setCandidates(cachedEntry.data);
      setLoading(false);

      // If cache is still fresh, skip background refetch
      if (now - cachedEntry.timestamp < CACHE_TTL_MS) {
        return;
      }
    } else {
      // 2. Only show loading skeleton on first fetch for this tab
      setLoading(true);
    }

    // 3. Stale-While-Revalidate: Background fetch to revalidate cache safely
    try {
      const res = await fetch(`/api/candidates?category=${encodeURIComponent(cat)}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        cacheRef.current.set(cat, { data: data.data, timestamp: now });
        setCandidates(data.data);
      }
    } catch (err) {
      console.warn("Candidate fetch notification:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates(activeTab);
  }, [activeTab, fetchCandidates]);

  const handleInvite = async (candidate: Candidate) => {
    // Optimistic UI update
    setInvitedMap((prev) => ({ ...prev, [candidate.id]: true }));
    setToast({ text: `Invitation sent to ${candidate.name}!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);

    try {
      await fetch('/api/candidates/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
        }),
      });
    } catch (error) {
      console.warn("Invitation network call notice:", error);
    }
  };

  const handleViewResume = (cand: Candidate) => {
    if (cand.resumeUrl) {
      // Direct download / open in new tab
      window.open(cand.resumeUrl, '_blank');
    } else {
      // Show toaster alert if resume is not available
      setToast({ text: `Resume is not available for ${cand.name}.`, type: 'warning' });
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <section className="emp-cand-section" id="candidates">
      <div className="container">
        {toast && (
          <div
            className={`alert ${
              toast.type === 'warning' ? 'alert-warning' : toast.type === 'success' ? 'alert-success' : 'alert-info'
            } alert-dismissible fade show position-fixed bottom-0 end-0 m-4 z-3 shadow-lg`}
            style={{ borderRadius: '12px', minWidth: '280px' }}
          >
            <i className={`bi ${toast.type === 'warning' ? 'bi-exclamation-triangle-fill text-warning' : 'bi-check-circle-fill text-success'} me-2`} />
            <strong>{toast.type === 'warning' ? 'Notice:' : 'Success!'}</strong> {toast.text}
            <button type="button" className="btn-close" onClick={() => setToast(null)} />
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-between align-items-end emp-cand-header">
          <div>
            <span className="badge bg-primary-subtle text-primary px-3 py-2 fw-semibold mb-2" style={{ borderRadius: '50px' }}>
              🎯 TOP TALENT DATABASE
            </span>
            <h2 className="emp-cand-title">Discover Featured Candidates</h2>
            <p className="emp-cand-subtitle mb-0">Directly connect with top verified professionals looking for their next opportunity.</p>
          </div>
          <Link href="/dashboard?tab=candidates" className="btn btn-outline-primary fw-semibold px-4 py-2 mt-3 mt-md-0" style={{ borderRadius: '10px' }}>
            View All 10,000+ Resumes <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="emp-cand-filter-pills">
          <button className={`emp-cand-pill ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All Candidates
          </button>
          <button className={`emp-cand-pill ${activeTab === 'engineering' ? 'active' : ''}`} onClick={() => setActiveTab('engineering')}>
            Software Engineering
          </button>
          <button className={`emp-cand-pill ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>
            UI/UX Design
          </button>
          <button className={`emp-cand-pill ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}>
            Product Management
          </button>
          <button className={`emp-cand-pill ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
            Data & AI
          </button>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div className="col-lg-4 col-md-6" key={idx}>
                <div className="emp-cand-card placeholder-glow p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="placeholder rounded-circle" style={{ width: '50px', height: '50px' }} />
                    <div className="flex-grow-1">
                      <span className="placeholder col-7 mb-2 d-block" />
                      <span className="placeholder col-4 d-block" />
                    </div>
                  </div>
                  <span className="placeholder col-10 mb-3 d-block" />
                  <div className="d-flex gap-2 mb-3">
                    <span className="placeholder col-3 py-2 rounded-pill" />
                    <span className="placeholder col-3 py-2 rounded-pill" />
                    <span className="placeholder col-3 py-2 rounded-pill" />
                  </div>
                  <div className="d-flex gap-2">
                    <span className="placeholder col-6 py-3 rounded" />
                    <span className="placeholder col-6 py-3 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-person-exclamation text-muted display-4 mb-3 d-block" />
            <h5 className="fw-bold">No candidates found in this category</h5>
            <p className="text-muted">Try selecting another category or resetting filters.</p>
            <button className="btn btn-primary btn-sm px-3" onClick={() => setActiveTab('all')}>
              Show All Candidates
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {candidates.map((cand) => (
              <div className="col-lg-4 col-md-6" key={cand.id}>
                <div className="emp-cand-card">
                  <div className="emp-cand-top-info">
                    {cand.avatarUrl ? (
                      <img src={cand.avatarUrl} alt={cand.name} className="emp-cand-avatar-lg object-fit-cover" />
                    ) : (
                      <div className="emp-cand-avatar-lg">{cand.avatar}</div>
                    )}
                    <div className="min-w-0 flex-grow-1">
                      <div className="d-flex align-items-center gap-1">
                        <h4 className="emp-cand-name text-truncate">{cand.name}</h4>
                        {cand.verified && <i className="bi bi-patch-check-fill text-primary" title="Verified Candidate" />}
                      </div>
                      <p className="emp-cand-role text-truncate">{cand.role}</p>
                    </div>
                  </div>

                  <div className="emp-cand-meta">
                    <span><i className="bi bi-briefcase me-1" />{cand.experience}</span>
                    <span><i className="bi bi-geo-alt me-1" />{cand.location}</span>
                  </div>

                  <div className="emp-cand-skills">
                    {cand.skills.map((skill) => (
                      <span key={skill} className="emp-skill-tag">{skill}</span>
                    ))}
                  </div>

                  <div className="emp-cand-actions">
                    <button
                      className={`btn btn-sm ${invitedMap[cand.id] ? 'btn-success' : 'btn-primary'} fw-bold`}
                      onClick={() => handleInvite(cand)}
                      style={{ borderRadius: '8px', padding: '8px 12px' }}
                    >
                      {invitedMap[cand.id] ? (
                        <><i className="bi bi-check-lg me-1" /> Invited</>
                      ) : (
                        <><i className="bi bi-send me-1" /> Invite to Apply</>
                      )}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary fw-semibold"
                      onClick={() => handleViewResume(cand)}
                      style={{ borderRadius: '8px', padding: '8px 12px' }}
                    >
                      View Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EmployerCandidateSearch;
