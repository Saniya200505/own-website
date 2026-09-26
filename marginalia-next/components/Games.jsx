'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

const TABS = [
  ['all', 'All Games'],
  ['mindset', 'Mindset'],
  ['creativity', 'Creativity'],
  ['self', 'Self Growth'],
  ['reflect', 'Reflect'],
  ['relax', 'Relax'],
  ['strategy', 'Strategy'],
];

const GAMES = [
  {
    game: 'piece-it-together', title: 'Piece It Together', sub: ['CALM YOUR MIND,', 'ONE PIECE AT A TIME.'], btn: 'rose',
    img: '30_image_puzzle.png', imgAlt: 'Piece It Together puzzle artwork',
    sticky: '13_sticky_small_steps.png', stickyAlt: 'Small Steps Big Wins ♡',
    icon: '23_icon_puzzle.png', iconAlt: 'Puzzle piece icon',
  },
  {
    game: 'goal-quest', title: 'Goal Quest', sub: ['TURN DREAMS INTO', 'SMALL WINS.'], btn: 'terracotta',
    img: '31_image_target.png', imgAlt: 'Goal Quest target artwork',
    sticky: '14_sticky_dream_plan.png', stickyAlt: 'Dream Plan Play ♡',
    icon: '24_icon_target.png', iconAlt: 'Target bullseye icon',
  },
  {
    game: 'bright-ideas', title: 'Bright Ideas', sub: ['SPARK CREATIVITY,', 'ANYTIME.'], btn: 'rose',
    img: '32_image_ideas_books.png', imgAlt: 'Bright Ideas lightbulb artwork',
    sticky: '15_sticky_ideas.png', stickyAlt: 'Ideas Change Everything ♡',
    icon: '25_icon_lightbulb.png', iconAlt: 'Lightbulb icon',
  },
  {
    game: 'just-to-play', title: 'Just to Play', sub: ['PLAY. LAUGH. RECHARGE.'], btn: 'mauve',
    img: '33_image_game_controller.png', imgAlt: 'Just to Play controller artwork',
    sticky: '16_sticky_play_laugh.png', stickyAlt: 'Play Laugh Recharge ♡',
    icon: '26_icon_controller.png', iconAlt: 'Game controller icon',
  },
  {
    game: 'mind-gym', title: 'Mind Gym', sub: ['STRONGER THOUGHTS,', 'HAPPIER YOU.'], btn: 'brown',
    img: '34_image_mind_gym_stones.png', imgAlt: 'Mind Gym zen stones artwork',
    sticky: '17_sticky_calmer_happier.png', stickyAlt: 'A Calmer Happier You ♡',
    icon: '27_icon_lotus.png', iconAlt: 'Lotus zen icon',
  },
];

export default function Games() {
  const [active, setActive] = useState('all');
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);
  const shelfRef = useRef(null);

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- games shelf & tabs ---------- */
  const selectTab = cat => {
    if (active === cat) return;
    setActive(cat);
    const shelf = shelfRef.current;
    if (shelf) {
      shelf.style.opacity = '0.5';
      setTimeout(() => { shelf.style.opacity = '1'; }, 200);
    }
  };

  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const updateArrows = () => {
      const max = shelf.scrollWidth - shelf.clientWidth - 4;
      setPrevDisabled(shelf.scrollLeft <= 4);
      setNextDisabled(shelf.scrollLeft >= max);
    };
    shelf.addEventListener('scroll', updateArrows, { passive: true });
    addEventListener('resize', updateArrows);
    updateArrows();
    return () => {
      shelf.removeEventListener('scroll', updateArrows);
      removeEventListener('resize', updateArrows);
    };
  }, []);

  const scrollShelf = left => shelfRef.current && shelfRef.current.scrollBy({ left, behavior: reduce() ? 'auto' : 'smooth' });

  return (
    <section className="discover" id="store" aria-labelledby="discoverTitle">
      <div className="wrap">
        <div className="games-eyebrow">
          <span>PLAY</span> ✦ <span>EXPLORE</span> ✦ <span>GROW</span>
        </div>
        <div className="discover-head">
          <h2 id="discoverTitle" className="games-headline">
            Have no interest<br />
            in reading? It’s fine.<br />
            <span className="games-line">Come, <em>let’s play</em> <span className="games-pink">Games</span> <span className="heart-doodle" aria-hidden="true">♡</span></span>
          </h2>
        </div>
        <div className="shelf-bar">
          <div className="tabs" id="tabs" role="group" aria-label="Filter by category">
            {TABS.map(([cat, label]) => (
              <button key={cat} className="tab" aria-pressed={active === cat} data-cat={cat} onClick={() => selectTab(cat)}>{label}</button>
            ))}
          </div>
          <div className="shelf-nav">
            <button className="icon-btn prev" id="prev" aria-label="Scroll games left" disabled={prevDisabled} onClick={() => scrollShelf(-320)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <button className="icon-btn next" id="next" aria-label="Scroll games right" disabled={nextDisabled} onClick={() => scrollShelf(320)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="shelf reveal" id="shelf" ref={shelfRef} tabIndex={0} aria-label="Games">
        {GAMES.map(g => (
          <article className="game-card" key={g.game}>
            <div className="game-card-media">
              <img src={`/assets/${g.img}`} alt={g.imgAlt} className="game-card-img" />
              <img src={`/assets/${g.sticky}`} alt={g.stickyAlt} className="game-sticky-note" />
              <div className="game-icon-badge">
                <img src={`/assets/${g.icon}`} alt={g.iconAlt} />
              </div>
            </div>
            <div className="game-card-body">
              <h3 className="game-card-title">{g.title}</h3>
              <p className="game-card-sub">
                {g.sub.map((line, i) => <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>)}
              </p>
              <button className={`game-btn game-btn--${g.btn}`} data-game={g.game}>
                Play Now <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
