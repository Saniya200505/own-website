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
  28.011, 29.026, 29.396, 29.896, 30.106, 30.361, 30.601, 31.161, 31.276, 31.361,
  31.796, 32.151, 32.491, 32.691, 33.691, 33.761, 33.931, 34.026, 34.116, 34.286
];

const SRC = '/assets/typing_sound.mp3';

const NAME_1 = "Saniya";
const NAME_2 = "Burande.";

const PARAGRAPHS_PART_1 = [
  "I’m a Software Developer and an Author — a combination people often find a little unusual. But for me, these are two of the things I genuinely love doing.",
  "As a developer, I build things that people can interact with. As a writer, I try to create thoughts that people can connect with.",
  "I built this website with a simple purpose: to help people who want to grow, become better versions of themselves, and find their own direction in life.",
  "Sometimes, we know we want to become something, but we don’t know what. Sometimes, we have dreams but lack patience. And sometimes, all we need is the right thought at the right moment to remind us to keep going.",
  "Through my writing, I want to create a space where people can pause, reflect, find clarity, stay patient, and keep growing."
];

const SUBTITLE_TEXT = "But why should you believe in me?";

const PARAGRAPHS_PART_2 = [
  "Honestly, I don’t claim to have all the answers. I’m not here as someone who has transformed thousands of lives or has everything figured out.",
  "I’m simply someone who is still learning, growing, experiencing, and figuring life out — just like you.",
  "What I can do is share the thoughts, lessons, experiences, and perspectives that have helped me along the way.",
  "And with my background in technology, I decided to turn that idea into something more than just words — a website where thoughts, creativity, technology, and personal growth come together.",
  "Maybe I won’t have the answer to everything.",
  "But if even one thought here helps you understand yourself a little better, gives you patience when you need it, or reminds you not to give up on yourself — then this website has served its purpose."
];

