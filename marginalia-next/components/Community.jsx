'use client';

import { useState } from 'react';
import { useShop } from './ShopProvider';
import Avatar, { people } from './Avatar';

const EVENTS = [
  { day: '17', month: 'Sep', title: 'Silent reading hour', desc: "Thursday, 7 pm in the shop. Bring a book, we'll bring the tea.", event: 'Silent reading hour' },
  { day: '26', month: 'Sep', title: 'Poetry swap with June Aldana', desc: 'Saturday, 4 pm. Read one poem you love, leave with another.', event: 'Poetry swap' },
  { day: '8', month: 'Oct', title: 'Book club: The Orchard Year', desc: 'Thursday, 7 pm. Cider, spoilers and a very long table.', event: 'The Orchard Year book club' },
];

const check = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

/* ---------- events RSVP ---------- */
function Rsvp({ event }) {
  const { say } = useShop();
  const [on, setOn] = useState(false);
  const toggle = () => {
    const next = !on;
    setOn(next);
    say(next ? `Seat saved for ${event}` : `Seat released for ${event}`);
  };
  return (
    <button className="rsvp" aria-pressed={on} data-event={event} onClick={toggle}>
      {on ? <>{check}Seat saved</> : 'Save a seat'}
    </button>
  );
}

export default function Community() {
  return (
    <section className="community wrap" id="community" aria-labelledby="communityTitle">
      <div className="community-grid">
        <div className="community-copy">
          <div className="faces reveal" id="faces">
            {people.map((p, i) => <span className="face" style={{ '--i': i }} key={i}><Avatar p={p} /></span>)}
            <span className="face face-count" style={{ '--i': 5 }}>4K+</span>
            <span className="faces-label"><b>4K+ book lovers</b>in our reading circle</span>
          </div>
          <h2 id="communityTitle">A bookshop is really just its readers.</h2>
          <p>It started with six neighbours swapping paperbacks on a Sunday afternoon. Now more than four thousand of us meet in the shop, trade notes in the margins and argue, gently, about endings.</p>
          <a className="btn" href="#letter">Join the reading circle</a>
        </div>
        <div className="gatherings">
          <h3>Upcoming gatherings</h3>
          <ul className="events">
            {EVENTS.map(ev => (
              <li className="event" key={ev.event}>
                <div className="event-date"><b>{ev.day}</b><small>{ev.month}</small></div>
                <div><h4>{ev.title}</h4><p>{ev.desc}</p></div>
                <Rsvp event={ev.event} />
              </li>
            ))}
          </ul>
          <figure className="reader-quote">
            <blockquote>I came in for one novel and left with a book club, three new friends and a to-read pile I'll never finish.</blockquote>
            <figcaption>
              <span className="face" id="quoteFace"><Avatar p={{ bg: '#C9ADAC', skin: '#9A6444', hair: '#21130E', shirt: '#E8D5B8', style: 'bun' }} /></span>
              Farah, reading circle member since 2021
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
