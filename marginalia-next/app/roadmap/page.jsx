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
const FULL_TEXT_2 = "Whatever your goal is,\nbelieve in yourself and keep moving toward it.";
const FULL_TEXT_3 = "And if there are days when you don’t believe in yourself, that’s okay.\nI’ll believe in you. I believe in your ideas, your potential, and everything\nyou’re capable of becoming. So keep going. You don’t have to figure it\nall out alone; I’m with you throughout the journey.";

export default function RoadmapPage() {
  const [goalText, setGoalText] = useState('');
  const [submittedGoal, setSubmittedGoal] = useState('');

  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [text3, setText3] = useState('');
  const [activeBlock, setActiveBlock] = useState(1); // 1, 2, 3, or 0 (done)

  const audioCtxRef = useRef(null);
  const audioBufRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioPoolRef = useRef([]);
  const poolIdxRef = useRef(0);
  const lastTapRef = useRef(-1);

  // Synchronously initialize audio elements on mount so sound plays from character 1
  useEffect(() => {
    try {
      audioPoolRef.current = Array.from({ length: 8 }, () => {
        const a = new Audio(SRC);
        a.preload = 'auto';
        return a;
      });
    } catch (e) {}

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
      } catch (e) {}
    };

    initAudio();

    const wake = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
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

    // Method A: Web Audio API (high precision synthesis)
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
      } catch (err) {}
    }

    // Method B: Immediate HTML5 Audio Pool (plays from character 1 right from load)
    const pool = audioPoolRef.current;
    if (pool && pool.length > 0) {
      try {
        const pIdx = (poolIdxRef.current + 1) % pool.length;
        poolIdxRef.current = pIdx;
        const a = pool[pIdx];
        a.volume = (space ? 0.11 : 0.15) * (0.8 + Math.random() * 0.35);
        a.currentTime = HITS[(Math.random() * HITS.length) | 0];
        const p = a.play();
        if (p) p.catch(() => {});
        setTimeout(() => { try { a.pause(); } catch (e) {} }, 160);
      } catch (e) {}
    }
  };

  // Typewriter Loop
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

    // Start typing right away at 120ms so sound begins from character 1
    timeoutId = setTimeout(typeBlock1, 120);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (e) => {
    setGoalText(e.target.value);
    playTap(e.target.value.endsWith(' '));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goalText.trim()) {
      setSubmittedGoal(goalText.trim());
      setGoalText('');
    }
  };

  return (
    <ShopProvider>
      <div className="veil" aria-hidden="true"></div>

      <Header />

      <main style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--ivory)' }}>
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

          <form className="goal-form" id="goalForm" onSubmit={handleSubmit} autoComplete="off">
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

          {submittedGoal && (
            <div className="goal-success-card">
              <h3>🌱 Goal Planted in Your Roadmap</h3>
              <p>"{submittedGoal}"</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--rm-quiet)', marginTop: '8px' }}>
                Every great journey begins with a single intentional thought. We're with you every step of the way.
              </p>
            </div>
          )}

          <p className="rm-foot">A BRIGHTER YOU STARTS WITH A THOUGHT.</p>
        </section>
      </main>

      <Footer />

      <Butterfly />

      <PageEffects />
    </ShopProvider>
  );
}
