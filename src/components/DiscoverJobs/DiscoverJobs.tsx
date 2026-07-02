"use client";
import React from "react";
import "./DiscoverJobs.css";
import teamMeetingImg from "../../assets/images/discover_team_meeting.png";
import signingDocImg from "../../assets/images/discover_signing_doc.png";
import colleaguesImg from "../../assets/images/discover_colleagues_chat.png";

const DiscoverJobs: React.FC = () => {
  return (
    <section
      className="discover-section section-padding"
      id="discover"
      aria-label="Discover jobs"
    >
      <div className="container">
        <div className="row align-items-center g-5">
          {/* ── LEFT (unchanged) ── */}
          <div className="col-lg-5">
            <div className="section-label">
              <i className="bi bi-compass"></i> Discover
            </div>
            <h2 className="section-heading">
              Discover The Job That
              <span className="gradient-text"> Fits You</span>
            </h2>
            <p className="section-subtext mb-4" style={{ maxWidth: "100%" }}>
              Browse jobs from top companies. Filter opportunities based on your
              preferences, and apply with a single profile. Whether you're
              searching for remote work, full-time roles, or career growth
              opportunities, our platform helps you connect with the right
              employers efficiently.
            </p>
            <p className="section-subtext mb-4" style={{ maxWidth: "100%" }}>
              Browse jobs from top companies. Filter opportunities based on your
              preferences, and apply with a single profile. Whether you're
              searching for remote work, full-time roles, or career growth
              opportunities, our platform helps you connect with the right
              employers efficiently.
            </p>

            <div className="d-flex flex-wrap gap-3 mt-2">
              <a
                href="#"
                className="btn-primary-custom"
                id="discover-browse-btn"
              >
                Browse Jobs <i className="bi bi-arrow-right ms-2"></i>
              </a>
              <a href="#" className="btn-outline-custom" id="discover-post-btn">
                Browse Jobs
              </a>
            </div>
          </div>

          {/* ── RIGHT — Image mosaic + stat box ── */}
          <div className="col-lg-7">
            <div className="discover-mosaic" aria-label="Recruitment imagery">
              {/* Top row: large left image + tall right image */}
              <div className="mosaic-top">
                {/* Large team meeting photo */}
                <div className="mosaic-img-wrap mosaic-large">
                  <img
                    src={teamMeetingImg.src}
                    alt="Professional team meeting in modern office"
                    className="mosaic-img"
                    loading="lazy"
                  />
                </div>

                {/* Right column: signing doc (top) + colleagues (bottom) */}
                <div className="mosaic-right-col">
                  <div className="mosaic-img-wrap mosaic-small">
                    <img
                      src={signingDocImg.src}
                      alt="Business professional signing a document"
                      className="mosaic-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="mosaic-img-wrap mosaic-small">
                    <img
                      src={colleaguesImg.src}
                      alt="Two colleagues having a friendly discussion"
                      className="mosaic-img"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* ── Blue stat box (overlapping bottom-left) ── */}
              <div
                className="mosaic-stat-box"
                aria-label="Recruitment statistics"
              >
                <p className="msb-number">720+</p>
                <p className="msb-label">Recruitment done</p>
                <div
                  className="msb-avatars"
                  aria-label="Recruited professionals"
                >
                  <span className="msb-avatar" aria-hidden="true">
                    👩‍💼
                  </span>
                  <span className="msb-avatar" aria-hidden="true">
                    👨‍💻
                  </span>
                  <span className="msb-avatar" aria-hidden="true">
                    👩‍🔬
                  </span>
                  <span className="msb-avatar" aria-hidden="true">
                    👨‍🎨
                  </span>
                  <span
                    className="msb-avatar msb-avatar--more"
                    aria-label="and more"
                  >
                    +
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverJobs;
