export function IsometricCityIllustration() {
  return (
    <svg viewBox="0 0 680 480" className="h-full w-full" role="img" aria-label="Isometric 3D view of Nagara district command center">
      <ellipse cx="340" cy="400" rx="260" ry="60" fill="var(--color-navy)" opacity="0.06" />

      <g>
        <polygon points="180,300 260,255 260,335 180,380" fill="#B4B2A9" />
        <polygon points="260,255 340,300 340,380 260,335" fill="#888780" />
        <polygon points="180,300 260,255 340,300 260,345" fill="#D3D1C7" />
      </g>

      <g>
        <polygon points="360,260 420,225 420,320 360,355" fill="#85B7EB" />
        <polygon points="420,225 480,260 480,355 420,320" fill="#378ADD" />
        <polygon points="360,260 420,225 480,260 420,295" fill="#B5D4F4" />
      </g>

      <g>
        <polygon points="140,180 230,130 230,270 140,320" fill="#7F77DD" />
        <polygon points="230,130 320,180 320,320 230,270" fill="#534AB7" />
        <polygon points="140,180 230,130 320,180 230,230" fill="#AFA9EC" />
      </g>

      <g>
        <polygon points="330,150 420,100 420,270 330,320" fill="#F0997B" />
        <polygon points="420,100 510,150 510,320 420,270" fill="#D85A30" />
        <polygon points="330,150 420,100 510,150 420,200" fill="#F5C4B3" />
        <rect x="345" y="170" width="14" height="18" fill="#4A1B0C" opacity="0.5" />
        <rect x="345" y="200" width="14" height="18" fill="#4A1B0C" opacity="0.5" />
        <rect x="345" y="230" width="14" height="18" fill="#4A1B0C" opacity="0.5" />
        <rect x="430" y="200" width="14" height="18" fill="#4A1B0C" opacity="0.4" />
        <rect x="430" y="230" width="14" height="18" fill="#4A1B0C" opacity="0.4" />
      </g>

      <g>
        <rect x="405" y="60" width="10" height="45" fill="#791F1F" />
        <circle cx="410" cy="55" r="8" fill="var(--color-emergency)">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </g>

      <g>
        <circle cx="230" cy="190" r="9" fill="var(--color-emergency)" />
        <circle cx="230" cy="190" r="16" fill="none" stroke="var(--color-emergency)" strokeWidth="1.5" opacity="0.5" />
      </g>
      <g>
        <circle cx="500" cy="230" r="8" fill="var(--color-warn)" />
        <circle cx="500" cy="230" r="14" fill="none" stroke="var(--color-warn)" strokeWidth="1.5" opacity="0.5" />
      </g>
      <g>
        <circle cx="200" cy="330" r="7" fill="var(--color-warn)" />
        <circle cx="200" cy="330" r="13" fill="none" stroke="var(--color-warn)" strokeWidth="1.5" opacity="0.5" />
      </g>

      <path d="M230 190 C 320 230, 380 220, 420 260" fill="none" stroke="var(--color-emergency)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
      <path d="M500 230 C 470 250, 440 260, 420 260" fill="none" stroke="var(--color-warn)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
    </svg>
  );
}
