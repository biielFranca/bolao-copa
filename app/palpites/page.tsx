'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { theme, hexA, MATCHES, GROUP_TEAMS, CHAMPION_OPTIONS, TEAM_NAMES } from '@/lib/design-tokens';
import { ScoreStepper } from '@/components/ui/score-stepper';
import { Flag } from '@/components/ui/flag';
import { PhoneHeader } from '@/components/ui/phone-header';
import { BgStripes } from '@/components/ui/bg-stripes';

const t = theme;

// ─── Locked screen ────────────────────────────────────────────────────────────
function LockedScreen() {
  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <PhoneHeader rankingHref="/ranking" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 20 }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-anton)', fontSize: 32, color: t.ink, textAlign: 'center', margin: 0, lineHeight: 1.1 }}>
          PALPITES<br />ENCERRADOS
        </h2>
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: 15, color: t.inkMuted, textAlign: 'center', margin: 0 }}>
          O prazo para envio de palpites foi encerrado.
        </p>
        <a href="/ranking" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: t.primary, color: t.primaryInk, borderRadius: 14,
          padding: '14px 28px', fontFamily: 'var(--font-anton)', fontSize: 18,
          textDecoration: 'none', boxShadow: `0 4px 0 ${t.primaryDeep}`,
        }}>
          Ver ranking →
        </a>
      </div>
    </div>
  );
}

