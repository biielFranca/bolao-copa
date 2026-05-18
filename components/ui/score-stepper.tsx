'use client';
import { theme } from '@/lib/design-tokens';

type Props = { value: number; onChange: (v: number) => void; accent?: string };

export function ScoreStepper({ value, onChange, accent }: Props) {
  const t = theme;
  const ring = accent || t.primary;
  const bump = (d: number) => onChange(Math.max(0, Math.min(15, value + d)));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      <StepBtn onClick={() => bump(-1)} disabled={value <= 0} label="−" />
      <div style={{
        minWidth: 60, height: 68, borderRadius: 14,
        background: t.bg, border: `2px solid ${ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Anton', sans-serif", fontSize: 40, color: t.ink,
        letterSpacing: -1, lineHeight: 1,
      }}>{value}</div>
      <StepBtn onClick={() => bump(1)} label="+" />
    </div>
  );
}

export function StepBtn({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  const t = theme;
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: 44, height: 44, borderRadius: 999, border: 'none',
      background: disabled ? 'rgba(0,122,61,0.15)' : t.ink,
      color: disabled ? 'rgba(0,122,61,0.4)' : t.bg,
      fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: disabled ? 'none' : '0 2px 0 rgba(0,0,0,0.18)',
      lineHeight: 1, paddingBottom: 3,
    }}>{label}</button>
  );
}
