import { createServiceClient } from '@/lib/supabase/server';
import { calculateScores } from '@/lib/scoring';
import { theme, hexA } from '@/lib/design-tokens';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const t = theme;

// ─── Avatar circle with initials ──────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const colors = [t.primary, '#0e4a8a', '#8a2e00', '#6b007a', '#004d5c'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: colors[idx], color: '#fff',
      fontFamily: 'var(--font-anton)', fontSize: size * 0.35,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, letterSpacing: 0.5,
    }}>
      {initials}
    </div>
  );
}

// ─── Rank row (4th place and beyond) ─────────────────────────────────────────
function RankRow({ p, hasResults }: { p: ReturnType<typeof calculateScores>[0]; hasResults: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: t.surface, borderRadius: 16, padding: '12px 14px',
      border: `1px solid ${t.line}`,
    }}>
      {/* Position */}
      <div style={{
        width: 28, fontFamily: 'var(--font-anton)', fontSize: 16,
        color: t.inkMuted, textAlign: 'center', flexShrink: 0,
      }}>
        {p.position}º
      </div>

      <Avatar name={p.name} size={36} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 14,
          color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {p.name}
        </div>
        {hasResults && (
          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            {p.correctChampion && (
              <span style={{
                fontFamily: 'var(--font-manrope)', fontSize: 10.5, fontWeight: 700,
                background: hexA(t.accent, 0.25), color: t.accentInk,
                borderRadius: 999, padding: '2px 8px',
              }}>🏆 Campeão</span>
            )}
            {p.exactScoreCount > 0 && (
              <span style={{
                fontFamily: 'var(--font-manrope)', fontSize: 10.5, fontWeight: 700,
                background: hexA(t.primary, 0.1), color: t.primary,
                borderRadius: 999, padding: '2px 8px',
              }}>⚽ {p.exactScoreCount} exato{p.exactScoreCount > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {hasResults ? (
          <>
            <div style={{ fontFamily: 'var(--font-anton)', fontSize: 22, color: t.primary, lineHeight: 1 }}>
              {p.totalScore}
            </div>
            <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10, color: t.inkMuted }}>pts</div>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: 20, color: hexA(t.ink, 0.25) }}>—</div>
        )}
      </div>
    </div>
  );
}

