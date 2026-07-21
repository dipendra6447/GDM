"use client";
import React, { useState } from "react";
import Link from "next/link";
import "./EmployerCandidateSearch.css";

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  experience: string;
  location: string;
  salary: string;
  skills: string[];
  category: string;
  verified: boolean;
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Alex Rivera",
    avatar: "AR",
    role: "Senior Full-Stack Engineer",
    experience: "7+ Years Exp",
    location: "Remote / San Francisco",
    salary: "$140,000 / yr",
    skills: ["React", "Node.js", "TypeScript", "GraphQL", "AWS"],
    category: "engineering",
    verified: true
  },
  {
    id: "2",
    name: "Sophia Chen",
    avatar: "SC",
    role: "Lead UI/UX Product Designer",
    experience: "6+ Years Exp",
    location: "New York, NY",
    salary: "$125,000 / yr",
    skills: ["Figma", "Design System", "User Research", "Prototyping"],
    category: "design",
    verified: true
  },
  {
    id: "3",
    name: "Marcus Vance",
    avatar: "MV",
    role: "DevOps & Cloud Architect",
    experience: "8+ Years Exp",
    location: "Remote / Austin, TX",
    salary: "$150,000 / yr",
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD"],
    category: "engineering",
    verified: true
  },
  {
    id: "4",
    name: "Elena Rostova",
    avatar: "ER",
    role: "Senior Data Scientist & AI Lead",
    experience: "5+ Years Exp",
    location: "Chicago, IL",
    salary: "$135,000 / yr",
    skills: ["Python", "PyTorch", "LLMs", "Pandas", "Scikit-Learn"],
    category: "data",
    verified: true
  },
  {
    id: "5",
    name: "David Kim",
    avatar: "DK",
    role: "Growth Product Manager",
    experience: "6+ Years Exp",
    location: "Seattle, WA",
    salary: "$130,000 / yr",
    skills: ["Product Strategy", "Agile", "SQL", "Mixpanel", "A/B Testing"],
    category: "product",
    verified: true
  },
  {
    id: "6",
    name: "Jessica Taylor",
    avatar: "JT",
    role: "Lead Frontend Developer",
    experience: "5+ Years Exp",
    location: "Remote / Boston",
    salary: "$120,000 / yr",
    skills: ["Next.js", "Vue.js", "Tailwind CSS", "Redux", "Jest"],
    category: "engineering",
    verified: true
  }
];

const EmployerCandidateSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});

  const filteredCandidates = activeTab === "all"
    ? mockCandidates
    : mockCandidates.filter(c => c.category === activeTab);

  const handleInvite = (id: string) => {
    setInvitedMap(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="emp-cand-section" id="candidates">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end emp-cand-header">
          <div>
            <span className="badge bg-primary-subtle text-primary px-3 py-2 fw-semibold mb-2" style={{ borderRadius: '50px' }}>
              🎯 TOP TALENT DATABASE
            </span>
            <h2 className="emp-cand-title">Discover Featured Candidates</h2>
            <p className="emp-cand-subtitle mb-0">Directly connect with top verified professionals looking for their next opportunity.</p>
          </div>
          <Link href="/dashboard?role=2&tab=candidates" className="btn btn-outline-primary fw-semibold px-4 py-2 mt-3 mt-md-0" style={{ borderRadius: '10px' }}>
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
        <div className="row g-4">
          {filteredCandidates.map((cand) => (
            <div className="col-lg-4 col-md-6" key={cand.id}>
              <div className="emp-cand-card">
                <div className="emp-cand-top-info">
                  <div className="emp-cand-avatar-lg">{cand.avatar}</div>
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
                  {cand.skills.map(skill => (
                    <span key={skill} className="emp-skill-tag">{skill}</span>
                  ))}
                </div>

                <div className="emp-cand-actions">
                  <button
                    className={`btn btn-sm ${invitedMap[cand.id] ? 'btn-success' : 'btn-primary'} fw-bold`}
                    onClick={() => handleInvite(cand.id)}
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                  >
                    {invitedMap[cand.id] ? (
                      <><i className="bi bi-check-lg me-1" /> Invited</>
                    ) : (
                      <><i className="bi bi-send me-1" /> Invite to Apply</>
                    )}
                  </button>
                  <Link
                    href={`/dashboard?role=2&tab=candidates&id=${cand.id}`}
                    className="btn btn-sm btn-outline-secondary fw-semibold"
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                  >
                    View Resume
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmployerCandidateSearch;
