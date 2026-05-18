'use client';

import { TEAMS_32 } from '@/lib/bracket-data';
import { theme, hexA } from '@/lib/design-tokens';

type Props = {
  team: string | null | undefined;
  size?: number;
  showName?: boolean;
  dim?: boolean;
};

export function TeamBadge({ team, size = 36, showName = false, dim = false }: Props) {
  const t = theme;
  const tc = team ? TEAMS_32[team] : undefined;

  if (!team || !tc) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
        <div style={{
          width: size, height: size, borderRadius: 999,
          background: hexA(t.ink, 0.08),
          border: `1.5px dashed ${hexA(t.ink, 0.2)}`,
        }} />
        {showName && (
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13, color: t.inkMuted, fontWeight: 700,
          }}>
            A definir
          </span>
        )}
      </div>
    );
  }

  const stripe = `linear-gradient(135deg, ${tc.c1} 0 50%, ${tc.c2 ?? tc.c1} 50% 100%)`;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      opacity: dim ? 0.35 : 1,
      transition: 'opacity .15s ease',
    }}>
      <div style={{
        width: size, height: size, borderRadius: 999,
        background: stripe,
        boxShadow: `inset 0 0 0 1.5px ${hexA('#000', 0.18)}, 0 1px 2px ${hexA('#000', 0.1)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Anton', sans-serif",
        fontSize: size * 0.36,
        color: '#fff',
        textShadow: '0 1px 1px rgba(0,0,0,0.5)',
        letterSpacing: 0.2,
        flex: 'none',
      }}>
        {tc.short}
      </div>
      {showName && (
        <span style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13.5, color: t.ink, fontWeight: 800,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {tc.name}
        </span>
      )}
    </div>
  );
}
