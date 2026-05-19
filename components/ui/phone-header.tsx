'use client';
import Link from 'next/link';
import { BrandMark } from './brand-mark';
import { theme } from '@/lib/design-tokens';

type Props = {
  onBack?: () => void;
  rankingHref?: string;
  title?: string;
};

export function PhoneHeader({ onBack, rankingHref, title }: Props) {
  const t = theme;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 18px 6px', height: 52,
    }}>
      {onBack ? (
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12,
          background: t.surface, border: `1px solid ${t.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: t.ink,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BrandMark size={45} badge={false} />
          <span style={{ fontFamily: "'Anton', sans-serif", color: t.ink, fontSize: 18, letterSpacing: 0.4 }}>
            LAU BURGUER
          </span>
        </div>
      )}

      {title && (
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: t.ink, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {title}
        </span>
      )}

      {rankingHref ? (
        <Link href={rankingHref} style={{
          height: 36, padding: '0 12px', borderRadius: 999,
          border: `1.5px solid ${t.ink}`, background: t.accent,
          fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 12.5,
          letterSpacing: 0.3, color: t.ink, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          textTransform: 'uppercase', textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 21V10M12 21V4M18 21v-7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          Ranking
        </Link>
      ) : (
        <div style={{ width: 40 }} />
      )}
    </div>
  );
}