// ─── Podium card (top 3) ──────────────────────────────────────────────────────
function PodiumCard({
  p, rank, hasResults,
}: {
  p: ReturnType<typeof calculateScores>[0];
  rank: 1 | 2 | 3;
  hasResults: boolean;
}) {
  const configs: Record<1 | 2 | 3, { height: number; bg: string; border: string; avatarSize: number; label: string }> = {
    1: { height: 120, bg: hexA(t.accent, 0.25), border: t.accent, avatarSize: 52, label: '👑' },
    2: { height: 90, bg: hexA(t.primary, 0.12), border: hexA(t.primary, 0.5), avatarSize: 44, label: '2' },
    3: { height: 70, bg: hexA(t.ink, 0.06), border: hexA(t.ink, 0.15), avatarSize: 40, label: '3' },
  };
  const cfg = configs[rank];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {/* Crown / position */}
      <div style={{ fontFamily: 'var(--font-anton)', fontSize: rank === 1 ? 24 : 16, lineHeight: 1 }}>
        {cfg.label}
      </div>

      <Avatar name={p.name} size={cfg.avatarSize} />

      <div style={{
        fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12,
        color: t.ink, textAlign: 'center', lineHeight: 1.2,
        maxWidth: 80, overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      } as React.CSSProperties}>
        {p.name}
      </div>

      {/* Score plinth */}
      <div style={{
        width: '100%', height: cfg.height, borderRadius: '12px 12px 0 0',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderBottom: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        {hasResults ? (
          <>
            <div style={{ fontFamily: 'var(--font-anton)', fontSize: rank === 1 ? 34 : 26, color: t.ink, lineHeight: 1 }}>
              {p.totalScore}
            </div>
            <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10, color: t.inkMuted, fontWeight: 700 }}>pts</div>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: 22, color: hexA(t.ink, 0.3) }}>—</div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function RankingPage() {
  const supabase = createServiceClient();

  const [{ data: predictions }, { data: results }, { data: tournament }] = await Promise.all([
    supabase
      .from('predictions')
      .select('*, participants(name)')
      .order('submitted_at', { ascending: true }),
    supabase.from('results').select('*'),
    supabase.from('tournament_results').select('*').limit(1).single(),
  ]);

  const hasResults = results?.some((r) => r.result_status === 'final') ?? false;

  type SupabasePrediction = {
    participant_id: string;
    brazil_morocco_brazil_goals: number | null;
    brazil_morocco_opponent_goals: number | null;
    brazil_haiti_brazil_goals: number | null;
    brazil_haiti_opponent_goals: number | null;
    brazil_scotland_brazil_goals: number | null;
    brazil_scotland_opponent_goals: number | null;
    group_order: string[] | null;
    brazil_group_position: number | null;
    champion: string | null;
    total_brazil_goals: number | null;
    submitted_at: string;
    participants: { name: string } | null;
  };

  const predictionsWithNames = (predictions as SupabasePrediction[] ?? []).map((p) => ({
    ...p,
    participant_name: p.participants?.name ?? 'Desconhecido',
  }));

  const ranked =
    hasResults && results
      ? calculateScores(predictionsWithNames, results, tournament ?? null)
      : predictionsWithNames.map((p, i) => ({
          position: i + 1,
          participantId: p.participant_id,
          name: p.participant_name,
          totalScore: 0,
          correctChampion: false,
          exactScoreCount: 0,
          correctBrazilPosition: false,
          brazilGoalsDiff: null as number | null,
          submittedAt: p.submitted_at,
        }));

  const [first, second, third, ...rest] = ranked;

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Header bar */}
      <div style={{ background: t.bg, borderBottom: `1px solid ${t.line}`, padding: '10px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{
            width: 40, height: 40, borderRadius: 12, background: t.surface,
            border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: t.ink,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {/* Pulsing live dot */}
            <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 999,
                background: t.primary, opacity: 0.5,
                animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite',
              }} />
              <span style={{ borderRadius: 999, background: t.primary, width: 10, height: 10 }} />
            </span>
            <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12, color: t.inkSoft, letterSpacing: 0.3 }}>
              Ranking ao vivo · {ranked.length} palpiteiro{ranked.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ width: 40 }} />
        </div>
      </div>

      {/* ─── Hero strip ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: t.primary, color: t.primaryInk,
        padding: '20px 20px 0',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-manrope)', fontSize: 11.5, fontWeight: 800,
          letterSpacing: 2, opacity: 0.8, textTransform: 'uppercase', marginBottom: 4,
        }}>
          Lau Burguer · Copa 2026
        </div>
        <h1 style={{
          fontFamily: 'var(--font-anton)', fontSize: 38, margin: 0,
          letterSpacing: 0.2, lineHeight: 1, textTransform: 'uppercase',
        }}>
          Quem leva o combo?
        </h1>

        {/* Podium */}
        {ranked.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, marginTop: 22, padding: '0 4px' }}>
            {second && (
              <PodiumCard p={second} rank={2} hasResults={hasResults} />
            )}
            {first && (
              <PodiumCard p={first} rank={1} hasResults={hasResults} />
            )}
            {third && (
              <PodiumCard p={third} rank={3} hasResults={hasResults} />
            )}
          </div>
        ) : (
          <div style={{ padding: '40px 0 24px', fontFamily: 'var(--font-manrope)', opacity: 0.8, fontSize: 14 }}>
            Nenhum palpite ainda
          </div>
        )}
      </div>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '16px 14px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* No results banner */}
        {!hasResults && ranked.length > 0 && (
          <div style={{
            background: hexA(t.accent, 0.18),
            border: `1px solid ${hexA(t.accent, 0.5)}`,
            borderRadius: 12, padding: '10px 14px',
            fontFamily: 'var(--font-manrope)', fontSize: 12.5, fontWeight: 600,
            color: t.accentInk, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⏳</span>
            A pontuação será calculada após as partidas.
          </div>
        )}

        {/* Empty state */}
        {ranked.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 0',
            fontFamily: 'var(--font-manrope)', fontSize: 15, color: t.inkMuted,
          }}>
            Nenhum palpite enviado ainda.
            <br />
            <Link href="/" style={{ color: t.primary, fontWeight: 700, textDecoration: 'none' }}>
              Participar →
            </Link>
          </div>
        )}

        {/* 4th+ rows */}
        {rest.map((p) => (
          <RankRow key={p.participantId} p={p} hasResults={hasResults} />
        ))}

        {/* Tiebreaker note */}
        {ranked.length > 0 && (
          <div style={{
            marginTop: 8, background: t.surface, borderRadius: 14, padding: '12px 14px',
            border: `1px solid ${t.line}`,
          }}>
            <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: t.inkMuted, textTransform: 'uppercase', marginBottom: 6 }}>
              Critérios de desempate
            </div>
            <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11.5, color: t.inkSoft, lineHeight: 1.6 }}>
              1 · Pontuação total &nbsp;·&nbsp; 2 · Acertou o campeão &nbsp;·&nbsp; 3 · Placares exatos
              &nbsp;·&nbsp; 4 · Posição do Brasil &nbsp;·&nbsp; 5 · Gols do Brasil &nbsp;·&nbsp; 6 · Envio mais cedo
            </div>
          </div>
        )}

        {/* Enter link */}
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <Link href="/" style={{
            fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 13,
            color: t.primary, textDecoration: 'none',
          }}>
            ← Entrar no bolão
          </Link>
        </div>
      </div>

      {/* ping animation */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