// ─── Submitted screen ─────────────────────────────────────────────────────────
function SubmittedScreen() {
  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <PhoneHeader rankingHref="/ranking" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 20 }}>
        <div style={{ fontSize: 64, lineHeight: 1 }}>✅</div>
        <h2 style={{ fontFamily: 'var(--font-anton)', fontSize: 32, color: t.ink, textAlign: 'center', margin: 0, lineHeight: 1.1 }}>
          PALPITE<br />ENVIADO!
        </h2>
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: 15, color: t.inkMuted, textAlign: 'center', margin: 0, maxWidth: 280 }}>
          Seus palpites estão registrados. Boa sorte no bolão!
        </p>
        <a href="/ranking" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: t.primary, color: t.primaryInk, borderRadius: 14,
          padding: '14px 28px', fontFamily: 'var(--font-anton)', fontSize: 18,
          textDecoration: 'none', boxShadow: `0 4px 0 ${t.primaryDeep}`,
        }}>
          Ver ranking atual →
        </a>
      </div>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: 20,
      padding: '18px 16px',
      border: `1px solid ${t.line}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800,
      letterSpacing: 1.6, color: t.inkMuted, textTransform: 'uppercase', marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PalpitesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [locked, setLocked] = useState(false);

  // Scores as numbers
  const [scores, setScores] = useState<Record<string, number>>({
    brazil_morocco_brazil_goals: 0,
    brazil_morocco_opponent_goals: 0,
    brazil_haiti_brazil_goals: 0,
    brazil_haiti_opponent_goals: 0,
    brazil_scotland_brazil_goals: 0,
    brazil_scotland_opponent_goals: 0,
  });

  // Group order as ordered array of team codes
  const [groupOrder, setGroupOrder] = useState<string[]>([...GROUP_TEAMS]);
  const [champion, setChampion] = useState('');
  const [totalBrazilGoals, setTotalBrazilGoals] = useState(0);

  useEffect(() => {
    async function checkStatus() {
      const supabase = createClient();
      const [{ data: settings }, { data: prediction }] = await Promise.all([
        supabase.from('app_settings').select('predictions_locked').single(),
        supabase.from('predictions').select('id').maybeSingle(),
      ]);
      if (settings?.predictions_locked) setLocked(true);
      if (prediction) setAlreadySubmitted(true);
      setLoading(false);
    }
    checkStatus();
  }, []);

  function moveUp(i: number) {
    if (i === 0) return;
    setGroupOrder((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }

  function moveDown(i: number) {
    if (i === groupOrder.length - 1) return;
    setGroupOrder((prev) => {
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!champion) {
      setError('Selecione o campeão do mundo');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/palpites/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scores,
          group_order: groupOrder,
          champion,
          total_brazil_goals: totalBrazilGoals,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erro ao enviar palpites'); return; }
      router.push('/ranking');
    } catch {
      setError('Erro de conexão. Tente novamente.');
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

  if (locked && !alreadySubmitted) return <LockedScreen />;
  if (alreadySubmitted) return <SubmittedScreen />;

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: t.bg, borderBottom: `1px solid ${t.line}` }}>
        <PhoneHeader rankingHref="/ranking" title="Palpites" />
      </div>

      {/* Page hero strip */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: t.primary, color: t.primaryInk,
        padding: '20px 24px 18px',
      }}>
        <BgStripes opacity={0.12} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-anton)', fontSize: 36,
            margin: 0, letterSpacing: 0.4, lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            Seus Palpites
          </h1>
          <p style={{
            fontFamily: 'var(--font-manrope)', fontSize: 13.5,
            margin: '6px 0 0', opacity: 0.9, lineHeight: 1.4,
          }}>
            Preencha tudo e envie — não é possível alterar depois.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: '16px 14px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Matches ─────────────────────────────────────────────────── */}
        {MATCHES.map((match) => {
          const bKey = `${match.id}_brazil_goals` as keyof typeof scores;
          const oKey = `${match.id}_opponent_goals` as keyof typeof scores;
          return (
            <SectionCard key={match.id}>
              {/* Match header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Flag team={match.home} size={28} />
                <div>
                  <div style={{ fontFamily: 'var(--font-anton)', fontSize: 17, color: t.ink, letterSpacing: 0.3, lineHeight: 1 }}>
                    {match.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, color: t.inkMuted, marginTop: 2 }}>
                    {match.when} · {match.stage}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}><Flag team={match.away} size={28} /></div>
              </div>

              {/* Score steppers */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 700, color: t.inkMuted }}>Brasil</div>
                  <ScoreStepper value={scores[bKey] as number} onChange={(v) => setScores((p) => ({ ...p, [bKey]: v }))} />
                </div>
                <div style={{ fontFamily: 'var(--font-anton)', fontSize: 26, color: hexA(t.ink, 0.3), paddingTop: 18 }}>×</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 700, color: t.inkMuted }}>
                    {TEAM_NAMES[match.away]}
                  </div>
                  <ScoreStepper value={scores[oKey] as number} onChange={(v) => setScores((p) => ({ ...p, [oKey]: v }))} accent={t.accent} />
                </div>
              </div>
            </SectionCard>
          );
        })}

        {/* ── Group order ─────────────────────────────────────────────── */}
        <SectionCard>
          <Label>Ordem final do Grupo A</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {groupOrder.map((team, i) => (
              <div key={team} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: i === 0 ? hexA(t.accent, 0.18) : i === 1 ? hexA(t.primary, 0.07) : hexA(t.ink, 0.04),
                borderRadius: 12, padding: '10px 12px',
                border: `1px solid ${i === 0 ? hexA(t.accent, 0.5) : t.line}`,
              }}>
                {/* Position badge */}
                <div style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: i === 0 ? t.accent : i < 2 ? t.primary : hexA(t.ink, 0.12),
                  color: i === 0 ? t.accentInk : i < 2 ? t.primaryInk : t.inkMuted,
                  fontFamily: 'var(--font-anton)', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                <Flag team={team} size={30} />
                <div style={{ flex: 1, fontFamily: 'var(--font-manrope)', fontSize: 14, fontWeight: 700, color: t.ink }}>
                  {TEAM_NAMES[team]}
                </div>

                {/* ↑↓ buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: `1px solid ${t.line}`,
                      background: i === 0 ? 'transparent' : t.surface,
                      color: i === 0 ? hexA(t.ink, 0.2) : t.ink,
                      cursor: i === 0 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === groupOrder.length - 1}
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: `1px solid ${t.line}`,
                      background: i === groupOrder.length - 1 ? 'transparent' : t.surface,
                      color: i === groupOrder.length - 1 ? hexA(t.ink, 0.2) : t.ink,
                      cursor: i === groupOrder.length - 1 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Champion ─────────────────────────────────────────────────── */}
        <SectionCard>
          <Label>Campeão do Mundo 🏆</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {CHAMPION_OPTIONS.map((code) => {
              const selected = champion === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setChampion(code)}
                  style={{
                    border: `2px solid ${selected ? t.primary : t.line}`,
                    borderRadius: 14,
                    background: selected ? hexA(t.primary, 0.1) : t.surface,
                    padding: '10px 6px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    boxShadow: selected ? `0 0 0 2px ${t.primary}` : 'none',
                    transition: 'all 0.12s',
                  }}
                >
                  <Flag team={code} size={44} />
                  <div style={{
                    fontFamily: 'var(--font-manrope)', fontSize: 11.5, fontWeight: 700,
                    color: selected ? t.primary : t.ink,
                  }}>
                    {TEAM_NAMES[code]}
                  </div>
                  {selected && (
                    <div style={{
                      width: 16, height: 16, borderRadius: 999, background: t.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Total Brazil goals ────────────────────────────────────────── */}
        <SectionCard>
          <Label>Total de gols do Brasil no torneio</Label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <ScoreStepper value={totalBrazilGoals} onChange={setTotalBrazilGoals} />
          </div>
          <div style={{
            marginTop: 10, fontFamily: 'var(--font-manrope)', fontSize: 12,
            color: t.inkMuted, textAlign: 'center',
          }}>
            Usado como critério de desempate
          </div>
        </SectionCard>

        {/* Error */}
        {error && (
          <div style={{
            background: hexA(t.danger, 0.08), border: `1px solid ${hexA(t.danger, 0.3)}`,
            borderRadius: 12, padding: '12px 14px',
            fontFamily: 'var(--font-manrope)', fontSize: 13.5, color: t.danger, fontWeight: 700,
          }}>
            {error}
          </div>
        )}
      </form>

      {/* Sticky submit bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: t.bg, borderTop: `1px solid ${t.line}`,
        padding: '12px 16px 20px',
      }}>
        <button
          onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
          disabled={submitting}
          style={{
            width: '100%', background: submitting ? hexA(t.primary, 0.5) : t.primary,
            color: t.primaryInk, border: 'none', borderRadius: 16,
            padding: '18px 0',
            fontFamily: 'var(--font-anton)', fontSize: 22, letterSpacing: 0.5,
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : `0 4px 0 ${t.primaryDeep}`,
            transition: 'all 0.15s',
          }}
        >
          {submitting ? 'Enviando...' : 'Enviar Palpites ⚽'}
        </button>
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontFamily: 'var(--font-manrope)', fontSize: 11, color: t.inkMuted,
        }}>
          Ao enviar, seus palpites são definitivos.
        </div>
      </div>
    </div>
  );
}
