"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

const faqs = [
  {
    q: "Is there a free account?",
    a: "Yes! Job seekers can search jobs, build a profile, and apply to their first 3 jobs completely free. Employers can also create a company profile and post up to 3 jobs for free.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time from your account settings. You will continue to have access to all your premium features until the end of your billing cycle.",
  },
  {
    q: "Can I be both a job seeker and a business owner?",
    a: "Absolutely! GoDiscoverMe supports multi-role accounts. You can easily switch between Job Seeker, Employer, and Business Promoter modes within the same account at any time.",
  },
  {
    q: "What's included with a business account?",
    a: "Business accounts include job posting tools, candidate discovery, service showcases, business profile promotion, applicant management, and real-time recruitment analytics.",
  },
  {
    q: "Can I change my plan anytime?",
    a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, changes take effect immediately with prorated billing applied to your next statement.",
  },
  {
    q: "How does business visibility work?",
    a: "Business promotion features boost your profile to the top of relevant search results, feature your business on the homepage, and display sponsored banners across category listings.",
  },
];

const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (idx: number) => {
    const isOpen = openIdx === idx;
    const answer = itemRefs.current[idx]?.querySelector<HTMLDivElement>(".faq-answer");
    const icon = itemRefs.current[idx]?.querySelector(".faq-icon");

    if (answer) {
      if (isOpen) {
        gsap.to(answer, { maxHeight: 0, padding: "0 22px", duration: 0.3, ease: "power2.in" });
      } else {
        gsap.to(answer, { maxHeight: 240, padding: "0 22px 20px", duration: 0.35, ease: "power2.out" });
      }
    }
    if (icon) {
      gsap.to(icon, { rotation: isOpen ? 0 : 45, duration: 0.25, ease: "power2.inOut" });
    }
    setOpenIdx(isOpen ? null : idx);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq-header-row">
          <div>
            <div className="sub-eyebrow mb-2">
              <span className="eyebrow-bullet">•</span> FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="sub-heading mb-0">Have Questions? We&apos;ve Got Answers.</h2>
          </div>
          <Link href="/contact" className="faq-header-link">
            View All FAQs <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="faq-grid-2col">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item${openIdx === idx ? " open" : ""}`}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              id={`faq-item-${idx + 1}`}
            >
              <div
                className="faq-question"
                onClick={() => toggle(idx)}
                role="button"
                tabIndex={0}
                aria-expanded={openIdx === idx}
                onKeyDown={(e) => e.key === "Enter" && toggle(idx)}
              >
                <span className="faq-question-text">{item.q}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </div>
              <div
                className="faq-answer"
                style={{ maxHeight: 0, padding: "0 22px" }}
              >
                <p className="faq-answer-text">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
