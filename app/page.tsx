'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme, hexA } from '@/lib/design-tokens';
import { BrandMark } from '@/components/ui/brand-mark';
import { BgStripes } from '@/components/ui/bg-stripes';

const t = theme;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validPhone = phone.replace(/\D/g, '').length >= 10;

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validPhone) { setError('Coloca o DDD + número, ex.: (11) 9XXXX-XXXX'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erro ao verificar telefone'); return; }
      if (data.isNew) { setStep('name'); } else { router.push('/palpites'); }
    } catch { setError('Erro de conexão. Tente novamente.'); }
    finally { setLoading(false); }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Digite seu nome para continuar'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erro ao cadastrar'); return; }
      router.push('/palpites');
    } catch { setError('Erro de conexão. Tente novamente.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Hero */}
      <div style={{
        position: 'relative',
        background: t.primary,
        color: t.primaryInk,
        paddingTop: 56,
        paddingBottom: 28,
        overflow: 'hidden',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}>
        <BgStripes opacity={0.14} />

        {/* Tape ticker */}
        <div style={{
          position: 'absolute',
          top: 60,
          left: -20,
          right: -20,
          background: t.accent,
          color: t.accentInk,
          transform: 'rotate(-3deg)',
          padding: '6px 0',
          fontFamily: 'var(--font-anton), Anton, sans-serif',
          fontSize: 14,
          letterSpacing: 2,
          textAlign: 'center',
          textTransform: 'uppercase',
          boxShadow: '0 4px 0 rgba(0,0,0,0.18)',
          zIndex: 1,
        }}>
          ★ COPA 2026 · BOLÃO DA LAU · COMBO GRÁTIS ★ COPA 2026 ★
        </div>

        <div style={{ position: 'relative', padding: '70px 24px 0', zIndex: 2 }}>
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
            <BrandMark size={80} badge={false} />
            <div style={{
              fontFamily: 'var(--font-anton), Anton, sans-serif',
              fontSize: 16,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              background: t.accent,
              color: t.accentInk,
              padding: '4px 10px',
              borderRadius: 6,
              transform: 'rotate(-2deg)',
              boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
            }}>
              Bolão da Copa
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-anton), Anton, sans-serif',
            fontSize: 64,
            lineHeight: 0.92,
            letterSpacing: -1,
            margin: 0,
            whiteSpace: 'pre-line',
            textTransform: 'uppercase',
            textShadow: `0 3px 0 ${t.primaryDeep}`,
          }}>
            {'Palpite.\nComa.\nGanhe.'}
          </h1>

          <p style={{
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontSize: 15,
            lineHeight: 1.4,
            marginTop: 14,
            marginBottom: 22,
            opacity: 0.95,
            maxWidth: 300,
          }}>
            Dê seus palpites, some pontos e concorra a um combo com Smash Duplo Bacon, Batata 150g e Guaraná na Lau.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 20px 0', flex: 1 }}>

        {/* Phone / Name card */}
        <div style={{
          background: t.surface,
          borderRadius: 22,
          padding: 18,
          boxShadow: `0 8px 24px ${hexA(t.primaryDeep, 0.12)}, 0 0 0 1px ${t.line}`,
        }}>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit}>
              <div style={{
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                color: t.inkMuted,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}>
                Seu celular
              </div>

              {/* Phone input row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderBottom: `2px solid ${error ? t.danger : t.ink}`,
                paddingBottom: 8,
              }}>
                <span style={{
                  fontFamily: 'var(--font-anton), Anton, sans-serif',
                  fontSize: 24,
                  color: t.ink,
                }}>
                  +55
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(11) 9XXXX-XXXX"
                  value={phone}
                  onChange={(e) => { setError(null); setPhone(formatPhone(e.target.value)); }}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-anton), Anton, sans-serif',
                    fontSize: 24,
                    letterSpacing: 0.5,
                    color: t.ink,
                    padding: 0,
                  }}
                />
              </div>

              {error && (
                <div style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontSize: 12.5,
                  color: t.danger,
                  fontWeight: 700,
                }}>
                  {error}
                </div>
              )}

              <div style={{
                marginTop: 12,
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: 11.5,
                color: t.inkMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                1 número = 1 participação. Sem cadastro chato.
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 16,
                  width: '100%',
                  background: loading ? hexA(t.primary, 0.6) : t.primary,
                  color: t.primaryInk,
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px 0',
                  fontFamily: 'var(--font-anton), Anton, sans-serif',
                  fontSize: 20,
                  letterSpacing: 0.5,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 4px 0 ${t.primaryDeep}`,
                  transition: 'all 0.15s',
                }}>
                {loading ? 'Verificando...' : 'Entrar no bolão →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit}>
              <div style={{
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                color: t.inkMuted,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}>
                Primeiro acesso — como te chamamos?
              </div>

              <div style={{
                borderBottom: `2px solid ${error ? t.danger : t.ink}`,
                paddingBottom: 8,
              }}>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => { setError(null); setName(e.target.value); }}
                  autoFocus
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-anton), Anton, sans-serif',
                    fontSize: 24,
                    letterSpacing: 0.5,
                    color: t.ink,
                    padding: 0,
                  }}
                />
              </div>

              {error && (
                <div style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontSize: 12.5,
                  color: t.danger,
                  fontWeight: 700,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 16,
                  width: '100%',
                  background: loading ? hexA(t.primary, 0.6) : t.primary,
                  color: t.primaryInk,
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px 0',
                  fontFamily: 'var(--font-anton), Anton, sans-serif',
                  fontSize: 20,
                  letterSpacing: 0.5,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 4px 0 ${t.primaryDeep}`,
                  transition: 'all 0.15s',
                }}>
                {loading ? 'Cadastrando...' : 'Continuar →'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setError(null); }}
                style={{
                  marginTop: 10,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontSize: 13,
                  color: t.inkMuted,
                  cursor: 'pointer',
                  padding: '8px 0',
                }}>
                ← Voltar
              </button>
            </form>
          )}
        </div>

        {/* Mini explainer */}
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          {[
            { n: '1', t: 'Coloca seu nº' },
            { n: '2', t: 'Chuta os jogos' },
            { n: '3', t: 'Ganha um incrível combo Smash da Lau Burger' },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                flex: 1,
                background: t.surface,
                borderRadius: 14,
                padding: '10px 8px',
                textAlign: 'center',
                border: `1px solid ${t.line}`,
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: t.accent,
                color: t.accentInk,
                fontFamily: 'var(--font-anton), Anton, sans-serif',
                fontSize: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
                lineHeight: 1,
              }}>
                {s.n}
              </div>
              <div style={{
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: 11.5,
                fontWeight: 700,
                color: t.ink,
              }}>
                {s.t}
              </div>
            </div>
          ))}
        </div>

        {/* Ranking link */}
        <div style={{ marginTop: 18, textAlign: 'center', paddingBottom: 28 }}>
          <a
            href="/ranking"
            style={{
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: t.primary,
              textDecoration: 'none',
            }}
          >
            Ver o ranking sem entrar →
          </a>
        </div>
      </div>
    </div>
  );
}
