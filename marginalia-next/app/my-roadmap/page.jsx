'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShopProvider from '../../components/ShopProvider';
import PersonalRoadmapView from '../../components/PersonalRoadmapView';
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

  if (loading) {
    return (
      <ShopProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#FAF1F2', display: 'grid', placeItems: 'center', color: '#4A151B' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem' }}>Loading your roadmap...</p>
        </div>
      </ShopProvider>
    );
  }

  if (!user || (!user.goal && (!user.goals || user.goals.length === 0))) {
    return (
      <ShopProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#FAF1F2', display: 'grid', placeItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: '#4A151B', marginBottom: '12px' }}>
              No Active Roadmap Found
            </h2>
            <p style={{ color: '#64454B', marginBottom: '24px' }}>
              Please submit a goal to view your personalized roadmap.
            </p>
            <Link href="/roadmap" className="nivant-new-goal-btn" style={{ display: 'inline-block' }}>
              Go to Goal Generator
            </Link>
          </div>
        </div>
      </ShopProvider>
    );
  }

  return (
    <ShopProvider>
      <div className="veil" aria-hidden="true"></div>

      <PersonalRoadmapView user={user} onSignOut={handleLogout} />

      <Butterfly />
      <PageEffects />
    </ShopProvider>
  );
}

