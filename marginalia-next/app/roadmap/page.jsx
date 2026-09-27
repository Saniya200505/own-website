'use client';

import { useEffect, useRef, useState } from 'react';
import ShopProvider from '../../components/ShopProvider';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Butterfly from '../../components/Butterfly';
import PageEffects from '../../components/PageEffects';

const HITS = [
  1.971, 2.211, 2.406, 3.781, 3.976, 4.146, 4.341, 4.691, 4.946, 5.121, 5.291, 5.621,
  5.926, 6.241, 6.646, 6.791, 6.981, 7.261, 7.531, 7.871, 8.056, 8.231, 8.431, 8.761,
  9.001, 9.761, 9.991, 10.551, 10.911, 11.106, 11.446, 11.811, 12.121, 12.771, 13.481,
  17.911, 18.126, 18.241, 18.656, 18.911, 19.201, 19.566, 19.951, 20.141, 20.601, 20.816,
  21.961, 22.186, 22.251, 22.351, 22.796, 23.016, 23.181, 23.981, 24.251, 24.511, 24.721,
  24.906, 25.086, 25.651, 25.751, 25.876, 26.431, 26.496, 26.661, 26.896, 27.061, 27.551,
  28.011, 29.026, 29.296, 29.396, 29.896, 30.106, 30.361, 30.601, 31.161, 31.276, 31.361,
  31.796, 32.151, 32.491, 32.691, 33.691, 33.761, 33.931, 34.026, 34.116, 34.286
];

const SRC = '/assets/typing_sound.mp3';

const FULL_TEXT_1 = "BELIEVE · PLAN · GROW · ACHIEVE";
const FULL_TEXT_2 = "Whatever your goal is,\nbelieve in yourself and keep moving towards it.";
const FULL_TEXT_3 = "And if there are days when you don’t believe in yourself, that’s okay.\nI believe in you. I believe in your ideas, your potential, and everything\nyou’re capable of becoming. So keep going. You don’t have to figure it\nall out alone; I’m with you throughout the journey.";

