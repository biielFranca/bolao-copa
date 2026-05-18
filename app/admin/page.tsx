'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { theme, hexA } from '@/lib/design-tokens';
import { BrandMark } from '@/components/ui/brand-mark';
import { BgStripes } from '@/components/ui/bg-stripes';
import type { Participant, Prediction, MatchResult, TournamentResult, AppSettings } from '@/lib/types';

const t = theme;
const GROUP_TEAMS = ['Brasil', 'Marrocos', 'Haiti', 'Escócia'];

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800,
      letterSpacing: 1.4, color: t.inkMuted, textTransform: 'uppercase', marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: t.surface, borderRadius: 18, border: `1px solid ${t.line}`,
      padding: '16px 14px', ...style,
    }}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-anton)', fontSize: 18, color: t.ink,
      letterSpacing: 0.3, marginBottom: 14, lineHeight: 1,
    }}>
      {children}
    </div>
  );
}

function NumberInput({
  value, onChange, placeholder = '0',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="text" inputMode="numeric" placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
      style={{
        width: '100%', border: `1.5px solid ${t.line}`, borderRadius: 10,
        padding: '8px 12px', fontFamily: 'var(--font-manrope)', fontSize: 16,
        fontWeight: 700, textAlign: 'center', color: t.ink, background: t.surface,
        outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

function TextInput({
  value, onChange, placeholder = '', type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', border: `1.5px solid ${t.line}`, borderRadius: 10,
        padding: '10px 12px', fontFamily: 'var(--font-manrope)', fontSize: 15,
        color: t.ink, background: t.surface, outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

function PrimaryButton({ children, onClick, disabled, style }: {
  children: React.ReactNode; onClick?: () => void;
  disabled?: boolean; style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        background: disabled ? hexA(t.primary, 0.45) : t.primary,
        color: t.primaryInk, border: 'none', borderRadius: 12,
        padding: '12px 20px', fontFamily: 'var(--font-anton)', fontSize: 16,
        letterSpacing: 0.4, cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `0 3px 0 ${t.primaryDeep}`,
        transition: 'all 0.12s', ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { onLogin(); }
      else { setError('Senha incorreta'); }
    } catch { setError('Erro de conexão'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', background: t.primary, padding: '48px 24px 36px', textAlign: 'center' }}>
        <BgStripes opacity={0.12} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <BrandMark size={52} />
          <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 800, letterSpacing: 2, color: hexA(t.primaryInk, 0.75), textTransform: 'uppercase' }}>
            Lau Burguer · Copa 2026
          </div>
          <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 32, margin: 0, color: t.primaryInk, letterSpacing: 0.4, lineHeight: 1 }}>
            PAINEL ADMIN
          </h1>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '28px 20px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <Card>
            <CardTitle>Entrar</CardTitle>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Label>Senha de administrador</Label>
                <input
                  type="password" value={password} autoFocus required
                  onChange={(e) => { setError(''); setPassword(e.target.value); }}
                  style={{
                    width: '100%', border: `1.5px solid ${error ? t.danger : t.line}`, borderRadius: 10,
                    padding: '12px 14px', fontFamily: 'var(--font-manrope)', fontSize: 16,
                    color: t.ink, background: t.surface, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {error && (
                  <div style={{ marginTop: 6, fontFamily: 'var(--font-manrope)', fontSize: 12.5, color: t.danger, fontWeight: 700 }}>
                    {error}
                  </div>
                )}
              </div>
              <PrimaryButton style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar →'}
              </PrimaryButton>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  // Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [tournament, setTournament] = useState<TournamentResult | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'resultados' | 'participantes' | 'palpites'>('resultados');

  const [matchForm, setMatchForm] = useState({
    brazil_morocco_brazil_goals: '',
    brazil_morocco_opponent_goals: '',
    brazil_morocco_status: 'pending',
    brazil_haiti_brazil_goals: '',
    brazil_haiti_opponent_goals: '',
    brazil_haiti_status: 'pending',
    brazil_scotland_brazil_goals: '',
    brazil_scotland_opponent_goals: '',
    brazil_scotland_status: 'pending',
  });

  const [tournamentForm, setTournamentForm] = useState<{
    final_group_order: string[];
    champion: string;
    total_brazil_goals: string;
  }>({
    final_group_order: ['', '', '', ''],
    champion: '',
    total_brazil_goals: '',
  });

  const [savingResults, setSavingResults] = useState(false);
  const [resultsMsg, setResultsMsg] = useState('');
  const [syncMsg, setSyncMsg] = useState('');

  const loadData = useCallback(async () => {
    setDataLoading(true);
    const supabase = createClient();

    const [
      { data: parts },
      { data: preds },
      { data: res },
      { data: tour },
      { data: sett },
    ] = await Promise.all([
      supabase.from('participants').select('*').order('created_at', { ascending: false }),
      supabase.from('predictions').select('*').order('submitted_at', { ascending: true }),
      supabase.from('results').select('*'),
      supabase.from('tournament_results').select('*').limit(1).single(),
      supabase.from('app_settings').select('*').limit(1).single(),
    ]);

    setParticipants(parts ?? []);
    setPredictions(preds ?? []);
    setResults(res ?? []);
    setTournament(tour ?? null);
    setSettings(sett ?? null);

    if (res) {
      const mr = res.find((r) => r.match_key === 'brazil_morocco');
      const bh = res.find((r) => r.match_key === 'brazil_haiti');
      const bs = res.find((r) => r.match_key === 'brazil_scotland');
      setMatchForm({
        brazil_morocco_brazil_goals: mr?.brazil_goals?.toString() ?? '',
        brazil_morocco_opponent_goals: mr?.opponent_goals?.toString() ?? '',
        brazil_morocco_status: mr?.result_status ?? 'pending',
        brazil_haiti_brazil_goals: bh?.brazil_goals?.toString() ?? '',
        brazil_haiti_opponent_goals: bh?.opponent_goals?.toString() ?? '',
        brazil_haiti_status: bh?.result_status ?? 'pending',
        brazil_scotland_brazil_goals: bs?.brazil_goals?.toString() ?? '',
        brazil_scotland_opponent_goals: bs?.opponent_goals?.toString() ?? '',
        brazil_scotland_status: bs?.result_status ?? 'pending',
      });
    }
    if (tour) {
      setTournamentForm({
        final_group_order: (tour.final_group_order ?? ['', '', '', '']).map((t: string | null) => t ?? ''),
        champion: tour.champion ?? '',
        total_brazil_goals: tour.total_brazil_goals?.toString() ?? '',
      });
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    fetch('/api/admin/recalculate', { method: 'POST' }).then((r) => {
      if (r.ok) { setAuthed(true); loadData(); }
    }).catch(() => {});
  }, [loadData]);

  async function handleSaveResults(e: React.FormEvent) {
    e.preventDefault();
    setSavingResults(true); setResultsMsg('');
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...matchForm,
          tournament: {
            final_group_order: tournamentForm.final_group_order,
            brazil_group_position: tournamentForm.final_group_order.indexOf('Brasil') + 1 || null,
            champion: tournamentForm.champion,
            total_brazil_goals: tournamentForm.total_brazil_goals,
          },
        }),
      });
      if (res.ok) { setResultsMsg('✅ Resultados salvos!'); loadData(); }
      else { setResultsMsg('❌ Erro ao salvar'); }
    } catch { setResultsMsg('❌ Erro de conexão'); }
    finally { setSavingResults(false); }
  }

  async function handleSyncResults() {
    setSyncMsg('⏳ Buscando...');
    try {
      const res = await fetch('/api/admin/sync-results', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(data.updated?.length ? `✅ ${data.updated.join(', ')}` : '✅ Nenhum resultado novo');
        loadData();
      } else {
        setSyncMsg(`❌ ${data.error ?? 'Erro'}`);
      }
    } catch { setSyncMsg('❌ Erro de conexão'); }
    setTimeout(() => setSyncMsg(''), 5000);
  }

  async function handleToggleLock() {
    const newLocked = !settings?.predictions_locked;
    try {
      await fetch('/api/admin/lock', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: newLocked }),
      });
      loadData();
    } catch { /* silencioso */ }
  }

  function getParticipantName(participantId: string) {
    return participants.find((p) => p.id === participantId)?.name ?? '—';
  }

  function setGroupPos(idx: number, team: string) {
    setTournamentForm((prev) => {
      const order = [...prev.final_group_order];
      const cleanedOrder = order.map((item) => (item === team ? '' : item));
      cleanedOrder[idx] = team;
      return { ...prev, final_group_order: cleanedOrder };
    });
  }

  function getAvailableTeamsForTournament(idx: number): string[] {
    const taken = tournamentForm.final_group_order.filter((_, i) => i !== idx && tournamentForm.final_group_order[i] !== '');
    return GROUP_TEAMS.filter((item) => !taken.includes(item));
  }

  if (!authed) {
    return <LoginScreen onLogin={() => { setAuthed(true); loadData(); }} />;
  }

  if (dataLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-manrope)', color: t.inkMuted }}>Carregando...</div>
      </div>
    );
  }

  const finalResults = results.filter((r) => r.result_status === 'final').length;

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: t.bg, borderBottom: `1px solid ${t.line}`,
        padding: '0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BrandMark size={32} />
          <span style={{ fontFamily: 'var(--font-anton)', fontSize: 17, color: t.ink, letterSpacing: 0.4 }}>
            ADMIN
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {syncMsg && (
            <span style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, color: t.inkSoft }}>
              {syncMsg}
            </span>
          )}
          <button
            onClick={handleSyncResults}
            title="Buscar resultados na api-football agora"
            style={{
              height: 34, padding: '0 12px', borderRadius: 10,
              border: `1.5px solid ${t.primary}`, background: hexA(t.primary, 0.08),
              fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', color: t.primary,
            }}
          >
            ⚽ Sync
          </button>
          <button
            onClick={() => window.open('/api/admin/export', '_blank')}
            style={{
              height: 34, padding: '0 12px', borderRadius: 10,
              border: `1.5px solid ${t.line}`, background: t.surface,
              fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', color: t.inkSoft,
            }}
          >
            CSV
          </button>
          <button
            onClick={handleToggleLock}
            style={{
              height: 34, padding: '0 12px', borderRadius: 10,
              border: `1.5px solid ${settings?.predictions_locked ? t.danger : t.line}`,
              background: settings?.predictions_locked ? hexA(t.danger, 0.08) : t.surface,
              fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', color: settings?.predictions_locked ? t.danger : t.inkSoft,
            }}
          >
            {settings?.predictions_locked ? '🔒 Bloqueado' : '🔓 Aberto'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '14px 14px 0', display: 'flex', gap: 10 }}>
        {[
          { label: 'Participantes', value: participants.length, color: t.primary },
          { label: 'Palpites', value: predictions.length, color: t.primary },
          { label: 'Resultados', value: `${finalResults}/3`, color: finalResults === 3 ? t.primary : t.accentInk },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, background: t.surface, borderRadius: 14, padding: '12px 10px',
            border: `1px solid ${t.line}`, textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-anton)', fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10.5, color: t.inkMuted, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, padding: '14px 14px 0', borderBottom: `1px solid ${t.line}`, marginTop: 4 }}>
        {(['resultados', 'participantes', 'palpites'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 14px', border: 'none', background: 'transparent',
                fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12.5,
                letterSpacing: 0.3, textTransform: 'capitalize', cursor: 'pointer',
                color: active ? t.primary : t.inkMuted,
                borderBottom: active ? `2px solid ${t.primary}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, padding: '16px 14px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Resultados tab ────────────────────────────────────────── */}
        {activeTab === 'resultados' && (
          <form onSubmit={handleSaveResults} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card>
              <CardTitle>Resultados das Partidas</CardTitle>
              {[
                { label: 'Brasil vs Marrocos', key: 'brazil_morocco' },
                { label: 'Brasil vs Haiti', key: 'brazil_haiti' },
                { label: 'Brasil vs Escócia', key: 'brazil_scotland' },
              ].map(({ label, key }, idx) => (
                <div key={key} style={{ marginBottom: idx < 2 ? 16 : 0 }}>
                  <Label>{label}</Label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10, color: t.inkMuted, marginBottom: 4 }}>Gols Brasil</div>
                      <NumberInput
                        value={matchForm[`${key}_brazil_goals` as keyof typeof matchForm]}
                        onChange={(v) => setMatchForm((p) => ({ ...p, [`${key}_brazil_goals`]: v }))}
                      />
                    </div>
                    <div style={{ fontFamily: 'var(--font-anton)', fontSize: 22, color: hexA(t.ink, 0.3), marginTop: 22 }}>×</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10, color: t.inkMuted, marginBottom: 4 }}>Gols Adv.</div>
                      <NumberInput
                        value={matchForm[`${key}_opponent_goals` as keyof typeof matchForm]}
                        onChange={(v) => setMatchForm((p) => ({ ...p, [`${key}_opponent_goals`]: v }))}
                      />
                    </div>
                    <div style={{ flex: 1.4 }}>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10, color: t.inkMuted, marginBottom: 4 }}>Status</div>
                      <Select
                        value={matchForm[`${key}_status` as keyof typeof matchForm]}
                        onValueChange={(val) => { if (val) setMatchForm((p) => ({ ...p, [`${key}_status`]: val })); }}
                      >
                        <SelectTrigger style={{ borderRadius: 10, borderColor: t.line }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Card>
              <CardTitle>Resultado do Torneio</CardTitle>
              <Label>Ordem final do Grupo A</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {['1º', '2º', '3º', '4º'].map((pos, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 12, color: t.inkMuted, width: 18, flexShrink: 0 }}>{pos}</span>
                    <Select
                      value={tournamentForm.final_group_order[i] ?? ''}
                      onValueChange={(val) => { if (val) setGroupPos(i, val); }}
                    >
                      <SelectTrigger style={{ flex: 1, borderRadius: 10, borderColor: t.line }}>
                        <SelectValue placeholder="Time..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(tournamentForm.final_group_order[i]
                          ? [tournamentForm.final_group_order[i]!, ...getAvailableTeamsForTournament(i)]
                          : getAvailableTeamsForTournament(i)
                        ).map((team) => (
                          <SelectItem key={team} value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <Label>Campeão do Mundo</Label>
                  <TextInput
                    value={tournamentForm.champion}
                    onChange={(v) => setTournamentForm((p) => ({ ...p, champion: v }))}
                    placeholder="Ex: Brasil"
                  />
                </div>
                <div>
                  <Label>Gols Brasil (total)</Label>
                  <NumberInput
                    value={tournamentForm.total_brazil_goals}
                    onChange={(v) => setTournamentForm((p) => ({ ...p, total_brazil_goals: v }))}
                    placeholder="Ex: 12"
                  />
                </div>
              </div>
            </Card>

            {resultsMsg && (
              <div style={{
                background: resultsMsg.startsWith('✅') ? hexA(t.primary, 0.08) : hexA(t.danger, 0.08),
                border: `1px solid ${resultsMsg.startsWith('✅') ? hexA(t.primary, 0.3) : hexA(t.danger, 0.3)}`,
                borderRadius: 12, padding: '10px 14px',
                fontFamily: 'var(--font-manrope)', fontSize: 13.5, fontWeight: 700,
                color: resultsMsg.startsWith('✅') ? t.primary : t.danger,
              }}>
                {resultsMsg}
              </div>
            )}

            <PrimaryButton style={{ width: '100%' }} disabled={savingResults}>
              {savingResults ? 'Salvando...' : 'Salvar Resultados'}
            </PrimaryButton>
          </form>
        )}

        {/* ── Participantes tab ─────────────────────────────────────── */}
        {activeTab === 'participantes' && (
          <Card>
            <CardTitle>Participantes ({participants.length})</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participants.length === 0 && (
                <div style={{ fontFamily: 'var(--font-manrope)', color: t.inkMuted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  Nenhum participante ainda.
                </div>
              )}
              {participants.map((p) => {
                const hasPred = predictions.some((pr) => pr.participant_id === p.id);
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12,
                    background: hexA(t.ink, 0.04), border: `1px solid ${t.line}`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: t.primary, color: t.primaryInk,
                      fontFamily: 'var(--font-anton)', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 13.5, color: t.ink }}>{p.name}</div>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, color: t.inkMuted }}>{p.phone}</div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 700,
                      padding: '3px 9px', borderRadius: 999,
                      background: hasPred ? hexA(t.primary, 0.1) : hexA(t.ink, 0.06),
                      color: hasPred ? t.primary : t.inkMuted,
                    }}>
                      {hasPred ? '✅ Palpitou' : 'Sem palpite'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Palpites tab ─────────────────────────────────────────── */}
        {activeTab === 'palpites' && (
          <Card>
            <CardTitle>Palpites ({predictions.length})</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {predictions.length === 0 && (
                <div style={{ fontFamily: 'var(--font-manrope)', color: t.inkMuted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  Nenhum palpite enviado ainda.
                </div>
              )}
              {predictions.map((p) => (
                <div key={p.id} style={{
                  borderRadius: 14, border: `1px solid ${t.line}`,
                  background: hexA(t.ink, 0.03), padding: '12px 14px',
                }}>
                  <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 13.5, color: t.ink, marginBottom: 8 }}>
                    {getParticipantName(p.participant_id)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                    {[
                      { label: 'Bra×Mar', bg: p.brazil_morocco_brazil_goals, op: p.brazil_morocco_opponent_goals },
                      { label: 'Bra×Hai', bg: p.brazil_haiti_brazil_goals, op: p.brazil_haiti_opponent_goals },
                      { label: 'Bra×Esc', bg: p.brazil_scotland_brazil_goals, op: p.brazil_scotland_opponent_goals },
                    ].map((m) => (
                      <div key={m.label} style={{
                        background: t.surface, borderRadius: 10, padding: '6px 8px', textAlign: 'center',
                        border: `1px solid ${t.line}`,
                      }}>
                        <div style={{ fontFamily: 'var(--font-manrope)', fontSize: 10, color: t.inkMuted, marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontFamily: 'var(--font-anton)', fontSize: 18, color: t.ink }}>
                          {m.bg ?? '?'}×{m.op ?? '?'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 700, background: hexA(t.accent, 0.2), color: t.accentInk, borderRadius: 999, padding: '2px 9px' }}>
                      🏆 {p.champion ?? '—'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, fontWeight: 700, background: hexA(t.primary, 0.1), color: t.primary, borderRadius: 999, padding: '2px 9px' }}>
                      ⚽ {p.total_brazil_goals ?? '—'} gols
                    </span>
                    <span style={{ fontFamily: 'var(--font-manrope)', fontSize: 11, color: t.inkMuted, marginLeft: 'auto' }}>
                      {new Date(p.submitted_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
