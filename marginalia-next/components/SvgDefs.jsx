export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFA274" /><stop offset=".55" stopColor="#B8885B" /><stop offset="1" stopColor="#976841" />
        </linearGradient>
        <linearGradient id="linen" x1="0" y1="0" x2="1" y2=".4">
          <stop offset="0" stopColor="#CDBFC1" /><stop offset="1" stopColor="#BBA7A8" />
        </linearGradient>
        <radialGradient id="sunlight" cx=".78" cy=".12" r=".85">
          <stop offset="0" stopColor="#FFF3DF" stopOpacity=".6" /><stop offset=".55" stopColor="#FFF3DF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="coffee" cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#8A5A38" /><stop offset=".55" stopColor="#5A3520" /><stop offset="1" stopColor="#2E1A10" />
        </radialGradient>
        <linearGradient id="bookDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A2530" /><stop offset="1" stopColor="#22141B" />
        </linearGradient>
        <pattern id="pageEdge" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="#F3EADC" /><rect width="3" height="1" fill="#DCCDB6" />
        </pattern>
        <filter id="dropsoft" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="14" dy="20" stdDeviation="16" floodColor="#21130E" floodOpacity=".32" />
        </filter>
        <filter id="blurLeaf" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="11" /></filter>
        <filter id="grainF" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 .13  0 0 0 0 .08  0 0 0 0 .05  0 0 0 .22 0" />
        </filter>
        <g id="mothHalf">
          <path d="M-7 -44 C -58 -106 -140 -82 -118 -26 C -104 8 -44 2 -7 -28" />
          <path d="M-7 -18 C -56 -4 -80 44 -46 54 C -24 60 -12 26 -6 2" />
          <path d="M-18 -46 C -52 -70 -88 -70 -100 -46" />
          <path d="M-30 -24 C -60 -28 -86 -22 -98 -12" />
          <path d="M-3 -62 C -9 -86 -24 -98 -38 -96" />
        </g>
        <g id="scene">
          <rect width="1200" height="520" fill="url(#wood)" />
          <g fill="none" stroke="#6E4A2C" strokeOpacity=".2" strokeWidth="2">
            <path d="M0 38 C 260 20 520 70 820 42 S 1120 30 1200 50" />
            <path d="M0 96 C 300 80 540 124 860 98 S 1110 88 1200 104" />
            <path d="M0 162 C 240 150 560 196 900 164 S 1130 150 1200 170" strokeOpacity=".12" />
            <path d="M0 238 C 320 222 600 262 880 236 S 1100 226 1200 244" />
            <path d="M0 312 C 280 298 580 340 840 314 S 1120 300 1200 320" strokeOpacity=".14" />
            <path d="M0 384 C 300 368 560 410 870 386 S 1130 372 1200 392" />
            <path d="M0 452 C 260 440 540 482 860 456 S 1120 446 1200 462" strokeOpacity=".12" />
            <path d="M0 506 C 300 494 600 520 900 500 S 1120 496 1200 510" />
            <ellipse cx="1010" cy="352" rx="46" ry="12" strokeOpacity=".16" />
            <ellipse cx="1010" cy="352" rx="24" ry="6" strokeOpacity=".12" />
          </g>
          {/* linen */}
          <path d="M0 0 H300 C 270 110 350 250 280 380 C 250 440 270 490 262 520 H0 Z" fill="url(#linen)" />
          <g fill="none" stroke="#F3ECEA" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round">
            <path d="M40 30 C 90 140 60 260 110 400" /><path d="M150 0 C 170 120 140 240 190 360" /><path d="M230 60 C 250 170 230 280 250 380" strokeOpacity=".3" />
          </g>
          <g fill="none" stroke="#8E7576" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round">
            <path d="M70 0 C 110 120 90 250 140 420" /><path d="M200 20 C 210 130 190 260 220 470" />
          </g>
          {/* pencil */}
          <g transform="translate(330 452) rotate(-9)" filter="url(#dropsoft)">
            <rect x="0" y="-7" width="210" height="14" rx="2" fill="#D9B679" />
            <rect x="0" y="-7" width="210" height="4" fill="#E8CD97" />
            <rect x="-18" y="-7" width="20" height="14" rx="3" fill="#C9ADAC" />
            <path d="M210 -7 L 244 0 L 210 7 Z" fill="#F0DDC0" />
            <path d="M234 -2 L 244 0 L 234 2 Z" fill="#21130E" />
          </g>
          {/* book stack */}
          <g transform="translate(575 262) rotate(-22)">
            <g filter="url(#dropsoft)">
              <rect x="-300" y="-150" width="570" height="340" rx="8" fill="#E6D6BD" />
              <rect x="-296" y="182" width="560" height="14" fill="url(#pageEdge)" />
              <rect x="266" y="-146" width="12" height="332" fill="url(#pageEdge)" />
            </g>
            <path d="M-300 -150 H -266 V 190 H -300 Z" fill="#D2BFA2" />
            <g transform="translate(-26 -24) rotate(5)" filter="url(#dropsoft)">
              <rect x="-250" y="-168" width="500" height="318" rx="7" fill="url(#bookDark)" />
              <rect x="250" y="-162" width="12" height="306" fill="url(#pageEdge)" />
              <rect x="-250" y="-168" width="26" height="318" fill="#170D12" opacity=".5" />
              <g transform="translate(20 -8)" fill="none" stroke="#D8B97E" strokeWidth="2.2" strokeLinecap="round">
                <use href="#mothHalf" /><use href="#mothHalf" transform="scale(-1 1)" />
                <ellipse cx="0" cy="-26" rx="8" ry="36" />
                <path d="M-6 -40 H 6 M-7 -26 H 7 M-6 -12 H 6" strokeWidth="1.4" />
              </g>
              <text x="20" y="116" fill="#D8B97E" fontFamily="Georgia, serif" fontSize="17" letterSpacing="9" textAnchor="middle">MOTH HYMNS</text>
            </g>
          </g>
          {/* coffee */}
          <g transform="translate(1016 132)" filter="url(#dropsoft)">
            <circle r="100" fill="#F4ECE2" />
            <circle r="84" fill="none" stroke="#E4D6C4" strokeWidth="3" />
            <rect x="52" y="-14" width="72" height="28" rx="14" fill="#EDE2D3" transform="rotate(28)" />
            <circle r="64" fill="#EFE5D7" />
            <circle r="54" fill="url(#coffee)" />
            <path d="M-34 -18 C -20 -36 14 -40 30 -22" fill="none" stroke="#C49A6C" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* glasses */}
          <g transform="translate(900 408) rotate(-14)" fill="none" stroke="#21130E" strokeWidth="6" strokeLinecap="round">
            <path d="M-150 -20 L -86 -6" strokeWidth="5" /><path d="M150 -20 L 86 -6" strokeWidth="5" />
            <circle cx="-50" cy="0" r="38" fill="#F8F3EE" fillOpacity=".14" />
            <circle cx="50" cy="0" r="38" fill="#F8F3EE" fillOpacity=".14" />
            <path d="M-13 -6 Q 0 -18 13 -6" />
            <path d="M-66 -20 A 24 24 0 0 1 -40 -30" stroke="#FFF6E8" strokeOpacity=".55" strokeWidth="3" />
            <path d="M34 -20 A 24 24 0 0 1 60 -30" stroke="#FFF6E8" strokeOpacity=".55" strokeWidth="3" />
          </g>
          {/* leaf shadows */}
          <g fill="#21130E" opacity=".2" filter="url(#blurLeaf)">
            <path d="M1200 -20 C 1080 60 960 120 820 150" stroke="#21130E" strokeWidth="10" fill="none" />
            <ellipse cx="1120" cy="40" rx="70" ry="24" transform="rotate(-30 1120 40)" />
            <ellipse cx="1040" cy="96" rx="64" ry="22" transform="rotate(20 1040 96)" />
            <ellipse cx="950" cy="120" rx="60" ry="20" transform="rotate(-24 950 120)" />
            <ellipse cx="870" cy="160" rx="54" ry="18" transform="rotate(26 870 160)" />
            <ellipse cx="1150" cy="130" rx="58" ry="20" transform="rotate(40 1150 130)" />
          </g>
          <rect width="1200" height="520" fill="url(#sunlight)" />
          <rect width="1200" height="520" filter="url(#grainF)" />
        </g>
      </defs>
    </svg>
  );
}
