'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

const TEAMS = ['Brasil', 'Marrocos', 'Haiti', 'Escócia'];
const POSITIONS = ['1º', '2º', '3º', '4º'];

type GroupOrder = Record<string, string>;

export default function PalpitesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [locked, setLocked] = useState(false);

  // Form state
  const [scores, setScores] = useState({
    brazil_morocco_brazil_goals: '',
    brazil_morocco_opponent_goals: '',
    brazil_haiti_brazil_goals: '',
    brazil_haiti_opponent_goals: '',
    brazil_scotland_brazil_goals: '',
    brazil_scotland_opponent_goals: '',
  });

  // Ordem do grupo: posição -> time
  const [groupOrder, setGroupOrder] = useState<GroupOrder>({
    '0': '',
    '1': '',
    '2': '',
    '3': '',
  });

  const [champion, setChampion] = useState('');
  const [totalBrazilGoals, setTotalBrazilGoals] = useState('');

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

  function setScore(field: keyof typeof scores, value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 2);
    setScores((prev) => ({ ...prev, [field]: digits }));
  }

  function setGroupPosition(posIndex: string, team: string) {
    setGroupOrder((prev) => {
      const updated = { ...prev };
      // remover este time de outras posições
      Object.keys(updated).forEach((k) => {
        if (updated[k] === team) updated[k] = '';
      });
      updated[posIndex] = team;
      return updated;
    });
  }

  function getGroupOrderArray(): string[] {
    return [groupOrder['0'], groupOrder['1'], groupOrder['2'], groupOrder['3']];
  }

  function getAvailableTeams(currentPos: string): string[] {
    const taken = Object.entries(groupOrder)
      .filter(([k, v]) => k !== currentPos && v !== '')
      .map(([, v]) => v);
    return TEAMS.filter((t) => !taken.includes(t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const orderArr = getGroupOrderArray();
    if (orderArr.some((t) => !t)) {
      setError('Preencha a ordem completa do grupo (1º ao 4º)');
      return;
    }
    if (!champion.trim()) {
      setError('Selecione ou digite o campeão do mundo');
      return;
    }
    if (totalBrazilGoals === '') {
      setError('Informe o total de gols do Brasil');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/palpites/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scores,
          group_order: orderArr,
          champion: champion.trim(),
          total_brazil_goals: Number(totalBrazilGoals),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao enviar palpites');
        return;
      }

      router.push('/ranking');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  if (locked && !alreadySubmitted) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Palpites encerrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">O prazo para envio de palpites foi encerrado.</p>
            <a href="/ranking" className="block text-green-700 hover:underline">
              Ver ranking →
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (alreadySubmitted) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Palpites enviados! ✅</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Você já enviou seus palpites. Não é possível alterar após o envio.
            </p>
            <a href="/ranking" className="block text-green-700 hover:underline font-medium">
              Ver ranking atual →
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 pb-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="text-3xl">⚽🇧🇷</div>
          <h1 className="text-xl font-bold text-green-800">Seus Palpites</h1>
          <p className="text-gray-500 text-sm">Preencha tudo e envie. Não é possível alterar depois.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Partidas */}
          {[
            { label: 'Brasil vs Marrocos', key: 'brazil_morocco' },
            { label: 'Brasil vs Haiti', key: 'brazil_haiti' },
            { label: 'Brasil vs Escócia', key: 'brazil_scotland' },
          ].map(({ label, key }) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-500">Brasil</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="text-center text-lg font-bold"
                      value={scores[`${key}_brazil_goals` as keyof typeof scores]}
                      onChange={(e) => setScore(`${key}_brazil_goals` as keyof typeof scores, e.target.value)}
                      required
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-400 mt-5">×</span>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-500">Adversário</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="text-center text-lg font-bold"
                      value={scores[`${key}_opponent_goals` as keyof typeof scores]}
                      onChange={(e) => setScore(`${key}_opponent_goals` as keyof typeof scores, e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Ordem do grupo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ordem final do Grupo do Brasil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {POSITIONS.map((pos, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-gray-600">{pos}</span>
                  <Select
                    value={groupOrder[String(i)] || ''}
                    onValueChange={(val) => { if (val) setGroupPosition(String(i), val); }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar time..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(groupOrder[String(i)]
                        ? [groupOrder[String(i)], ...getAvailableTeams(String(i))]
                        : getAvailableTeams(String(i))
                      ).map((team) => (
                        <SelectItem key={team} value={team}>{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Campeão */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Campeão do Mundo 🏆</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Ex: Brasil, Argentina, França..."
                value={champion}
                onChange={(e) => setChampion(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Total gols Brasil */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Total de gols do Brasil no torneio</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 12"
                value={totalBrazilGoals}
                onChange={(e) => setTotalBrazilGoals(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="text-center text-lg font-bold"
                required
              />
              <p className="text-xs text-gray-500 mt-2">Usado como critério de desempate</p>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 text-base"
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar Palpites ⚽'}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Ao enviar, seus palpites são definitivos e não podem ser alterados.
          </p>
        </form>
      </div>
    </main>
  );
}
