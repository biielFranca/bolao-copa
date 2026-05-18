import { hexA } from '@/lib/design-tokens';

interface BrandMarkProps {
  size?: number;
  badge?: boolean;  // true = white card wrapper com sombra (default)
  dark?: boolean;   // true = versão escura do logo
}

export function BrandMark({ size = 56, badge = true, dark = false }: BrandMarkProps) {
  const src = dark ? '/assets/lau-logo-dark.png' : '/assets/lau-logo-light.png';
  const w = Math.round(size * 1.07);
  const pad = badge ? Math.round(size * 0.08) : 0;

  return (
    <div style={{
      width: w + pad * 2,
      height: size + pad * 2,
      padding: pad,
      background: badge ? '#ffffff' : 'transparent',
      borderRadius: badge ? Math.round(size * 0.22) : 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: badge
        ? `0 2px 0 ${hexA('#000', 0.18)}, 0 6px 14px ${hexA('#000', 0.14)}`
        : 'none',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Lau Burger"
        style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'contain' }}
      />
    </div>
  );
}
