import { theme, hexA } from '@/lib/design-tokens';

export function BrandMark({ size = 56 }: { size?: number }) {
  const t = theme;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: t.primary, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 2px 0 ${t.primaryDeep}, 0 8px 20px ${hexA(t.primaryDeep, 0.25)}`,
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: size * 0.1, borderRadius: size * 0.22,
        background: `repeating-linear-gradient(135deg, ${hexA(t.accent, 0.0)} 0 6px, ${hexA(t.accent, 0.12)} 6px 12px)`,
        pointerEvents: 'none',
      }} />
      <span style={{
        fontFamily: "'Anton', sans-serif", color: t.accent,
        fontSize: size * 0.58, letterSpacing: -0.5, lineHeight: 1,
        textShadow: `0 2px 0 ${t.primaryDeep}`,
      }}>LB</span>
      <div style={{
        position: 'absolute', bottom: -size * 0.12, right: -size * 0.08,
        width: size * 0.36, height: size * 0.36, borderRadius: '50%',
        background: t.accent, border: `${Math.max(1.5, size * 0.04)}px solid ${t.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.24, color: t.ink,
      }}>⚽</div>
    </div>
  );
}
