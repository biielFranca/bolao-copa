import { theme, hexA } from '@/lib/design-tokens';

export function BgStripes({ opacity = 0.06 }: { opacity?: number }) {
  const t = theme;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `repeating-linear-gradient(45deg, ${hexA(t.primaryDeep, opacity)} 0 14px, transparent 14px 28px)`,
      pointerEvents: 'none',
    }} />
  );
}