export default function RoadmapPage() {
  const [goalText, setGoalText] = useState('');
  const [pendingGoal, setPendingGoal] = useState('');

  // User auth state
  const [user, setUser] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'signup', 'login', or null
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [text3, setText3] = useState('');
  const [activeBlock, setActiveBlock] = useState(1);

  const audioCtxRef = useRef(null);
  const audioBufRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioPoolRef = useRef([]);
  const poolIdxRef = useRef(0);
  const lastTapRef = useRef(-1);

  // Initialize saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marginalia_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }
    } catch (e) {}
  }, []);

  // Prompt for Sign Up once content is fully displayed
  useEffect(() => {
    if (activeBlock === 0 && !user) {
      const timer = setTimeout(() => {
        setModalMode('signup');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeBlock, user]);

  // Audio setup
  useEffect(() => {
    try {
      audioPoolRef.current = Array.from({ length: 8 }, () => {
        const a = new Audio(SRC);
        a.preload = 'auto';
        return a;
      });
    } catch (e) { }

    const initAudio = async () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC && !audioCtxRef.current) {
          const ctx = new AC();
          const out = ctx.createGain();
          out.gain.value = 0.17;
          const soften = ctx.createBiquadFilter();
          soften.type = 'lowpass';
          soften.frequency.value = 5200;
          soften.Q.value = 0.6;
          soften.connect(out).connect(ctx.destination);
          masterGainRef.current = soften;
          audioCtxRef.current = ctx;

          const resp = await window.fetch(SRC);
          if (resp.ok) {
            const arrayBuf = await resp.arrayBuffer();
            audioBufRef.current = await ctx.decodeAudioData(arrayBuf);
          }
        }
      } catch (e) { }
    };

    initAudio();

    const wake = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => { });
      }
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'click', 'mousemove', 'pointermove', 'scroll', 'wheel'];
    events.forEach(evt => window.addEventListener(evt, wake, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, wake));
    };
  }, []);

  const playTap = (space = false) => {
    const now = performance.now() / 1000;
    if (now - lastTapRef.current < 0.035) return;
    lastTapRef.current = now;

    if (audioCtxRef.current && audioBufRef.current && audioCtxRef.current.state === 'running') {
      try {
        const ctx = audioCtxRef.current;
        const srcNode = ctx.createBufferSource();
        srcNode.buffer = audioBufRef.current;
        srcNode.playbackRate.value = (space ? 0.88 : 0.97) + Math.random() * 0.11;
        const g = ctx.createGain();
        const vol = (space ? 0.72 : 1) * (0.78 + Math.random() * 0.34);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.004);
        g.gain.setTargetAtTime(0, ctx.currentTime + 0.045, 0.032);
        srcNode.connect(g).connect(masterGainRef.current);
        const hitSample = HITS[(Math.random() * HITS.length) | 0];
        srcNode.start(ctx.currentTime, hitSample, 0.17);
        srcNode.stop(ctx.currentTime + 0.19);
        return;
      } catch (err) { }
    }

    const pool = audioPoolRef.current;
    if (pool && pool.length > 0) {
      try {
        const pIdx = (poolIdxRef.current + 1) % pool.length;
        poolIdxRef.current = pIdx;
        const a = pool[pIdx];
        a.volume = (space ? 0.11 : 0.15) * (0.8 + Math.random() * 0.35);
        a.currentTime = HITS[(Math.random() * HITS.length) | 0];
        const p = a.play();
        if (p) p.catch(() => { });
        setTimeout(() => { try { a.pause(); } catch (e) { } }, 160);
      } catch (e) { }
    }
  };

  // Typewriter effect
  useEffect(() => {
    let timeoutId;
    let idx1 = 0;
    let idx2 = 0;
    let idx3 = 0;

    const typeBlock1 = () => {
      if (idx1 < FULL_TEXT_1.length) {
        idx1++;
        const char = FULL_TEXT_1[idx1 - 1];
        setText1(FULL_TEXT_1.slice(0, idx1));
        if (char !== '\n') playTap(char === ' ');
        timeoutId = setTimeout(typeBlock1, 35);
      } else {
        setActiveBlock(2);
        timeoutId = setTimeout(typeBlock2, 350);
      }
    };

    const typeBlock2 = () => {
      if (idx2 < FULL_TEXT_2.length) {
        idx2++;
        const char = FULL_TEXT_2[idx2 - 1];
        setText2(FULL_TEXT_2.slice(0, idx2));
        if (char !== '\n') playTap(char === ' ');
        let delay = 32;
        if (char === ',' || char === '.') delay = 180;
        timeoutId = setTimeout(typeBlock2, delay);
      } else {
        setActiveBlock(3);
        timeoutId = setTimeout(typeBlock3, 400);
      }
    };

    const typeBlock3 = () => {
      if (idx3 < FULL_TEXT_3.length) {
        idx3++;
        const char = FULL_TEXT_3[idx3 - 1];
        setText3(FULL_TEXT_3.slice(0, idx3));
        if (char !== '\n') playTap(char === ' ');
        let delay = 28;
        if (char === ',' || char === '.' || char === ';') delay = 160;
        timeoutId = setTimeout(typeBlock3, delay);
      } else {
        setActiveBlock(0);
      }
    };

    timeoutId = setTimeout(typeBlock1, 120);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (e) => {
    setGoalText(e.target.value);
    playTap(e.target.value.endsWith(' '));
  };

  // Submit Goal Handler
  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const cleanGoal = goalText.trim();
    if (!cleanGoal) return;

    if (!user) {
      // First time / Not logged in: prompt for Sign Up!
      setPendingGoal(cleanGoal);
      setAuthError('');
      setModalMode('signup');
    } else {
      // Logged in: submit directly to MongoDB
      saveGoalToDB(user.username, cleanGoal);
    }
  };

  const saveGoalToDB = async (username, goal) => {
    try {
      setAuthLoading(true);
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, goal }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('marginalia_user', JSON.stringify(data.user));
        setGoalText('');
        setPendingGoal('');
        window.location.href = '/my-roadmap';
      } else {
        alert(data.message || 'Error saving goal to roadmap.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to database server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Form Submit (Signup / Login)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Please enter both username/email and password.');
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = modalMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = {
        username: authUsername.trim(),
        password: authPassword.trim(),
        ...(modalMode === 'signup' ? { goal: pendingGoal || goalText.trim() } : {}),
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.user) {
        let finalUser = data.user;
        // If login and there was a pending goal, save it to DB
        if (modalMode === 'login' && (pendingGoal || goalText.trim())) {
          const goalToSave = pendingGoal || goalText.trim();
          const updateRes = await fetch('/api/roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: data.user.username, goal: goalToSave }),
          });
          const updateData = await updateRes.json();
          if (updateData.success && updateData.user) {
            finalUser = updateData.user;
          }
        }

        setUser(finalUser);
        localStorage.setItem('marginalia_user', JSON.stringify(finalUser));
        setModalMode(null);
        setGoalText('');
        setPendingGoal('');
        setAuthUsername('');
        setAuthPassword('');
        window.location.href = '/my-roadmap';
      } else {
        if (res.status === 404 || data.message?.toLowerCase().includes('sign up first') || data.message?.toLowerCase().includes('no account')) {
          setAuthError('⚠️ Account does not exist. Please sign up first!');
          setTimeout(() => {
            setModalMode('signup');
          }, 1200);
        } else {
          setAuthError(data.message || 'Authentication failed');
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError('Network error. Could not connect to database.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('marginalia_user');
    setUser(null);
    setModalMode('login');
  };

  const isContentFullyDisplayed = activeBlock === 0;

  return (
    <ShopProvider>
      <div className="veil" aria-hidden="true"></div>

      <Header />

      <main style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--ivory)', paddingBottom: '60px' }}>
        <section className="rm-hero wrap" id="roadmap">

          <p className="rm-quiet" style={{ minHeight: '1.5em' }}>
            <span className="sr-only">BELIEVE · PLAN · GROW · ACHIEVE</span>
            <span>{text1}</span>
            {activeBlock === 1 && <i className="caret"></i>}
          </p>

          <h1 className="rm-title" style={{ minHeight: '3.2em' }}>
            <span className="sr-only">Whatever your goal is, believe in yourself and keep moving toward it.</span>
            <span>
              {text2.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </span>
            {activeBlock === 2 && <i className="caret"></i>}
          </h1>

          <p className="rm-lede" style={{ minHeight: '5.5em' }}>
            <span className="sr-only">
              And if there are days when you don't believe in yourself, that's okay. I'll believe in you. I believe in your ideas, your potential, and everything you're capable of becoming. So keep going. You don't have to figure it all out alone; I'm with you throughout the journey.
            </span>
            <span>
              {text3.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br className="br-lg" />}
                  {line}
                </span>
              ))}
            </span>
            {activeBlock === 3 && <i className="caret"></i>}
          </p>

          {/* Goal Input Form */}
          <form
            className="goal-form"
            id="goalForm"
            onSubmit={handleGoalSubmit}
            autoComplete="off"
            style={{
              opacity: isContentFullyDisplayed ? 1 : 0,
              transform: isContentFullyDisplayed ? 'translateY(0)' : 'translateY(16px)',
              pointerEvents: isContentFullyDisplayed ? 'auto' : 'none',
              transition: 'opacity 0.72s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)'
            }}
          >
            <label className="sr-only" htmlFor="goalInput">Type your goal or idea</label>
            <input
              className="goal-input"
              id="goalInput"
              type="text"
              placeholder="Type your goal or idea..."
              value={goalText}
              onChange={handleInputChange}
            />
            <span className="goal-div" aria-hidden="true"></span>
            <button className="goal-submit" type="submit">
              <span className="label">Submit</span>
              <svg viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M0.6 6h25.8" />
                <path d="M21.4 1.2 26.4 6l-5 4.8" />
              </svg>
            </button>
          </form>

          {/* USER ROADMAP DISPLAY VIEW (when logged in & goal submitted) */}
          {user && (user.goal || (user.goals && user.goals.length > 0)) && (
            <div className="user-roadmap-container">
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
                    Your intention has been recorded in the database. Every big accomplishment begins with the decision to try.
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
            </div>
          )}

          <p
            className="rm-foot"
            style={{
              opacity: isContentFullyDisplayed ? 1 : 0,
              transform: isContentFullyDisplayed ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1) 0.2s, transform 0.8s cubic-bezier(.16,1,.3,1) 0.2s',
              marginTop: '40px'
            }}
          >
            A BRIGHTER YOU STARTS WITH A THOUGHT.
          </p>
        </section>

        {/* AUTH MODAL (SIGNUP & LOGIN) */}
        {modalMode && (
          <div className="auth-modal-overlay" onClick={() => setModalMode(null)}>
            <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
              <button className="auth-modal-close" onClick={() => setModalMode(null)} aria-label="Close modal">
                ✕
              </button>

              <div className="auth-modal-header">
                <h2>{modalMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h2>
                <p>
                  {modalMode === 'signup'
                    ? 'Sign up to submit your goal & save your personalized roadmap in MongoDB.'
                    : 'Log in with your ID & password to view your saved roadmap.'}
                </p>
              </div>

              {authError && <div className="auth-error-msg">{authError}</div>}

              <form onSubmit={handleAuthSubmit}>
                <div className="auth-form-group">
                  <label htmlFor="authUsername">Login ID / Username / Email</label>
                  <input
                    id="authUsername"
                    type="text"
                    className="auth-input"
                    placeholder="Enter your username or email"
                    value={authUsername}
                    onChange={e => setAuthUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="authPassword">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="authPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Enter password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading
                    ? 'Processing...'
                    : modalMode === 'signup'
                    ? 'Sign Up & Save Goal'
                    : 'Log In to My Roadmap'}
                </button>
              </form>

              <div className="auth-switch-prompt">
                {modalMode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={() => {
                        setModalMode('login');
                        setAuthError('');
                      }}
                    >
                      Log In
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={() => {
                        setModalMode('signup');
                        setAuthError('');
                      }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <Butterfly />

      <PageEffects />
    </ShopProvider>
  );
}