export default function AboutPage() {
  const [typedName1, setTypedName1] = useState('');
  const [typedName2, setTypedName2] = useState('');
  const [typedP1, setTypedP1] = useState(PARAGRAPHS_PART_1.map(() => ''));
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [typedP2, setTypedP2] = useState(PARAGRAPHS_PART_2.map(() => ''));
  const [isDone, setIsDone] = useState(false);

  const audioCtxRef = useRef(null);
  const audioBufRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioPoolRef = useRef([]);
  const poolIdxRef = useRef(0);
  const lastTapRef = useRef(-1);

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

  const markerRef = useRef(null);

  // Auto-scroll page as text appears
  useEffect(() => {
    if (!isDone && markerRef.current) {
      const rect = markerRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 80) {
        window.scrollTo({
          top: window.scrollY + (rect.bottom - (window.innerHeight - 80)),
          behavior: 'smooth'
        });
      }
    }
  }, [typedName1, typedName2, typedP1, typedSubtitle, typedP2, isDone]);

  useEffect(() => {
    let timeoutId;

    let stage = 0; // 0: Name1, 1: Name2, 2: P1, 3: Subtitle, 4: P2
    let charIdx = 0;
    let arrayIdx = 0;

    const typeNext = () => {
      const speed = 14;

      if (stage === 0) {
        if (charIdx < NAME_1.length) {
          const char = NAME_1[charIdx];
          setTypedName1(NAME_1.slice(0, charIdx + 1));
          playTap(char === ' ');
          charIdx++;
          timeoutId = setTimeout(typeNext, speed + Math.random() * 10);
        } else {
          stage = 1;
          charIdx = 0;
          timeoutId = setTimeout(typeNext, 120);
        }
      } else if (stage === 1) {
        if (charIdx < NAME_2.length) {
          const char = NAME_2[charIdx];
          setTypedName2(NAME_2.slice(0, charIdx + 1));
          playTap(char === ' ');
          charIdx++;
          timeoutId = setTimeout(typeNext, speed + Math.random() * 10);
        } else {
          stage = 2;
          charIdx = 0;
          arrayIdx = 0;
          timeoutId = setTimeout(typeNext, 200);
        }
      } else if (stage === 2) {
        if (arrayIdx < PARAGRAPHS_PART_1.length) {
          const currentFull = PARAGRAPHS_PART_1[arrayIdx];
          if (charIdx < currentFull.length) {
            const char = currentFull[charIdx];
            setTypedP1(prev => {
              const copy = [...prev];
              copy[arrayIdx] = currentFull.slice(0, charIdx + 1);
              return copy;
            });
            playTap(char === ' ');
            charIdx++;
            timeoutId = setTimeout(typeNext, speed + Math.random() * 8);
          } else {
            arrayIdx++;
            charIdx = 0;
            timeoutId = setTimeout(typeNext, 180);
          }
        } else {
          stage = 3;
          charIdx = 0;
          timeoutId = setTimeout(typeNext, 220);
        }
      } else if (stage === 3) {
        if (charIdx < SUBTITLE_TEXT.length) {
          const char = SUBTITLE_TEXT[charIdx];
          setTypedSubtitle(SUBTITLE_TEXT.slice(0, charIdx + 1));
          playTap(char === ' ');
          charIdx++;
          timeoutId = setTimeout(typeNext, speed + Math.random() * 10);
        } else {
          stage = 4;
          charIdx = 0;
          arrayIdx = 0;
          timeoutId = setTimeout(typeNext, 200);
        }
      } else if (stage === 4) {
        if (arrayIdx < PARAGRAPHS_PART_2.length) {
          const currentFull = PARAGRAPHS_PART_2[arrayIdx];
          if (charIdx < currentFull.length) {
            const char = currentFull[charIdx];
            setTypedP2(prev => {
              const copy = [...prev];
              copy[arrayIdx] = currentFull.slice(0, charIdx + 1);
              return copy;
            });
            playTap(char === ' ');
            charIdx++;
            timeoutId = setTimeout(typeNext, speed + Math.random() * 8);
          } else {
            arrayIdx++;
            charIdx = 0;
            timeoutId = setTimeout(typeNext, 180);
          }
        } else {
          setIsDone(true);
        }
      }
    };

    timeoutId = setTimeout(typeNext, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ShopProvider>
      <div className="veil" aria-hidden="true"></div>

      <Header />

      <main style={{ minHeight: 'calc(100vh - 250px)', backgroundColor: 'var(--ivory)', padding: '50px 24px 90px' }}>
        <style>{`
          .about-hero-grid {
            display: grid;
            grid-template-columns: minmax(320px, 440px) 1fr;
            gap: clamp(36px, 5vw, 64px);
            align-items: start;
            max-width: 1180px;
            margin: 0 auto;
          }
          @media (max-width: 900px) {
            .about-hero-grid {
              grid-template-columns: 1fr;
              gap: 36px;
            }
          }
        `}</style>

        <div className="about-hero-grid">
          {/* Left Column: Image in Arch Frame */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '440px', 
                margin: '0 auto',
                borderRadius: '260px 260px 28px 28px', 
                overflow: 'hidden', 
                background: 'linear-gradient(165deg, #F9DCE3 0%, #F4C4D1 100%)',
                boxShadow: '0 24px 50px -12px rgba(180, 100, 120, 0.16), 0 2px 12px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <img 
                src="/assets/profile.png" 
                alt="Saniya Burande" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block', 
                  objectFit: 'cover'
                }} 
              />
            </div>
          </div>

          {/* Right Column: Hero Typography & Bio Content */}
          <div style={{ textAlign: 'left', paddingTop: '8px' }}>
            {/* Top Tagline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{ 
                fontFamily: 'var(--text)', 
                letterSpacing: '0.35em', 
                fontSize: '0.88rem', 
                fontWeight: 600, 
                color: 'var(--ink-75)', 
                textTransform: 'uppercase' 
              }}>
                H E Y , &nbsp; I ’ M
              </span>
              <div style={{ flex: 1, maxWidth: '240px', height: '1px', backgroundColor: '#E2ADB7', opacity: 0.8 }}></div>
            </div>

            {/* Hero Name Header */}
            <h1 style={{ 
              fontFamily: 'var(--serif)', 
              fontSize: 'clamp(3.2rem, 5.8vw, 5.2rem)', 
              lineHeight: 1.02, 
              fontWeight: 700, 
              letterSpacing: '-0.02em', 
              marginBottom: '28px',
              marginTop: 0
            }}>
              <span style={{ color: 'var(--ink)', display: 'block' }}>
                {typedName1}
              </span>
              <span style={{ color: '#B56673', display: 'block' }}>
                {typedName2}
              </span>
            </h1>

            {/* Bio Paragraphs */}
            <div style={{ fontFamily: 'var(--text)', fontSize: '1.08rem', lineHeight: '1.85', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {typedP1.map((pText, i) => (
                pText ? <p key={`p1-${i}`}>{pText}</p> : null
              ))}

              {typedSubtitle && (
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.45rem', color: 'var(--ink)', marginTop: '24px', marginBottom: '4px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {typedSubtitle}
                </h2>
              )}

              {typedP2.map((pText, i) => {
                if (!pText) return null;
                if (i === PARAGRAPHS_PART_2.length - 1) {
                  return (
                    <p key={`p2-${i}`} style={{ fontStyle: 'italic', color: 'var(--ink-75)', borderLeft: '3px solid #E2ADB7', paddingLeft: '18px', margin: '12px 0' }}>
                      {pText}
                    </p>
                  );
                }
                return <p key={`p2-${i}`}>{pText}</p>;
              })}

              <div ref={markerRef} style={{ height: '1px' }} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Butterfly />

      <PageEffects />
    </ShopProvider>
  );
}





