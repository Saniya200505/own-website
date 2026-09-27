'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LogoIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5c4.5-1.8 9-1.2 13 2 4-3.2 8.5-3.8 13-2v16c-4.5-1.8-9-1.2-13 2-4-3.2-8.5-3.8-13-2z" />
    <path d="M16 10.5v16" />
  </svg>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  /* ---------- header on scroll ---------- */
  useEffect(() => {
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        setScrolled(y > 8);
        setHidden(y > lastY && y > 240);
        lastY = y;
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`} id="header">
      <div className="nav wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Link className="logo" href="/" aria-label="NIVANT, back to home page" style={{ margin: '0 auto' }}>
          <LogoIcon />
          NIVANT.
        </Link>
      </div>
    </header>
  );
}
