"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "../../styles/terms.css";

gsap.registerPlugin(ScrollTrigger);

const Terms: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".terms-hero-badge", { opacity: 0, y: -20, duration: 0.6, ease: "power3.out" });
      gsap.from(".terms-hero-title", { opacity: 0, y: 30, duration: 0.7, delay: 0.1, ease: "power3.out" });
      gsap.from(".terms-hero-meta", { opacity: 0, y: 20, duration: 0.6, delay: 0.2, ease: "power3.out" });
      gsap.from(".terms-section", {
        scrollTrigger: { trigger: ".terms-body", start: "top 85%", once: true },
        opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power3.out", clearProps: "all",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="terms-page" ref={heroRef}>
      <Breadcrumb items={[{ label: "Terms & Conditions" }]} />

      {/* Hero */}
      <div className="terms-hero">
        <div className="terms-hero-glow-1" />
        <div className="terms-hero-glow-2" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="terms-hero-badge">📋 Legal Information</div>
          <h1 className="terms-hero-title">Terms &amp; Conditions</h1>
          <div className="terms-hero-meta">
            <span>Effective Date: July 14, 2026</span>
            <span className="terms-hero-dot">•</span>
            <span>Last Updated: July 14, 2026</span>
          </div>
          <p className="terms-hero-desc">
            Please read these Terms &amp; Conditions carefully before using JobNest or purchasing any subscription plan.
            By accessing our platform, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="terms-body">
        <div className="container">
          <div className="terms-layout">
            {/* Sticky TOC */}
            <aside className="terms-toc">
              <div className="terms-toc-inner">
                <h3 className="terms-toc-title">Contents</h3>
                <ol className="terms-toc-list">
                  <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                  <li><a href="#eligibility">2. Eligibility</a></li>
                  <li><a href="#accounts">3. User Accounts</a></li>
                  <li><a href="#subscription">4. Subscription Plans</a></li>
                  <li><a href="#free-limits">5. Free Usage Limits</a></li>
                  <li><a href="#billing">6. Billing &amp; Payments</a></li>
                  <li><a href="#refunds">7. Refunds &amp; Cancellations</a></li>
                  <li><a href="#promotion">8. Business Promotion</a></li>
                  <li><a href="#content">9. User Content</a></li>
                  <li><a href="#prohibited">10. Prohibited Activities</a></li>
                  <li><a href="#ip">11. Intellectual Property</a></li>
                  <li><a href="#privacy">12. Privacy Policy</a></li>
                  <li><a href="#disclaimer">13. Disclaimer</a></li>
                  <li><a href="#liability">14. Limitation of Liability</a></li>
                  <li><a href="#termination">15. Termination</a></li>
                  <li><a href="#changes">16. Changes to Terms</a></li>
                  <li><a href="#contact">17. Contact Us</a></li>
                </ol>
              </div>
            </aside>

            {/* Main Content */}
            <main className="terms-content">

              <section className="terms-section" id="acceptance">
                <div className="terms-section-header">
                  <span className="terms-section-number">01</span>
                  <h2>Acceptance of Terms</h2>
                </div>
                <p>By accessing or using the JobNest platform ("Service"), you agree to be bound by these Terms &amp; Conditions ("Terms") and all applicable laws and regulations. If you do not agree with any part of these Terms, you are prohibited from using or accessing this Service.</p>
                <p>These Terms apply to all visitors, users, and others who access or use the Service, including Job Seekers, Employers, and Business Promoters.</p>
              </section>

              <section className="terms-section" id="eligibility">
                <div className="terms-section-header">
                  <span className="terms-section-number">02</span>
                  <h2>Eligibility</h2>
                </div>
                <p>To use JobNest, you must:</p>
                <ul className="terms-list">
                  <li>Be at least 18 years of age or have parental/guardian consent</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be prohibited from receiving services under applicable laws</li>
                  <li>Provide accurate and truthful information during registration</li>
                </ul>
                <p>JobNest reserves the right to verify eligibility and to refuse service at its discretion.</p>
              </section>

              <section className="terms-section" id="accounts">
                <div className="terms-section-header">
                  <span className="terms-section-number">03</span>
                  <h2>User Accounts</h2>
                </div>
                <p>When you create an account with JobNest, you must provide accurate, complete, and current information. You are responsible for:</p>
                <ul className="terms-list">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Promptly notifying JobNest of any unauthorized account access</li>
                  <li>Ensuring your profile information remains accurate and up to date</li>
                </ul>
                <div className="terms-callout terms-callout--warning">
                  <span className="terms-callout-icon">⚠️</span>
                  <p>You may not share your account credentials or allow others to access your account. Violation may result in immediate account suspension.</p>
                </div>
              </section>

              <section className="terms-section" id="subscription">
                <div className="terms-section-header">
                  <span className="terms-section-number">04</span>
                  <h2>Subscription Plans</h2>
                </div>
                <p>JobNest offers subscription plans for three distinct user roles:</p>

                <h3 className="terms-subheading">4.1 Job Seeker Plans</h3>
                <p>Job Seeker plans (Silver, Gold, Platinum) provide access to unlimited job applications, priority visibility, and advanced career features. Plans are available on Daily, Weekly, and Monthly billing cycles.</p>

                <h3 className="terms-subheading">4.2 Employer Plans</h3>
                <p>Employer plans unlock unlimited job posting capabilities, recruitment dashboards, candidate shortlisting tools, and company verification badges.</p>

                <h3 className="terms-subheading">4.3 Business Promotion Plans</h3>
                <p>Business Promotion plans provide homepage placement, search ranking boosts, banner ads, and lead generation support. All promotion features are paid — no free tier exists for business promotion.</p>

                <div className="terms-callout terms-callout--info">
                  <span className="terms-callout-icon">ℹ️</span>
                  <p>Subscription features may vary between plans. Please review the specific plan details on the <Link href="/subscription">Subscription Page</Link> before purchasing.</p>
                </div>
              </section>

              <section className="terms-section" id="free-limits">
                <div className="terms-section-header">
                  <span className="terms-section-number">05</span>
                  <h2>Free Usage Limits</h2>
                </div>
                <p>JobNest provides limited free access subject to the following conditions:</p>
                <div className="terms-table-wrapper">
                  <table className="terms-table">
                    <thead>
                      <tr>
                        <th>User Type</th>
                        <th>Free Allowance</th>
                        <th>Requires Subscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Job Seeker</td>
                        <td>First 3 job applications</td>
                        <td>4th application onwards</td>
                      </tr>
                      <tr>
                        <td>Employer</td>
                        <td>Up to 3 job postings</td>
                        <td>4th job posting onwards</td>
                      </tr>
                      <tr>
                        <td>Business Promoter</td>
                        <td>None — always paid</td>
                        <td>All promotion features</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="terms-section" id="billing">
                <div className="terms-section-header">
                  <span className="terms-section-number">06</span>
                  <h2>Billing &amp; Payments</h2>
                </div>
                <p>By purchasing a subscription, you authorize JobNest to charge your selected payment method for the applicable fees. All prices are listed in Indian Rupees (₹) and include applicable taxes unless otherwise stated.</p>
                <ul className="terms-list">
                  <li>GST (18%) is applied to all subscription purchases</li>
                  <li>Payment is due at the time of subscription activation</li>
                  <li>Accepted payment methods: Credit Card, Debit Card, Net Banking, EMI, and Other digital wallets (Amazon Pay, PayPal, Razorpay, Stripe)</li>
                  <li>All transactions are secured with 256-bit SSL encryption and are PCI-DSS compliant</li>
                </ul>
              </section>

              <section className="terms-section" id="refunds">
                <div className="terms-section-header">
                  <span className="terms-section-number">07</span>
                  <h2>Refunds &amp; Cancellations</h2>
                </div>
                <p>JobNest's refund policy is as follows:</p>
                <ul className="terms-list">
                  <li><strong>Daily Plans:</strong> No refunds once the plan has been activated</li>
                  <li><strong>Weekly Plans:</strong> Refund available within 24 hours of purchase if no premium features have been used</li>
                  <li><strong>Monthly Plans:</strong> Refund available within 48 hours of purchase if no premium features have been used</li>
                  <li>Business promotion refunds are subject to Admin review and promotion duration already served</li>
                </ul>
                <div className="terms-callout terms-callout--warning">
                  <span className="terms-callout-icon">⚠️</span>
                  <p>JobNest reserves the right to deny refund requests that do not meet these criteria. To request a refund, contact <strong>support@jobnest.in</strong>.</p>
                </div>
              </section>

              <section className="terms-section" id="promotion">
                <div className="terms-section-header">
                  <span className="terms-section-number">08</span>
                  <h2>Business Promotion</h2>
                </div>
                <p>Business Promotion on JobNest is subject to the following rules:</p>
                <ul className="terms-list">
                  <li>Promotion duration and placement priority are configured and managed by the JobNest Admin team</li>
                  <li>Active promotions receive priority placement in search results and homepage sections</li>
                  <li>Expired promotions automatically lose visibility and will not be displayed to users</li>
                  <li>Promotional content must comply with JobNest's Content Policy and applicable advertising standards</li>
                  <li>JobNest reserves the right to remove promotions that violate these terms without refund</li>
                </ul>
              </section>

              <section className="terms-section" id="content">
                <div className="terms-section-header">
                  <span className="terms-section-number">09</span>
                  <h2>User Content</h2>
                </div>
                <p>By submitting content (resumes, job listings, business profiles, etc.) to JobNest, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content for the purpose of operating the Service.</p>
                <p>You are solely responsible for the accuracy, legality, and appropriateness of all content you submit. JobNest does not endorse, verify, or guarantee any user-submitted content.</p>
              </section>

              <section className="terms-section" id="prohibited">
                <div className="terms-section-header">
                  <span className="terms-section-number">10</span>
                  <h2>Prohibited Activities</h2>
                </div>
                <p>The following activities are strictly prohibited on JobNest:</p>
                <ul className="terms-list">
                  <li>Posting fraudulent, misleading, or discriminatory job listings or profiles</li>
                  <li>Scraping, crawling, or harvesting data from the platform without authorization</li>
                  <li>Attempting to reverse-engineer, hack, or compromise the platform's security</li>
                  <li>Creating multiple accounts to circumvent free usage limits</li>
                  <li>Sending unsolicited communications (spam) to other users</li>
                  <li>Violating any applicable local, national, or international law or regulation</li>
                </ul>
                <p>Violation of any prohibited activity may result in immediate account termination and potential legal action.</p>
              </section>

              <section className="terms-section" id="ip">
                <div className="terms-section-header">
                  <span className="terms-section-number">11</span>
                  <h2>Intellectual Property</h2>
                </div>
                <p>The JobNest platform, including its name, logo, design, code, and all content created by JobNest, is the exclusive intellectual property of JobNest and its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
              </section>

              <section className="terms-section" id="privacy">
                <div className="terms-section-header">
                  <span className="terms-section-number">12</span>
                  <h2>Privacy Policy</h2>
                </div>
                <p>Your use of JobNest is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.</p>
                <p>JobNest does not sell, rent, or share your personal information with third parties for marketing purposes without your explicit consent.</p>
              </section>

              <section className="terms-section" id="disclaimer">
                <div className="terms-section-header">
                  <span className="terms-section-number">13</span>
                  <h2>Disclaimer</h2>
                </div>
                <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
                <p>JobNest does not guarantee that job seekers will find employment, that employers will find suitable candidates, or that business promotions will generate specific results.</p>
              </section>

              <section className="terms-section" id="liability">
                <div className="terms-section-header">
                  <span className="terms-section-number">14</span>
                  <h2>Limitation of Liability</h2>
                </div>
                <p>To the maximum extent permitted by law, JobNest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
                <p>Our total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the amount paid by you to JobNest in the three (3) months preceding the claim.</p>
              </section>

              <section className="terms-section" id="termination">
                <div className="terms-section-header">
                  <span className="terms-section-number">15</span>
                  <h2>Termination</h2>
                </div>
                <p>JobNest reserves the right to terminate or suspend your account and access to the Service at any time, with or without notice, for any reason including but not limited to violation of these Terms.</p>
                <p>Upon termination, your right to use the Service immediately ceases. Any active subscriptions will not be refunded unless required by applicable law.</p>
              </section>

              <section className="terms-section" id="changes">
                <div className="terms-section-header">
                  <span className="terms-section-number">16</span>
                  <h2>Changes to Terms</h2>
                </div>
                <p>JobNest reserves the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Last Updated" date at the top of this page and, where appropriate, by sending an email notification.</p>
                <p>Your continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>
              </section>

              <section className="terms-section" id="contact">
                <div className="terms-section-header">
                  <span className="terms-section-number">17</span>
                  <h2>Contact Us</h2>
                </div>
                <p>If you have any questions about these Terms &amp; Conditions, please contact us:</p>
                <div className="terms-contact-grid">
                  <div className="terms-contact-card">
                    <div className="terms-contact-icon">📧</div>
                    <div className="terms-contact-label">Email</div>
                    <a href="mailto:legal@jobnest.in">legal@jobnest.in</a>
                  </div>
                  <div className="terms-contact-card">
                    <div className="terms-contact-icon">📞</div>
                    <div className="terms-contact-label">Support</div>
                    <a href="tel:+918001234567">+91 800-123-4567</a>
                  </div>
                  <div className="terms-contact-card">
                    <div className="terms-contact-icon">📍</div>
                    <div className="terms-contact-label">Address</div>
                    <span>JobNest HQ, Bengaluru, Karnataka, India</span>
                  </div>
                </div>
              </section>

              {/* Footer CTA */}
              <div className="terms-footer-cta">
                <p>By using any JobNest subscription plan, you confirm that you have read, understood, and agree to these Terms &amp; Conditions.</p>
                <div className="terms-footer-actions">
                  <Link href="/subscription" className="terms-btn-primary">View Subscription Plans</Link>
                  <Link href="/" className="terms-btn-secondary">Back to Home</Link>
                </div>
              </div>

            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
