"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  {
    feature: "Create Profile",
    free: "✓",
    plus: "✓",
    pro: "✓",
  },
  {
    feature: "Discover Jobs & Opportunities",
    free: "✓",
    plus: "✓",
    pro: "✓",
  },
  {
    feature: "Apply / Connect",
    free: "✓",
    plus: "✓",
    pro: "✓",
  },
  {
    feature: "Promote Yourself",
    free: "—",
    plus: "✓",
    pro: "✓",
  },
  {
    feature: "Enhanced Visibility",
    free: "—",
    plus: "✓",
    pro: "✓",
  },
  {
    feature: "Advanced Search",
    free: "—",
    plus: "✓",
    pro: "✓",
  },
  {
    feature: "Analytics",
    free: "Basic",
    plus: "Standard",
    pro: "Advanced",
  },
  {
    feature: "Priority Placement",
    free: "—",
    plus: "—",
    pro: "✓",
  },
];

const renderCell = (val: string) => {
  if (val === "✓") return <span className="check-icon">✓</span>;
  if (val === "—" || val === "✗") return <span className="cross-icon">—</span>;
  return <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{val}</span>;
};

const ComparisonTable: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("tbody tr", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        x: -15,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="comparison-section" ref={sectionRef} id="comparison">
      <div className="container">
        <div className="text-start mb-4">
          <div className="sub-eyebrow mb-2">
            <span className="eyebrow-bullet">•</span> COMPARE PLANS
          </div>
          <h2 className="sub-heading">Find the Right Plan for You</h2>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table" role="table" aria-label="Plan comparison">
            <thead>
              <tr>
                <th scope="col" style={{ width: "34%" }}>Features</th>
                <th scope="col" style={{ width: "22%" }}>Free</th>
                <th scope="col" style={{ width: "22%" }}>Plus</th>
                <th scope="col" style={{ width: "22%" }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{renderCell(row.free)}</td>
                  <td>{renderCell(row.plus)}</td>
                  <td>{renderCell(row.pro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
