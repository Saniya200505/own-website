/* ---------- reader portraits ---------- */
export const people = [
  { bg: '#E8D5B8', skin: '#8A5A3C', hair: '#21130E', shirt: '#C9ADAC', style: 'curly' },
  { bg: '#C9ADAC', skin: '#EBC7A8', hair: '#6B4A2E', shirt: '#21130E', style: 'bob', glasses: true },
  { bg: '#D9D4D8', skin: '#B97F5A', hair: '#2A1B14', shirt: '#E8D5B8', style: 'bun' },
  { bg: '#E8D5B8', skin: '#F0D2B8', hair: '#A87A50', shirt: '#5E6547', style: 'short' },
  { bg: '#D9D4D8', skin: '#6E4630', hair: '#1A0F0B', shirt: '#8B6F63', style: 'short', glasses: true },
];

const hairBack = {
  bob: h => <path d="M21 40 C 19 20 29 12 40 12 C 52 12 61 20 59 40 L 60 56 C 55 59 50 59 47 57 L 47 40 L 33 40 L 33 57 C 30 59 25 59 20 56 Z" fill={h} />,
  bun: h => <circle cx="40" cy="12" r="8.5" fill={h} />,
  curly: h => [[26, 28, 9], [31, 19, 9], [40, 15, 9], [49, 19, 9], [54, 28, 9], [24, 38, 7], [56, 38, 7]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={h} />),
  short: () => null,
};

const hairFront = {
  bob: h => <path d="M25 34 C 26 22 33 18 41 18 C 49 18 55 24 55 33 C 47 30 37 28 25 34 Z" fill={h} />,
  bun: h => <path d="M25.5 35 C 24 23 32 19 40 19 C 49 19 56 24 54.5 35 C 49 28 32 28 25.5 35 Z" fill={h} />,
  curly: () => null,
  short: h => <path d="M25 36 C 23 21 33 15 42 16 C 52 17 58 25 56 36 C 52 28 44 25.5 36 26.5 C 30 27.5 26.5 31 25 36 Z" fill={h} />,
};

export default function Avatar({ p }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <rect width="80" height="80" fill={p.bg} />
      {hairBack[p.style](p.hair)}
      <path d="M10 82 C 12 62 26 55 40 55 C 54 55 68 62 70 82 Z" fill={p.shirt} />
      <rect x="35" y="45" width="10" height="13" rx="4" fill={p.skin} />
      <ellipse cx="40" cy="37" rx="13" ry="15" fill={p.skin} />
      {hairFront[p.style](p.hair)}
      {p.glasses && (
        <g fill="none" stroke="#21130E" strokeWidth="1.4"><circle cx="34.5" cy="39" r="4.2" /><circle cx="45.5" cy="39" r="4.2" /><path d="M38.7 38.6 H 41.3" /></g>
      )}
    </svg>
  );
}
