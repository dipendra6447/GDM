"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import '@/styles/contact.css';

interface ServiceOption {
  id: string;
  title: string;
  icon: string;
  estDuration: string;
  defaultBudget: string;
  description: string;
  categoryBadge: string;
}

const SERVICES: ServiceOption[] = [
  {
    id: 'web-development',
    title: 'Custom Website Design & Development',
    icon: 'bi-code-slash',
    estDuration: 'Est. 2-3 Weeks',
    defaultBudget: '$1,500 - $5,000',
    description: 'High-performance, responsive websites with modern design & robust backends.',
    categoryBadge: 'Web Dev',
  },
  {
    id: 'app-development',
    title: 'Native & Mobile Applications',
    icon: 'bi-phone',
    estDuration: 'Est. 4-6 Weeks',
    defaultBudget: '$5,000+',
    description: 'iOS & Android mobile apps built with React Native or Flutter for seamless UX.',
    categoryBadge: 'App Dev',
  },
  {
    id: 'seo-marketing',
    title: 'SEO Optimization & Technical Audit',
    icon: 'bi-graph-up-arrow',
    estDuration: 'Est. 1-2 Weeks',
    defaultBudget: '$500 - $1,500',
    description: 'Drive organic search rankings, site speed enhancements & conversion audits.',
    categoryBadge: 'SEO & Audit',
  },
  {
    id: 'enterprise-sales',
    title: 'Enterprise Recruitment & Subscription',
    icon: 'bi-building-gear',
    estDuration: 'Immediate',
    defaultBudget: 'Custom Enterprise',
    description: 'Tailored bulk hiring packages, custom candidate pipelines & dedicated account manager.',
    categoryBadge: 'Enterprise',
  },
  {
    id: 'business-promotion',
    title: 'Business Promotion & Ads Placement',
    icon: 'bi-megaphone',
    estDuration: '1-2 Days',
    defaultBudget: '$500 - $1,500',
    description: 'Featured directory placements, homepage hero spotlight & lead generation campaigns.',
    categoryBadge: 'Promotional',
  },
  {
    id: 'general',
    title: 'General Support & Other Inquiries',
    icon: 'bi-chat-dots',
    estDuration: '< 2 Hours',
    defaultBudget: 'Flexible',
    description: 'Have a general question, partnership proposal, or technical issue? Get in touch.',
    categoryBadge: 'General',
  },
];

const BUDGET_OPTIONS = [
  'Under $500',
  '$500 - $1,500',
  '$1,500 - $5,000',
  '$5,000+',
  'Custom Enterprise Quote',
];

const TIMELINE_OPTIONS = [
  'Immediate / Urgent',
  '1 - 2 Weeks',
  '2 - 4 Weeks',
  '1 - 2 Months',
  'Flexible Timeline',
];

const FAQS = [
  {
    q: 'How fast do you respond to custom quote requests?',
    a: 'Our solution architects and account team respond within 2 business hours. For urgent enterprise support, phone consultations are available immediately.',
  },
  {
    q: 'What is included in a custom quote?',
    a: 'Every custom quote includes a detailed breakdown of deliverables, technology stack recommendations, milestone schedules, post-launch support guarantee, and transparent fixed pricing.',
  },
  {
    q: 'Can I request a custom feature set for website or mobile app development?',
    a: 'Absolutley! Our engineering team specializes in custom software solutions tailored specifically to your business workflows, database architecture, and design specifications.',
  },
  {
    q: 'How does the payment structure work for project services?',
    a: 'We operate on milestone-based payments (e.g. 30% kickoff, 40% demo milestone, 30% final deployment). All payments are secured with formal contracts and NDAs.',
  },
];

