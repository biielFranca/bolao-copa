type FlagProps = { team: string; size?: number };

export function Flag({ team, size = 44 }: FlagProps) {
  const w = size;
  const h = Math.round(size * 0.7);
  const r = Math.max(4, size * 0.12);
  const style: React.CSSProperties = {
    width: w, height: h, borderRadius: r, overflow: 'hidden', display: 'block',
    boxShadow: '0 1px 2px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.06)',
    flexShrink: 0,
  };

  if (team === 'BRA') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="70" fill="#009c3b" />
      <polygon points="50,8 92,35 50,62 8,35" fill="#ffdf00" />
      <circle cx="50" cy="35" r="13.5" fill="#002776" />
      <path d="M37,33 Q50,28 63,33" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  );
  if (team === 'MAR') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="70" fill="#c1272d" />
      <polygon points="50,22 56.5,40.4 75.6,40.4 60.2,51.8 66.6,70 50,58.7 33.4,70 39.8,51.8 24.4,40.4 43.5,40.4"
        fill="none" stroke="#006233" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
  if (team === 'HAI') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="35" fill="#00209f" />
      <rect y="35" width="100" height="35" fill="#d21034" />
      <rect x="40" y="26" width="20" height="18" fill="#fff" />
    </svg>
  );
  if (team === 'SCO') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="70" fill="#0065bf" />
      <path d="M-5 -5 L105 75 M105 -5 L-5 75" stroke="#fff" strokeWidth="13" />
    </svg>
  );
  if (team === 'ARG') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="23.3" fill="#75aadb" />
      <rect y="23.3" width="100" height="23.4" fill="#fff" />
      <rect y="46.7" width="100" height="23.3" fill="#75aadb" />
      <circle cx="50" cy="35" r="5" fill="#f6b40e" stroke="#85340a" strokeWidth="0.6" />
    </svg>
  );
  if (team === 'ESP') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="17.5" fill="#aa151b" />
      <rect y="17.5" width="100" height="35" fill="#f1bf00" />
      <rect y="52.5" width="100" height="17.5" fill="#aa151b" />
    </svg>
  );
  if (team === 'FRA') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="33.3" height="70" fill="#002395" />
      <rect x="33.3" width="33.4" height="70" fill="#fff" />
      <rect x="66.7" width="33.3" height="70" fill="#ed2939" />
    </svg>
  );
  if (team === 'POR') return (
    <svg viewBox="0 0 100 70" style={style}>
      <rect width="100" height="70" fill="#da291c" />
      <rect width="40" height="70" fill="#046a38" />
      <circle cx="40" cy="35" r="9" fill="#ffe900" stroke="#000" strokeOpacity="0.15" strokeWidth="0.5" />
    </svg>
  );
  return null;
}
