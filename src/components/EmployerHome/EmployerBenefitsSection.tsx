"use client";
import React from "react";
import "./EmployerBenefitsSection.css";

const benefits = [
  {
    icon: "bi-rocket-takeoff-fill",
    title: "10X Faster Hiring Pipeline",
    desc: "Publish your job in under 2 minutes. Receive instant qualified applications from pre-screened talent in your area.",
    isGold: false,
  },
  {
    icon: "bi-cpu-fill",
    title: "AI Candidate Matchmaking",
    desc: "Our smart algorithm ranks applicants based on skill relevance, experience depth, and culture fit so you interview only top contenders.",
    isGold: true,
  },
  {
    icon: "bi-patch-check-fill",
    title: "Verified Candidate Resumes",
    desc: "Eliminate fake applications. Every candidate profile undergoes background credential verification before recommendation.",
    isGold: false,
  },
  {
    icon: "bi-bar-chart-line-fill",
    title: "Recruitment Analytics Dashboard",
    desc: "Track candidate conversion rates, job view stats, and team response metrics in real-time with enterprise dashboards.",
    isGold: false,
  },
  {
    icon: "bi-chat-dots-fill",
    title: "Direct Candidate Messaging",
    desc: "Chat directly with candidates, schedule interviews, and send job offers seamlessly without email back-and-forth.",
    isGold: true,
  },
  {
    icon: "bi-gift-fill",
    title: "3 Free Job Listings Included",
    desc: "Start hiring with zero risk. Every employer gets 3 free job posts to experience JobNest premium recruitment.",
    isGold: false,
  },
];

const EmployerBenefitsSection: React.FC = () => {
  return (
    <section className="emp-benefits-wrapper">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold mb-2" style={{ borderRadius: "50px" }}>
            ✨ WHY EMPLOYERS CHOOSE JOBNEST
          </span>
          <h2 className="fw-extrabold text-dark display-6 mb-2">Build Your High-Performing Team</h2>
          <p className="text-secondary lead fs-6">Everything you need to source, evaluate, and hire top talent in record time.</p>
        </div>

        <div className="row g-4">
          {benefits.map((b, idx) => (
            <div className="col-lg-4 col-md-6" key={idx}>
              <div className="emp-benefit-card">
                <div className={`emp-benefit-icon ${b.isGold ? "gold" : ""}`}>
                  <i className={`bi ${b.icon}`} />
                </div>
                <h3 className="emp-benefit-title">{b.title}</h3>
                <p className="emp-benefit-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmployerBenefitsSection;
