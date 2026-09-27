'use client';

import { useEffect, useRef } from 'react';
import { loadThree } from '../lib/loadThree';
import initGirl from '../lib/initGirl';

/* when girl.glb is running, the 3D character owns these beats instead */
const char3d = () => (window.heroCharacter && window.heroCharacter.active ? window.heroCharacter : null);

export default function Hero() {
  const heroRef = useRef(null);
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  /* ---------- 3D hero character (girl.glb) ---------- */
  useEffect(() => {
    let cleanup = null, cancelled = false;
    loadThree().then(() => {
      if (cancelled) return;
      cleanup = initGirl({
        canvas: canvasRef.current,
        stage: stageRef.current,
        wrapper: wrapperRef.current,
        hero: heroRef.current,
      });
    });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, []);

  /* ---------- hero interactive cursor tracking & wave ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      const wrap = wrapperRef.current;
      if (wrap && !char3d()) wrap.classList.add('is-entered');
    }, 3300);
    return () => clearTimeout(t);
  }, []);

  const onContentEnter = () => {
    const c = char3d();
    if (c) { c.wave(); return; }
    const wrap = wrapperRef.current;
    if (wrap && wrap.classList.contains('is-entered') && !wrap.classList.contains('is-waving')) {
      wrap.classList.add('is-waving');
      setTimeout(() => wrap.classList.remove('is-waving'), 950);
    }
  };

  return (
    <section className="hero wrap" id="heroSection" ref={heroRef}>
      <div className="hero-ambient-glow" aria-hidden="true"></div>
      <div className="hero-content" onMouseEnter={onContentEnter}>
        <h1 className="hero-greeting">
          <span className="hero-line hero-line-1"><span className="hero-word-hey">HEY,</span></span>
          <span className="hero-line hero-line-2"><span>GLAD YOU FOUND YOUR WAY</span></span>
          <span className="hero-line hero-line-3"><span>HERE.</span></span>
        </h1>
        <p className="hero-body-text">
          A place where you can relax, find peace, and build something of your own.
        </p>
      </div>
      <div className="hero-visual" id="heroVisual">
        <div className="hero-girl-wrapper" id="heroGirlWrapper" ref={wrapperRef}>
          <div className="hero-girl-stage" id="heroGirlStage" ref={stageRef} role="img" aria-label="A little doll character who looks up, smiles and waves hello. Hover over her and she waves again.">
            <canvas className="hero-girl-canvas" id="heroGirlCanvas" ref={canvasRef} aria-hidden="true"></canvas>
            <img src="/assets/girl.png" alt="" className="hero-girl-img" id="heroGirlImg" />
          </div>
        </div>
      </div>
    </section>
  );
}
