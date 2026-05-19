'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { theme, hexA } from '@/lib/design-tokens';
import {
  TEAMS_32,
  DEFAULT_STANDINGS,
  ROUND_LABEL,
  ROUND_LABEL_FULL,
  computeBracket,
  cascadeClear,
  type BracketMatch,
  type BracketPick,
} from '@/lib/bracket-data';
import { PhoneHeader } from '@/components/ui/phone-header';
import { BgStripes } from '@/components/ui/bg-stripes';
import { TeamBadge } from '@/components/ui/team-badge';

const t = theme;
const ROUNDS_ORDER = ['r32', 'r16', 'qf', 'sf', 'third', 'f'] as const;
type Round = typeof ROUNDS_ORDER[number];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChavePage() {
  const router = useRouter();
  const [round, setRound] = useState<Round>('r16');
  const [picks, setPicks] = useState<BracketPick>({});
  const [standings, setStandings] = useState<Record<string, string[]>>(DEFAULT_STANDINGS);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [standingsRes, checkRes] = await Promise.all([
        fetch('/api/bracket/standings'),
        fetch('/api/bracket/check'),
      ]);

      if (standingsRes.ok) {
        const data = await standingsRes.json() as {
          standings: Array<{
            group_id: string;
            first_place: string | null;
            second_place: string | null;
            third_place: string | null;
            fourth_place: string | null;
          }>;
          results: Array<{ match_id: string; winner: string | null }>;
        };
        const newStandings: Record<string, string[]> = { ...DEFAULT_STANDINGS };
        for (const s of data.standings) {
          const positions = [s.first_place, s.second_place, s.third_place, s.fourth_place].filter(Boolean) as string[];
          if (positions.length > 0) {
            // Fill remaining slots from default standings so R32 always has 4 teams
            const def = DEFAULT_STANDINGS[s.group_id] ?? [];
            const filled = def.map((d, i) => positions[i] ?? d);
            newStandings[s.group_id] = filled;
          }
        }
        setStandings(newStandings);

        // Apply bracket results as picks seed
        if (data.results?.length) {
          const resultPicks: BracketPick = {};
          for (const r of data.results) {
            if (r.winner) resultPicks[r.match_id] = r.winner;
          }
          // Don't override user picks with results — results are just for display
        }
      }

      if (checkRes.ok) {
        const checkData = await checkRes.json() as { hasSubmitted: boolean; picks: BracketPick | null };
        if (checkData.hasSubmitted) {
          setHasSubmitted(true);
          if (checkData.picks) setPicks(checkData.picks);
        }
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const bracket = useMemo(() => computeBracket(standings, picks), [standings, picks]);
  const allMatches = useMemo(() => [
    ...bracket.r32, ...bracket.r16, ...bracket.qf, ...bracket.sf, ...bracket.f, ...bracket.third,
  ], [bracket]);

  const matchesByRound: Record<Round, BracketMatch[]> = {
    r32: bracket.r32,
    r16: bracket.r16,
    qf: bracket.qf,
    sf: bracket.sf,
    f: bracket.f,
    third: bracket.third,
  };

  const totalPicks = ROUNDS_ORDER.reduce((acc, r) => acc + matchesByRound[r].length, 0);
  const filledPicks = ROUNDS_ORDER.reduce(
    (acc, r) => acc + matchesByRound[r].filter((m) => picks[m.id]).length,
    0
  );
  const champion = picks['f-1'];
  const pct = Math.round((filledPicks / totalPicks) * 100);

  function pick(matchId: string, team: string) {
    if (hasSubmitted) return;
    setPicks((p) => {
      const np = { ...p, [matchId]: team };
      return cascadeClear(np, matchId, allMatches);
    });
  }

  async function handleSubmit() {
    if (!champion) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bracket/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks }),
      });
      if (res.ok) {
        router.push('/ranking');
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Erro ao enviar');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-manrope)', color: t.inkMuted }}>Carregando...</div>
      </div>
    );
  }

  // Already submitted screen
  if (hasSubmitted) {
    return (
      <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: t.primary, color: t.primaryInk,
          paddingBottom: 28,
          borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
        }}>
          <BgStripes opacity={0.12} />
          <div style={{ position: 'relative', paddingTop: 48 }}>
            <PhoneHeader onBack={() => router.push('/')} rankingHref="/ranking" />
            <div style={{ padding: '16px 22px 0' }}>
              <div style={{
                fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800,
                letterSpacing: 2, opacity: 0.85, textTransform: 'uppercase',
              }}>
                Palpite do mata-mata
              </div>
              <h1 style={{
                fontFamily: 'var(--font-anton)', fontSize: 36, lineHeight: 0.95,
                letterSpacing: -0.5, margin: '6px 0 0', textTransform: 'uppercase',
                textShadow: `0 3px 0 ${t.primaryDeep}`,
              }}>
                Palpite
                <br />
                enviado!
              </h1>
              {champion && (
                <div style={{
                  marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px 5px 6px',
                  background: t.accent, color: t.accentInk, borderRadius: 999,
                  fontFamily: 'var(--font-anton)', fontSize: 14, letterSpacing: 0.5,
                  textTransform: 'uppercase', boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                }}>
                  <TeamBadge team={champion} size={24} />
                  <span>seu campeão</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: hexA(t.primary, 0.07), borderRadius: 14,
            border: `1px solid ${hexA(t.primary, 0.2)}`,
            padding: '14px 16px',
            fontFamily: 'var(--font-manrope)', fontSize: 13.5, color: t.inkSoft, lineHeight: 1.55,
          }}>
            Já enviaste a tua chave do mata-mata. Acompanha o ranking para ver como vais!
          </div>

          {/* Show submitted picks in read-only mode */}
          <div style={{
            fontFamily: 'var(--font-anton)', fontSize: 16, color: t.ink,
            letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 8,
          }}>
            Os teus picks
          </div>
          {ROUNDS_ORDER.map((r) => {
            const ms = matchesByRound[r];
            const filled = ms.filter((m) => picks[m.id]);
            if (!filled.length) return null;
            return (
              <div key={r}>
                <div style={{
                  fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800,
                  letterSpacing: 1.2, color: t.inkMuted, textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  {ROUND_LABEL_FULL[r]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filled.map((m) => {
                    const winner = picks[m.id];
                    const tc = winner ? TEAMS_32[winner] : null;
                    return (
                      <div key={m.id} style={{
                        background: t.surface, borderRadius: 10, padding: '8px 12px',
                        border: `1px solid ${hexA(t.primary, 0.3)}`,
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <TeamBadge team={winner} size={28} />
                        <span style={{
                          fontFamily: 'var(--font-anton)', fontSize: 15, color: t.ink,
                          letterSpacing: 0.3, textTransform: 'uppercase',
                        }}>
                          {tc?.name ?? '—'}
                        </span>
                        <span style={{
                          marginLeft: 'auto',
                          fontFamily: 'var(--font-manrope)', fontSize: 10, fontWeight: 700,
                          letterSpacing: 0.8, color: t.inkMuted, textTransform: 'uppercase',
                        }}>
                          {ROUND_LABEL[r]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Hero */}
      <div style={{
        background: t.primary, color: t.primaryInk,
        paddingBottom: 16, position: 'relative', overflow: 'hidden',
        borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
      }}>
        <BgStripes opacity={0.12} />
        <div style={{ position: 'relative', paddingTop: 48 }}>
          <PhoneHeader onBack={() => router.push('/')} rankingHref="/ranking" />
          <div style={{ padding: '0 22px 4px' }}>
            <div style={{
              fontFamily: 'var(--font-manrope)', fontSize: 12, fontWeight: 800,
              letterSpacing: 2, opacity: 0.85, textTransform: 'uppercase',
            }}>
              Palpite do mata-mata
            </div>
            <h1 style={{
              fontFamily: 'var(--font-anton)', fontSize: 40, lineHeight: 0.95,
              letterSpacing: -0.5, margin: '6px 0 0', textTransform: 'uppercase',
              textShadow: `0 3px 0 ${t.primaryDeep}`,
            }}>
              Monta a tua
              <br />
              chave.
            </h1>

            {/* Progress bar */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                flex: 1, height: 10, background: hexA('#000', 0.2),
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%', background: t.accent,
                  borderRadius: 999, boxShadow: `inset 0 1px 0 ${hexA('#fff', 0.4)}`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-anton)', fontSize: 18, color: t.accent, letterSpacing: 0.4,
              }}>
                {filledPicks}/{totalPicks}
              </span>
            </div>

            {champion && (
              <div style={{
                marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 5px 6px',
                background: t.accent, color: t.accentInk, borderRadius: 999,
                fontFamily: 'var(--font-anton)', fontSize: 14, letterSpacing: 0.5,
                textTransform: 'uppercase', boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
              }}>
                <TeamBadge team={champion} size={24} />
                <span>seu campeão</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Round Tabs */}
      <RoundTabs round={round} setRound={setRound} matchesByRound={matchesByRound} picks={picks} />

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 120px' }}>
        <div style={{
          fontFamily: 'var(--font-anton)', fontSize: 22, color: t.ink,
          letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8,
        }}>
          {ROUND_LABEL_FULL[round]}
        </div>
        <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 12, color: t.inkMuted, marginBottom: 14 }}>
          Toque no time que você acha que passa. O vencedor sobe pra próxima rodada.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {matchesByRound[round].map((m, i) => (
            <KnockoutCard
              key={m.id}
              match={m}
              index={i + 1}
              pickedTeam={picks[m.id] ?? null}
              onPick={(team) => pick(m.id, team)}
              round={round}
            />
          ))}
        </div>

        {round === 'f' && champion && (
          <ChampionPreview champion={champion} />
        )}
      </div>

      {/* Sticky bottom */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        padding: '12px 16px 26px',
        background: `linear-gradient(180deg, ${hexA(t.bg, 0)} 0%, ${t.bg} 35%)`,
        display: 'flex', gap: 8,
      }}>
        {error && (
          <div style={{
            position: 'absolute', top: -40, left: 16, right: 16,
            background: t.danger, color: '#fff', borderRadius: 10, padding: '8px 12px',
            fontFamily: 'var(--font-manrope)', fontSize: 12.5, fontWeight: 700,
          }}>
            {error}
          </div>
        )}
        <button
          onClick={() => {
            const idx = ROUNDS_ORDER.indexOf(round);
            if (idx > 0) setRound(ROUNDS_ORDER[idx - 1]);
          }}
          disabled={round === ROUNDS_ORDER[0]}
          style={{
            height: 50, padding: '0 14px',
            border: `1.5px solid ${t.line}`, borderRadius: 14,
            background: round === ROUNDS_ORDER[0] ? 'transparent' : t.surface,
            color: round === ROUNDS_ORDER[0] ? hexA(t.ink, 0.3) : t.ink,
            fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 14,
            cursor: round === ROUNDS_ORDER[0] ? 'not-allowed' : 'pointer',
          }}
        >
          ←
        </button>

        {round !== 'f' ? (
          <button
            onClick={() => {
              const idx = ROUNDS_ORDER.indexOf(round);
              if (idx < ROUNDS_ORDER.length - 1) setRound(ROUNDS_ORDER[idx + 1]);
            }}
            style={{
              flex: 1, height: 50, borderRadius: 14, border: 'none',
              background: t.primary, color: t.primaryInk,
              fontFamily: 'var(--font-anton)', fontSize: 18, letterSpacing: 0.4,
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: `0 3px 0 ${t.primaryDeep}`,
            }}
          >
            Próxima rodada →
          </button>
        ) : champion ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1, height: 50, borderRadius: 14, border: 'none',
              background: submitting ? hexA(t.primary, 0.5) : t.primary,
              color: t.primaryInk,
              fontFamily: 'var(--font-anton)', fontSize: 18, letterSpacing: 0.4,
              textTransform: 'uppercase',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : `0 3px 0 ${t.primaryDeep}`,
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar palpite →'}
          </button>
        ) : (
          <div style={{
            flex: 1, height: 50, borderRadius: 14,
            background: hexA(t.ink, 0.06),
            border: `1.5px dashed ${hexA(t.ink, 0.15)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-manrope)', fontSize: 13, fontWeight: 700,
            color: t.inkMuted,
          }}>
            Escolha o campeão para enviar
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RoundTabs ───────────────────────────────────────────────────────────────

function RoundTabs({
  round, setRound, matchesByRound, picks,
}: {
  round: Round;
  setRound: (r: Round) => void;
  matchesByRound: Record<Round, BracketMatch[]>;
  picks: BracketPick;
}) {
  const rounds: Array<{ id: Round; label: string }> = [
    { id: 'r32', label: '16avos' },
    { id: 'r16', label: 'Oitavas' },
    { id: 'qf', label: 'Quartas' },
    { id: 'sf', label: 'Semi' },
    { id: 'third', label: '3º lugar' },
    { id: 'f', label: 'Final' },
  ];

  return (
    <div style={{
      background: t.surface, borderBottom: `1px solid ${t.line}`,
      display: 'flex', padding: '0 8px', overflowX: 'auto',
    }}>
      {rounds.map((r) => {
        const active = round === r.id;
        const total = matchesByRound[r.id]?.length ?? 0;
        const filled = matchesByRound[r.id]?.filter((m) => picks[m.id]).length ?? 0;
        const done = total > 0 && filled === total;
        return (
          <button
            key={r.id}
            onClick={() => setRound(r.id)}
            style={{
              flex: '0 0 auto', background: 'transparent', border: 'none',
              padding: '10px 12px 9px', cursor: 'pointer',
              fontFamily: 'var(--font-manrope)', fontSize: 12, fontWeight: 800,
              letterSpacing: 0.3, color: active ? t.ink : t.inkMuted,
              borderBottom: active ? `2.5px solid ${t.primary}` : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
              textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}
          >
            {r.label}
            <span style={{
              fontSize: 10, fontWeight: 800,
              background: done ? t.primary : hexA(t.ink, 0.1),
              color: done ? t.primaryInk : t.inkMuted,
              padding: '2px 6px', borderRadius: 999,
            }}>
              {filled}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── KnockoutCard ────────────────────────────────────────────────────────────

function KnockoutCard({
  match, index, pickedTeam, onPick, round,
}: {
  match: BracketMatch;
  index: number;
  pickedTeam: string | null;
  onPick: (team: string) => void;
  round: string;
}) {
  const teams = [match.a, match.b];
  const ready = !!teams[0] && !!teams[1];

  return (
    <div style={{
      background: t.surface, borderRadius: 16,
      border: `1.5px solid ${pickedTeam ? hexA(t.primary, 0.5) : t.line}`,
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px', background: hexA(t.ink, 0.04),
        fontFamily: 'var(--font-manrope)', fontSize: 10.5, fontWeight: 800,
        letterSpacing: 1.2, color: t.inkMuted, textTransform: 'uppercase',
      }}>
        <span>{ROUND_LABEL[round]} · Jogo {index}</span>
        {match.label && <span>{match.label}</span>}
      </div>
      <div style={{ padding: 4 }}>
        {teams.map((team, i) => (
          <TeamRow
            key={i}
            team={team}
            picked={pickedTeam === team}
            otherPicked={!!pickedTeam && pickedTeam !== team}
            disabled={!ready}
            onPick={() => team && onPick(team)}
            divider={i === 0}
          />
        ))}
      </div>
      {!ready && (
        <div style={{
          padding: '8px 12px 10px',
          fontFamily: 'var(--font-manrope)', fontSize: 11, color: t.inkMuted,
          background: hexA(t.ink, 0.03), textAlign: 'center',
        }}>
          Aguardando palpite das rodadas anteriores
        </div>
      )}
    </div>
  );
}

// ─── TeamRow ─────────────────────────────────────────────────────────────────

function TeamRow({
  team, picked, otherPicked, disabled, onPick, divider,
}: {
  team: string | null;
  picked: boolean;
  otherPicked: boolean;
  disabled: boolean;
  onPick: () => void;
  divider: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onPick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 10px',
        background: picked ? hexA(t.primary, 0.12) : 'transparent',
        border: 'none', borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, textAlign: 'left',
        borderBottom: divider ? `1px dashed ${t.line}` : 'none',
        transition: 'background .12s ease',
      }}
    >
      <TeamBadge team={team} size={34} dim={otherPicked} />
      <span style={{
        flex: 1, fontFamily: 'var(--font-anton)', fontSize: 17,
        color: otherPicked ? hexA(t.ink, 0.4) : t.ink,
        letterSpacing: 0.3, textTransform: 'uppercase',
      }}>
        {team ? (TEAMS_32[team]?.name ?? team) : 'Aguardando…'}
      </span>
      {picked && (
        <span style={{
          width: 24, height: 24, borderRadius: 999,
          background: t.primary, color: t.primaryInk,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, flex: 'none',
        }}>
          ✓
        </span>
      )}
    </button>
  );
}

// ─── ChampionPreview ─────────────────────────────────────────────────────────

function ChampionPreview({ champion }: { champion: string }) {
  const tc = TEAMS_32[champion];
  if (!tc) return null;
  return (
    <div style={{
      marginTop: 18, padding: 18, borderRadius: 18,
      background: `linear-gradient(135deg, ${tc.c1} 0 50%, ${tc.c2 ?? tc.c1} 50% 100%)`,
      position: 'relative', overflow: 'hidden',
      color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 110, opacity: 0.3 }}>
        🏆
      </div>
      <div style={{
        fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800,
        letterSpacing: 1.6, opacity: 0.95, textTransform: 'uppercase',
      }}>
        Seu campeão da Copa
      </div>
      <div style={{
        fontFamily: 'var(--font-anton)', fontSize: 38, letterSpacing: -0.5,
        marginTop: 4, textTransform: 'uppercase', lineHeight: 1,
      }}>
        {tc.name}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-manrope)', fontSize: 12.5, opacity: 0.95 }}>
        Acertou o campeão? Vale <b>10pt</b>.
      </div>
    </div>
  );
}
