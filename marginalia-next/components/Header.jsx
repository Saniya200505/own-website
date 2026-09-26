'use client';

import { useEffect, useRef, useState } from 'react';
import { useShop } from './ShopProvider';

const LogoIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5c4.5-1.8 9-1.2 13 2 4-3.2 8.5-3.8 13-2v16c-4.5-1.8-9-1.2-13 2-4-3.2-8.5-3.8-13-2z" /><path d="M16 10.5v16" /></svg>
);

const MENU_LINKS = [
  ['#store', 'Store'],
  ['#collections', "This month's pick"],
  ['#community', 'Reading circle'],
  ['#letter', 'Newsletter'],
];

export default function Header() {
  const { bag, bump } = useShop();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const openRef = useRef(false);
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);
  const bagRef = useRef(null);

  /* ---------- menu ---------- */
  const setMenu = next => {
    openRef.current = next;
    setOpen(next);
    setHidden(false);
    if (next) setTimeout(() => firstLinkRef.current && firstLinkRef.current.focus({ preventScroll: true }), 300);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
  }, [open]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && openRef.current) { setMenu(false); menuBtnRef.current.focus(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  /* ---------- header on scroll ---------- */
  useEffect(() => {
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        setScrolled(y > 8);
        if (!openRef.current) setHidden(y > lastY && y > 240);
        lastY = y;
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  /* ---------- bag bump ---------- */
  useEffect(() => {
    const el = bagRef.current;
    if (!bump || !el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }, [bump]);

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`} id="header">
        <div className="nav wrap">
          <a className="logo" href="#top" aria-label="Marginalia, back to top">
            <LogoIcon />
            Marginalia.
          </a>
          <button
            className="menu-btn"
            id="menuBtn"
            ref={menuBtnRef}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setMenu(!openRef.current)}
          ><span></span><span></span></button>
          <nav className="nav-links" aria-label="Primary">
            <a className="txt" href="#about">About</a>
            <a className="txt" href="#store">Store</a>
            <a className="txt" href="#collections">Collections</a>
            <a className="txt" href="#contact">Contact</a>
            <a className="bag" href="#store" id="bag" ref={bagRef} aria-label={`Bag, ${bag} ${bag === 1 ? 'item' : 'items'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
              <span className="bag-count" id="bagCount">{bag}</span>
            </a>
          </nav>
        </div>
      </header>

      <div className="menu" id="menu" aria-hidden={!open}>
        <div className="menu-inner wrap">
          <ul>
            {MENU_LINKS.map(([href, label], i) => (
              <li key={href}>
                <a href={href} style={{ '--i': i }} ref={i === 0 ? firstLinkRef : undefined} onClick={() => setMenu(false)}>{label}</a>
              </li>
            ))}
          </ul>
          <div className="menu-aside">
            <strong>Visit the shop</strong>
            14 Linden Row. Open every day, 10 am to 8 pm, with tea on the counter from 4.
          </div>
        </div>
      </div>
    </>
  );
}
