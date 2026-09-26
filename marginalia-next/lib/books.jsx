/* ---------- data ---------- */
const DISPLAY = 'var(--display)', SERIF = 'var(--serif)';

export const books = [
  { id: 'orchard', title: 'The Orchard Year', author: 'Inès Marlow', cat: 'fiction', price: 24, bg: '#DFA3B1', fg: '#24191A', motif: 'leaf', layout: 'stack', font: DISPLAY },
  { id: 'moth', title: 'Moth Hymns', author: 'June Aldana', cat: 'poetry', price: 18, bg: '#4D3237', fg: '#FCE8EC', motif: 'moth', layout: 'top', font: SERIF },
  { id: 'paper', title: 'Paper, Ink & Time', author: 'Meera Kulkarni', cat: 'nonfiction', price: 32, bg: '#F5D1D8', fg: '#24191A', motif: 'lines', layout: 'stack', font: DISPLAY },
  { id: 'middlemarch', title: 'Middlemarch', author: 'George Eliot', cat: 'classics', price: 14, bg: '#5C3A40', fg: '#FCE8EC', motif: 'diamond', layout: 'classic', font: SERIF },
  { id: 'slow', title: 'Slow Mornings', author: 'Priya Deshmukh', cat: 'self', price: 20, bg: '#FCE8EC', fg: '#24191A', motif: 'sun', layout: 'stack', font: DISPLAY },
  { id: 'lisbon', title: 'Small Hours in Lisbon', author: 'Ada Ferreira', cat: 'fiction', price: 22, bg: '#24191A', fg: '#FCE8EC', motif: 'sun', layout: 'top', font: DISPLAY },
  { id: 'archive', title: 'The Quiet Archive', author: 'Hugo Brand', cat: 'nonfiction', price: 28, bg: '#3D272A', fg: '#F5D1D8', motif: 'arch', layout: 'top', font: DISPLAY },
  { id: 'tide', title: 'Letters to the Tide', author: 'Rowan Pike', cat: 'poetry', price: 16, bg: '#FFF5F6', fg: '#80676C', motif: 'moon', layout: 'classic', font: SERIF },
  { id: 'weather', title: 'A Room Full of Weather', author: 'Tomas Okafor', cat: 'fiction', price: 26, bg: '#DFA3B1', fg: '#24191A', motif: 'wave', layout: 'stack', font: DISPLAY },
  { id: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen', cat: 'classics', price: 12, bg: '#C48B98', fg: '#FFFCFC', motif: 'diamond', layout: 'classic', font: SERIF },
  { id: 'unhurried', title: 'The Unhurried Mind', author: 'Leo Sato', cat: 'self', price: 23, bg: '#80676C', fg: '#FFFCFC', motif: 'orbit', layout: 'top', font: DISPLAY },
  { id: 'sea', title: 'Walking to the Sea', author: 'Nadia Haddad', cat: 'nonfiction', price: 21, bg: '#F5D1D8', fg: '#24191A', motif: 'orbit', layout: 'stack', font: DISPLAY },
  { id: 'moby', title: 'Moby-Dick', author: 'Herman Melville', cat: 'classics', price: 15, bg: '#3D272A', fg: '#F5D1D8', motif: 'wave', layout: 'top', font: SERIF },
];

export const byId = id => books.find(b => b.id === id);

/* ---------- cover art ---------- */
const rays = (cx, cy, r1, r2, n) => Array.from({ length: n }, (_, i) => {
  const a = i / n * Math.PI * 2;
  return <line key={i} x1={(cx + Math.cos(a) * r1).toFixed(1)} y1={(cy + Math.sin(a) * r1).toFixed(1)} x2={(cx + Math.cos(a) * r2).toFixed(1)} y2={(cy + Math.sin(a) * r2).toFixed(1)} />;
});

const motifs = {
  sun: () => <><circle cx="50" cy="56" r="17" fill="currentColor" stroke="none" />{rays(50, 56, 24, 38, 14)}</>,
  leaf: () => <>
    <path d="M50 98 C 50 70 48 40 52 6" />
    {[20, 38, 56, 74].map((y, i) => <path key={y} d={`M51 ${y + 10} C ${i % 2 ? 72 : 30} ${y} ${i % 2 ? 84 : 18} ${y + 6} ${i % 2 ? 88 : 12} ${y - 4} C ${i % 2 ? 74 : 26} ${y - 8} ${i % 2 ? 60 : 40} ${y - 2} 51 ${y + 10}Z`} fill="currentColor" fillOpacity=".18" />)}
  </>,
  wave: () => [34, 48, 62, 76].map(y => <path key={y} d={`M4 ${y} C 18 ${y - 10} 30 ${y + 10} 44 ${y} S 70 ${y - 10} 84 ${y} S 96 ${y + 8} 99 ${y + 3}`} />),
  lines: () => <>
    {[18, 30, 42, 54, 66, 78].map((y, i) => <line key={y} x1="8" y1={y} x2={[92, 70, 84, 58, 90, 46][i]} y2={y} />)}
    <circle cx="80" cy="54" r="5" fill="currentColor" />
  </>,
  arch: () => <>
    {[0, 11, 22].map(o => <path key={o} d={`M${16 + o} 98 V ${56 + o * .4} A ${34 - o} ${34 - o} 0 0 1 ${84 - o} ${56 + o * .4} V 98`} />)}
    <circle cx="50" cy="44" r="4" fill="currentColor" />
  </>,
  orbit: () => <><circle cx="50" cy="52" r="30" /><circle cx="50" cy="52" r="18" strokeDasharray="3 5" /><circle cx="80" cy="52" r="5" fill="currentColor" /><circle cx="50" cy="52" r="4" fill="currentColor" /></>,
  moth: () => <g transform="translate(50 62) scale(.36)" strokeWidth="4.4"><use href="#mothHalf" /><use href="#mothHalf" transform="scale(-1 1)" /><ellipse cx="0" cy="-26" rx="8" ry="36" /></g>,
  moon: () => <path d="M62 14 A 38 38 0 1 0 62 86 A 30 30 0 1 1 62 14 Z" fill="currentColor" stroke="none" />,
  diamond: () => <path d="M50 10 L 70 50 L 50 90 L 30 50 Z" fill="currentColor" stroke="none" />,
};

export function Cover({ book: b }) {
  return (
    <div className={`cover cover--${b.layout}`} style={{ '--bg': b.bg, '--fg': b.fg, '--cfont': b.font, color: b.fg }}>
      <div className="cover-inner">
        <span className="cover-title">{b.title}</span>
        <span className="cover-author">{b.author}</span>
        <svg className="cover-motif" viewBox="0 0 100 100" aria-hidden="true">{motifs[b.motif]()}</svg>
      </div>
    </div>
  );
}