function ContactContent() {
  const searchParams = useSearchParams();
  const rawService = searchParams.get('service') || searchParams.get('inquiry') || 'web-development';

  const initialService = SERVICES.find((s) => s.id === rawService)?.id || 'web-development';

  const [selectedService, setSelectedService] = useState<string>(initialService);
  const [budget, setBudget] = useState<string>(
    SERVICES.find((s) => s.id === initialService)?.defaultBudget || '$1,500 - $5,000'
  );
  const [timeline, setTimeline] = useState<string>('2 - 4 Weeks');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Sync selected service if URL param changes
  useEffect(() => {
    const matched = SERVICES.find((s) => s.id === rawService);
    if (matched) {
      setSelectedService(matched.id);
      setBudget(matched.defaultBudget);
    }
  }, [rawService]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-animate-hero', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.contact-info-card', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3,
      });

      gsap.from(formRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.4,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const matched = SERVICES.find((s) => s.id === serviceId);
    if (matched) {
      setBudget(matched.defaultBudget);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please provide a brief description of your project or inquiry.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          company,
          serviceType: selectedService,
          budget,
          timeline,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }

      setSubmittedData(data.data || { fullName, email, serviceType: selectedService });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentServiceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];

  return (
    <div className="contact-page" ref={heroRef}>
      {/* Glow Effects */}
      <div className="contact-glow-top-left" aria-hidden="true" />
      <div className="contact-glow-bottom-right" aria-hidden="true" />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* ── Hero Section ── */}
        <section className="contact-hero">
          <div className="contact-badge contact-animate-hero">
            <i className="bi bi-stars"></i> Request a Custom Quote & Inquiries
          </div>
          <h1 className="contact-title contact-animate-hero">
            Let's Build Something <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F5E27C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Extraordinary Together
            </span>
          </h1>
          <p className="contact-subtitle contact-animate-hero">
            Have a custom digital project, mobile app, SEO requirement, or enterprise hiring inquiry? Reach out directly to our expert team for a tailored solution and fast turnaround.
          </p>

          {/* Quick Contact Info Cards */}
          <div className="contact-info-strip">
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div>
                <div className="contact-info-label">Response Guarantee</div>
                <div className="contact-info-value">Under 2 Hours</div>
                <div className="contact-info-subtext">Mon – Sat, 9:00 AM – 8:00 PM</div>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <i className="bi bi-envelope-check-fill"></i>
              </div>
              <div>
                <div className="contact-info-label">Direct Email</div>
                <div className="contact-info-value">quotes@jobnest.com</div>
                <div className="contact-info-subtext">For RFPs & official contracts</div>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <i className="bi bi-headset"></i>
              </div>
              <div>
                <div className="contact-info-label">Sales Hotline</div>
                <div className="contact-info-value">+1 (800) 562-6378</div>
                <div className="contact-info-subtext">Toll-free enterprise support</div>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <div className="contact-info-label">Headquarters</div>
                <div className="contact-info-value">Tech Park, Tower B</div>
                <div className="contact-info-subtext">Silicon Valley & Remote Global</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Form Container ── */}
        <section className="contact-form-container" ref={formRef}>
          <div className="contact-glass-card">
            {submittedData ? (
              <div className="contact-success-box">
                <div className="success-icon-badge">
                  <i className="bi bi-check-lg"></i>
                </div>
                <h3 className="h2 mb-3" style={{ color: '#ffffff', fontWeight: 800 }}>
                  Quote Request Received!
                </h3>
                <p style={{ color: '#B0B0B0', maxWidth: 600, margin: '0 auto 1.5rem', fontSize: '1.05rem' }}>
                  Thank you, <strong style={{ color: '#D4AF37' }}>{submittedData.fullName}</strong>. Our senior solution architect will review your project details for <strong style={{ color: '#ffffff' }}>{currentServiceObj.title}</strong> and send a comprehensive proposal to <strong style={{ color: '#D4AF37' }}>{submittedData.email}</strong> within 2 hours.
                </p>

                <div className="p-3 mb-4 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.2)', display: 'inline-block', textAlign: 'left', minWidth: 300 }}>
                  <div style={{ fontSize: '0.85rem', color: '#888888', marginBottom: '0.25rem' }}>Reference Ticket ID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#D4AF37', fontFamily: 'monospace' }}>
                    {submittedData.id || `JN-QUOTE-${Math.floor(100000 + Math.random() * 900000)}`}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setSubmittedData(null)}
                    className="btn-gold-submit"
                    style={{ width: 'auto', display: 'inline-flex' }}
                  >
                    Submit Another Quote Request <i className="bi bi-arrow-clockwise ms-2"></i>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* 1. Service Selection */}
                <div className="mb-4">
                  <div className="form-section-title">
                    <i className="bi bi-1-circle-fill"></i> Select Requested Service or Inquiry Type
                  </div>

                  <div className="service-selector-grid">
                    {SERVICES.map((serv) => {
                      const isSelected = selectedService === serv.id;
                      return (
                        <div
                          key={serv.id}
                          className={`service-pill-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => handleServiceSelect(serv.id)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="service-pill-title">
                            <span>
                              <i className={`bi ${serv.icon} me-2`} style={{ color: isSelected ? '#D4AF37' : '#888' }}></i>
                              {serv.title}
                            </span>
                          </div>
                          <div className="service-pill-desc">{serv.description}</div>
                          <div className="mt-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.75rem' }}>
                            <span className="badge" style={{ background: isSelected ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)', color: isSelected ? '#fff' : '#aaa' }}>
                              {serv.categoryBadge}
                            </span>
                            <span style={{ color: '#D4AF37', fontWeight: 600 }}>{serv.estDuration}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Budget & Timeline Options */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="form-section-title">
                      <i className="bi bi-2-circle-fill"></i> Estimated Budget Range
                    </div>
                    <div className="chip-options-grid">
                      {BUDGET_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          className={`chip-opt-btn ${budget === opt ? 'active' : ''}`}
                          onClick={() => setBudget(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-section-title">
                      <i className="bi bi-clock-history"></i> Desired Timeline
                    </div>
                    <div className="chip-options-grid">
                      {TIMELINE_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          className={`chip-opt-btn ${timeline === opt ? 'active' : ''}`}
                          onClick={() => setTimeline(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Contact Details */}
                <div className="mb-4">
                  <div className="form-section-title">
                    <i className="bi bi-3-circle-fill"></i> Your Contact Details
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="contact-label">Full Name *</label>
                      <input
                        type="text"
                        className="contact-input"
                        placeholder="e.g. Alex Morgan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="contact-label">Work Email *</label>
                      <input
                        type="email"
                        className="contact-input"
                        placeholder="alex@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="contact-label">Phone / WhatsApp (Optional)</label>
                      <input
                        type="tel"
                        className="contact-input"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="contact-label">Company / Organization (Optional)</label>
                      <input
                        type="text"
                        className="contact-input"
                        placeholder="e.g. Acme Tech Corp"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="contact-label">Project Details / Requirements *</label>
                      <textarea
                        rows={4}
                        className="contact-textarea"
                        placeholder="Please describe your key project goals, desired features, or specific questions..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ background: 'rgba(220,53,69,0.15)', borderColor: '#dc3545', color: '#ff808d', borderRadius: 12 }}>
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Submit CTA */}
                <div>
                  <button type="submit" className="btn-gold-submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Submitting Inquiry...
                      </>
                    ) : (
                      <>
                        Request Custom Quotation <i className="bi bi-arrow-right-short fs-4"></i>
                      </>
                    )}
                  </button>
                  <p className="text-center mt-3 mb-0" style={{ fontSize: '0.8rem', color: '#777777' }}>
                    <i className="bi bi-shield-lock me-1" style={{ color: '#D4AF37' }}></i>
                    Your information is protected under JobNest strict Non-Disclosure Agreement & Privacy Policy.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ── Agency Capabilities ── */}
        <section className="capabilities-section">
          <div className="text-center mb-5">
            <span className="contact-badge">Why Partner With Us</span>
            <h2 className="h1 font-weight-bold mt-2" style={{ color: '#ffffff' }}>
              Enterprise Digital Engineering Standards
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="capability-card">
                <i className="bi bi-people-fill capability-icon"></i>
                <h3 className="capability-title">Dedicated PM & Devs</h3>
                <p className="capability-desc">
                  Direct communication with full-stack engineers and dedicated agile product managers.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="capability-card">
                <i className="bi bi-award-fill capability-icon"></i>
                <h3 className="capability-title">State-of-the-Art UX</h3>
                <p className="capability-desc">
                  Award-winning designs built with Next.js, Bootstrap 5, GSAP, and sleek glassmorphic themes.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="capability-card">
                <i className="bi bi-speedometer2 capability-icon"></i>
                <h3 className="capability-title">Performance Guarantee</h3>
                <p className="capability-desc">
                  Target 90+ Google Lighthouse performance scores, instant load times, and SEO best practices.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="capability-card">
                <i className="bi bi-shield-check capability-icon"></i>
                <h3 className="capability-title">Enterprise Security</h3>
                <p className="capability-desc">
                  OWASP-compliant code, encrypted data storage, and strict NDA compliance for total peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="contact-faq-section">
          <div className="text-center mb-5">
            <span className="contact-badge">Got Questions?</span>
            <h2 className="h1 font-weight-bold mt-2" style={{ color: '#ffffff' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="faq-item-card">
                    <button
                      className="faq-question-btn"
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                    >
                      <span>{faq.q}</span>
                      <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ color: '#D4AF37' }}></i>
                    </button>
                    {isOpen && <div className="faq-answer-body">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="contact-page d-flex align-items-center justify-content-center min-vh-100">
          <div className="text-center" style={{ color: '#D4AF37' }}>
            <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }} />
            <div>Loading Quote & Contact System...</div>
          </div>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
