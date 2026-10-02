'use client';

import React from 'react';
import Link from 'next/link';

export default function PersonalRoadmapView({ user, onSignOut }) {
  const goalText = user?.goal || "my goal is to bring my dream life into reality";
  const userIdentifier = user?.email || (user?.username ? `${user.username}@gmail.com` : 'saniyaburandeo55@gmail.com');
  const avatarLetter = (user?.username || user?.email || 'S').charAt(0).toUpperCase();

  return (
    <div className="nivant-roadmap-wrapper">
      {/* Brand Header */}
      <header className="nivant-brand-header">
        <div className="nivant-brand-logo">
          <svg width="22" height="18" viewBox="0 0 24 20" fill="none" stroke="#4A151B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>NIVANT.</span>
        </div>
      </header>

      {/* Top User Pill Bar */}
      <div className="nivant-roadmap-topbar">
        <div className="nivant-user-info">
          <div className="nivant-avatar-circle">
            {avatarLetter}
          </div>
          <span className="nivant-user-title">
            {userIdentifier}'s Personal Roadmap
          </span>
        </div>
        <button className="nivant-signout-btn" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      {/* Main Curved Roadmap Canvas */}
      <div className="nivant-timeline-container">
        {/* Curved S-Path Background SVG */}
        <svg className="nivant-scurve-svg" viewBox="0 0 760 1120" fill="none" preserveAspectRatio="xMidYMin meet">
          <path
            d="M 30,10 C 80,10 140,20 188,58 C 110,120 70,260 388,348 C 220,410 140,540 248,638 C 170,700 130,830 408,928 C 500,960 620,1040 740,1100"
            stroke="#5C242A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Steps Content Overlay */}
        <div className="nivant-steps-layout">
          {/* Step 01 */}
          <div className="nivant-step-item step-1">
            <div className="nivant-step-num-row">
              <div className="nivant-node-marker" aria-hidden="true">
                <div className="nivant-node-inner"></div>
              </div>
              <span className="nivant-step-num">01</span>
              <span className="nivant-step-line"></span>
            </div>
            <div className="nivant-step-badge">CORE GOAL & VISION</div>
            <h2 className="nivant-step-quote">
              "{goalText}"
            </h2>
            <div className="nivant-step-subbox">
              <p>
                Your intention has been recorded. Every big accomplishment begins with the decision to try.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="nivant-step-item step-2">
            <div className="nivant-step-num-row">
              <div className="nivant-node-marker" aria-hidden="true">
                <div className="nivant-node-inner"></div>
              </div>
              <span className="nivant-step-num">02</span>
              <span className="nivant-step-line"></span>
            </div>
            <div className="nivant-step-badge">MINDSET & PLANNING</div>
            <h2 className="nivant-step-title">
              Break Down & Daily Alignment
            </h2>
            <div className="nivant-step-subbox">
              <p>
                Transform "{goalText}" into small, achievable daily habits. Consistency builds confidence.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="nivant-step-item step-3">
            <div className="nivant-step-num-row">
              <div className="nivant-node-marker" aria-hidden="true">
                <div className="nivant-node-inner"></div>
              </div>
              <span className="nivant-step-num">03</span>
              <span className="nivant-step-line"></span>
            </div>
            <div className="nivant-step-badge">EXECUTION & GROWTH</div>
            <h2 className="nivant-step-title">
              Pushing Through & Expanding Capabilities
            </h2>
            <div className="nivant-step-subbox">
              <p>
                Embrace challenges along the way. Remember: "I believe in your ideas, your potential, and everything you're capable of becoming."
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="nivant-step-item step-4">
            <div className="nivant-step-num-row">
              <div className="nivant-node-marker" aria-hidden="true">
                <div className="nivant-node-inner"></div>
              </div>
              <span className="nivant-step-num">04</span>
              <span className="nivant-step-line"></span>
            </div>
            <div className="nivant-step-badge">MANIFESTATION & ACHIEVEMENT</div>
            <h2 className="nivant-step-title">
              Celebrating Milestones
            </h2>
            <div className="nivant-step-subbox">
              <p>
                Look back at how far you've come. Your roadmap is a living testimony of your growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action / Footer */}
      <div className="nivant-roadmap-footer">
        <Link href="/roadmap" className="nivant-new-goal-btn">
          + Set a New Goal
        </Link>
      </div>
    </div>
  );
}
