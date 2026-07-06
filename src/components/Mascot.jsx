// Sumnia's mascot: a small hooded scholar reading a book. Concept borrowed
// from the berry-mascot mockup (round hood, kawaii face, open book with the
// wordmark) but rendered in the app's own palette — violet hood with star
// speckles instead of seeds, emerald glass book, azure glow.
export default function Mascot({ size = 150, className = '' }) {
  return (
    <svg
      viewBox="0 0 220 230"
      width={size}
      height={(size * 230) / 220}
      className={className}
      role="img"
      aria-label="Sumnia mascot — a hooded scholar reading a book"
    >
      <defs>
        <radialGradient id="m-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#5cc8ff" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="m-hood" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#8b74f6" />
          <stop offset="100%" stopColor="#4c3d9e" />
        </linearGradient>
        <linearGradient id="m-book" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade9c" />
          <stop offset="100%" stopColor="#1f8f63" />
        </linearGradient>
      </defs>

      {/* ambient glow */}
      <ellipse cx="110" cy="112" rx="105" ry="102" fill="url(#m-glow)" />

      {/* sprout on top */}
      <path
        d="M110 30 C110 22 106 16 100 12"
        fill="none"
        stroke="#2aa876"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M100 12 C88 4 74 6 68 14 C78 22 94 22 100 12 Z" fill="#4ade9c" />
      <path d="M102 14 C112 4 128 4 136 12 C128 22 110 24 102 14 Z" fill="#2aa876" />

      {/* hood */}
      <path
        d="M110 26 C158 26 184 62 181 104 C178 148 148 172 110 172 C72 172 42 148 39 104 C36 62 62 26 110 26 Z"
        fill="url(#m-hood)"
      />
      <path
        d="M110 26 C158 26 184 62 181 104 C178 148 148 172 110 172 C72 172 42 148 39 104 C36 62 62 26 110 26 Z"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
      />

      {/* star speckles (the mockup's seeds, gone celestial) */}
      {[
        [70, 62],
        [150, 62],
        [56, 100],
        [164, 100],
        [88, 44],
        [132, 44],
        [64, 136],
        [156, 136],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 4} L${x + 2.4} ${y} L${x} ${y + 4} L${x - 2.4} ${y} Z`}
          fill="#5cc8ff"
          opacity="0.75"
        />
      ))}

      {/* face */}
      <ellipse cx="110" cy="118" rx="50" ry="44" fill="#e9edf8" />
      <circle cx="91" cy="114" r="6.5" fill="#232a41" />
      <circle cx="129" cy="114" r="6.5" fill="#232a41" />
      <circle cx="93.2" cy="111.8" r="2.2" fill="#ffffff" />
      <circle cx="131.2" cy="111.8" r="2.2" fill="#ffffff" />
      <ellipse cx="77" cy="127" rx="7" ry="4.5" fill="#a78bfa" opacity="0.45" />
      <ellipse cx="143" cy="127" rx="7" ry="4.5" fill="#a78bfa" opacity="0.45" />
      <path
        d="M103 127 Q110 134 117 127"
        fill="none"
        stroke="#232a41"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* open book, cover facing the viewer */}
      <path
        d="M110 178 C92 167 68 166 56 172 L56 208 C68 202 92 203 110 214 Z"
        fill="url(#m-book)"
      />
      <path
        d="M110 178 C128 167 152 166 164 172 L164 208 C152 202 128 203 110 214 Z"
        fill="url(#m-book)"
      />
      <path
        d="M110 178 C92 167 68 166 56 172 L56 208 C68 202 92 203 110 214 Z M110 178 C128 167 152 166 164 172 L164 208 C152 202 128 203 110 214 Z"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <line x1="110" y1="178" x2="110" y2="214" stroke="#0d5c3d" strokeWidth="2.5" />
      <text
        x="110"
        y="196"
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="15"
        fill="#e9edf8"
      >
        ∑umnia
      </text>

      {/* hands on the book edges */}
      <circle cx="57" cy="180" r="8" fill="#e9edf8" />
      <circle cx="163" cy="180" r="8" fill="#e9edf8" />
    </svg>
  )
}
