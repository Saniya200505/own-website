'use client';

import { useRef, useState } from 'react';

const STAR = 'M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z';

// placeholder app QR
const QR = (() => {
  let seed = 20260911; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const n = 25, inF = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const r = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inF(x, y) && rnd() > .5) r.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  const f = (x, y) => [
    <rect key={`f${x}-${y}-a`} x={x} y={y} width="7" height="7" />,
    <rect key={`f${x}-${y}-b`} x={x + 1} y={y + 1} width="5" height="5" fill="#F8F3EE" />,
    <rect key={`f${x}-${y}-c`} x={x + 2} y={y + 2} width="3" height="3" />,
  ];
  return <g fill="#21130E">{r}{f(0, 0)}{f(n - 7, 0)}{f(0, n - 7)}</g>;
})();

export default function Newsletter() {
  const emailRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [invalid, setInvalid] = useState(false);

  /* ---------- newsletter ---------- */
  const onSubmit = e => {
    e.preventDefault();
    const email = emailRef.current;
    const v = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setMsg('Enter an email address like name@example.com.');
      setInvalid(true); email.focus(); return;
    }
    setInvalid(false);
    setMsg('Subscribed. Your first letter arrives on Sunday.');
    e.currentTarget.reset();
  };

  return (
    <section className="letter wrap" id="letter" aria-labelledby="letterTitle">
      <div className="letter-panel">
        <span className="lp-circle drift drift--slow" aria-hidden="true"></span>
        <span className="lp-slab" aria-hidden="true"></span>
        <svg className="star-l drift" style={{ width: '22px', top: '16%', left: '14%' }} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} /></svg>
        <svg className="star-l drift drift--slow" style={{ width: '14px', top: '26%', left: '19%', opacity: .7 }} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} /></svg>
        <svg className="doodle drift" style={{ width: '70px', height: '40px', right: '15%', bottom: '22%' }} viewBox="0 0 70 40" aria-hidden="true"><path d="M4 30 C 16 8, 26 36, 36 18 S 56 6, 66 20" /></svg>
        <h2 id="letterTitle">A little reading inspiration, delivered.</h2>
        <p>One letter every other Sunday: three books we can't stop talking about, a short extract, and what's just arrived on the shelves.</p>
        <form className="subscribe" id="subscribe" noValidate onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="email">Email address</label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            name="email"
            placeholder="Your email address"
            autoComplete="email"
            aria-describedby="formMsg"
            aria-invalid={invalid ? 'true' : undefined}
          />
          <button type="submit">Subscribe
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
          </button>
        </form>
        <p className="form-msg" id="formMsg" role="status">{msg}</p>
        <div className="app-qr">
          <svg id="qr" viewBox="0 0 25 25" shapeRendering="crispEdges" aria-hidden="true">{QR}</svg>
          <span>Prefer an app?<br />Scan to download</span>
        </div>
      </div>
    </section>
  );
}
