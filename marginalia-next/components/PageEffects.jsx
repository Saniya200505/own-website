'use client';

import { useEffect } from 'react';

export default function PageEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];

    /* ---------- scroll reveals ---------- */
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const t = en.target;
      t.classList.add('is-in');
      if (t.hasAttribute('data-reveal-group')) $$('.reveal-img', t).forEach(el => el.classList.add('is-in'));
      io.unobserve(t);
    }), { threshold: .05, rootMargin: '0px 0px -4% 0px' });
    $$('.reveal, .reveal-img, [data-reveal-group]').forEach(el => io.observe(el));

    /* ---------- load sequence ---------- */
    let cancelled = false;
    const go = () => requestAnimationFrame(() => { if (!cancelled) root.classList.add('is-loaded'); });
    (document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))])
      : Promise.resolve()).then(go);

    return () => { cancelled = true; io.disconnect(); };
  }, []);

  return null;
}
