const HOTSPOTS = [
  { top: '22%', left: '16%', tooltip: 'HAPPY: Find joy in the little things ↗', label: 'Happy note', align: 'left' },
  { top: '20%', left: '69%', tooltip: 'GROWTH: A better version of me everyday ↗', label: 'Growth note', align: 'center' },
  { top: '47%', left: '16%', tooltip: 'MOTIVATION: Small steps big progress ↗', label: 'Motivation note', align: 'left' },
  { top: '47%', left: '71%', tooltip: 'GRATITUDE: More of what makes me smile ↗', label: 'Gratitude note', align: 'center' },
  { top: '76%', left: '14%', tooltip: 'INSPIRATION: A kinder, brighter, braver you ↗', label: 'Inspiration note', align: 'left' },
  { top: '74%', left: '70%', tooltip: 'SELF LOVE: Kind mind, brave heart, happy soul ↗', label: 'Self love note', align: 'center' },
  { top: '88%', left: '50%', tooltip: 'Create ✦ Grow ✦ Shine ↗', label: 'Pill badge', align: 'center' },
  { top: '19%', left: '88%', tooltip: 'Morning Latte ☕ ↗', label: 'Coffee cup', align: 'right' },
];

export default function MoodBoard() {
  return (
    <section className="gallery wrap" id="about" aria-label="Mood board">
      <div className="moodboard-container reveal-img">
        <div className="moodboard-wrapper">
          <img
            src="/assets/moodboard.jpg"
            alt="The mood board above the till: handwritten notes pinned and taped to a pale wooden desk. Happy, find joy in the little things. Motivation, small steps big progress. Inspiration, a kinder, brighter, braver you. Growth, a better version of me everyday. Gratitude, more of what makes me smile. Self love, kind mind, brave heart, happy soul. A plum notebook with a gold line butterfly sits in the middle, beside polaroids, a cup of coffee, reading glasses, blossom and a pink pen."
            className="moodboard-img"
          />

          {/* Interactive hotspot links */}
          {HOTSPOTS.map(h => (
            <a
              key={h.label}
              href="about:blank"
              target="_blank"
              rel="noopener noreferrer"
              className={`moodboard-hotspot align-${h.align || 'center'}`}
              style={{ top: h.top, left: h.left }}
              data-tooltip={h.tooltip}
              aria-label={h.label}
            ></a>
          ))}
        </div>
      </div>
    </section>
  );
}
