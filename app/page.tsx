'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function formatPhoneInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
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
    setError('');
    if (!name.trim()) { setError('Digite seu nome para continuar'); return; }
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
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">⚽🇧🇷</div>
          <h1 className="text-2xl font-bold text-green-800">Bolão da Copa</h1>
          <p className="text-gray-600 text-sm">Lau Burguer</p>
        </div>

        <Card>
          {step === 'phone' ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Entrar no Bolão</CardTitle>
                <CardDescription>Digite seu número de celular para participar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      inputMode="numeric"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
                    {loading ? 'Verificando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Primeiro acesso</CardTitle>
                <CardDescription>Bem-vindo! Como podemos te chamar?</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu nome</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Continuar'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => { setStep('phone'); setError(''); }}
                  >
                    Voltar
                  </button>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        <div className="text-center space-y-2">
          <a href="/ranking" className="text-sm text-green-700 hover:underline">
            Ver ranking atual →
          </a>
          <p className="text-xs text-gray-400">
            Um número por participação. Sem senha necessária.
          </p>
        </div>
      </div>
    </main>
  );
}
