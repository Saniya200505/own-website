'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShopProvider from '../../components/ShopProvider';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Butterfly from '../../components/Butterfly';
import PageEffects from '../../components/PageEffects';

export default function MyRoadmapPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('marginalia_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);

        if (parsed?.username) {
          fetch(`/api/roadmap?username=${encodeURIComponent(parsed.username)}`)
            .then(r => r.json())
            .then(res => {
              if (res.success && res.user) {
                setUser(res.user);
                localStorage.setItem('marginalia_user', JSON.stringify(res.user));
              }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('marginalia_user');
    setUser(null);
    window.location.href = '/roadmap';
  };

  return (
    <ShopProvider>
      <div className="veil" aria-hidden="true"></div>

      <Header />

      <main style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--ivory)', padding: '60px 20px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-75)' }}>
              <p>Loading your roadmap...</p>
            </div>
          ) : user && (user.goal || (user.goals && user.goals.length > 0)) ? (
            <div className="user-roadmap-container" style={{ marginTop: '20px' }}>
              <div className="roadmap-header-card">
                <div className="roadmap-user-info">
                  <div className="user-avatar-circle">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{user.username}'s Personal Roadmap</h3>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>

              <div className="roadmap-timeline">
                <div className="roadmap-step-card hero-step">
                  <span className="step-tag">🌱 Core Goal & Vision</span>
                  <h3 className="step-title">"{user.goal}"</h3>
                  <p className="step-desc">
                    Your intention has been recorded. Every big accomplishment begins with the decision to try.
                  </p>
                </div>

                <div className="roadmap-step-card">
                  <span className="step-tag">Phase 1 · Mindset & Planning</span>
                  <h4 className="step-title">Break Down & Daily Alignment</h4>
                  <p className="step-desc">
                    Transform "{user.goal}" into small, achievable daily habits. Consistency builds confidence.
                  </p>
                </div>

                <div className="roadmap-step-card">
                  <span className="step-tag">Phase 2 · Execution & Growth</span>
                  <h4 className="step-title">Pushing Through & Expanding Capabilities</h4>
                  <p className="step-desc">
                    Embrace challenges along the way. Remember: "I believe in your ideas, your potential, and everything you're capable of becoming."
                  </p>
                </div>

                <div className="roadmap-step-card">
                  <span className="step-tag">Phase 3 · Manifestation & Achievement</span>
                  <h4 className="step-title">Celebrating Milestones</h4>
                  <p className="step-desc">
                    Look back at how far you've come. Your roadmap is a living testimony of your growth.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <Link href="/roadmap" className="logout-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  + Set a New Goal
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: '#5C3840', marginBottom: '12px' }}>
                No Active Roadmap Found
              </h2>
              <p style={{ color: 'var(--ink-75)', marginBottom: '24px' }}>
                Please sign up or submit a goal to view your personalized roadmap.
              </p>
              <Link href="/roadmap" className="auth-submit-btn" style={{ display: 'inline-block', width: 'auto', padding: '12px 28px', textDecoration: 'none' }}>
                Go to Goal Generator
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Butterfly />

      <PageEffects />
    </ShopProvider>
  );
}
