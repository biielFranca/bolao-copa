'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { Participant, Prediction, MatchResult, TournamentResult, AppSettings } from '@/lib/types';

const GROUP_TEAMS = ['Brasil', 'Marrocos', 'Haiti', 'Escócia'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [tournament, setTournament] = useState<TournamentResult | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Results form
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

    // Preencher formulário com dados existentes
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
        loadData();
      } else {
        setLoginError('Senha incorreta');
      }
    } catch { setLoginError('Erro de conexão'); }
    finally { setLoginLoading(false); }
  }

  useEffect(() => {
    // Verificar se já tem cookie de admin (tentativa silenciosa)
    fetch('/api/admin/recalculate', { method: 'POST' }).then((r) => {
      if (r.ok) { setAuthed(true); loadData(); }
    }).catch(() => {});
  }, [loadData]);

  async function handleSaveResults(e: React.FormEvent) {
    e.preventDefault();
    setSavingResults(true);
    setResultsMsg('');
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (res.ok) { setResultsMsg('Resultados salvos com sucesso!'); loadData(); }
      else { setResultsMsg('Erro ao salvar resultados'); }
    } catch { setResultsMsg('Erro de conexão'); }
    finally { setSavingResults(false); }
  }

  async function handleToggleLock() {
    const newLocked = !settings?.predictions_locked;
    try {
      const res = await fetch('/api/admin/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: newLocked }),
      });
      if (res.ok) loadData();
    } catch { /* silencioso */ }
  }

  async function handleExport() {
    window.open('/api/admin/export', '_blank');
  }

  function getParticipantName(participantId: string) {
    return participants.find((p) => p.id === participantId)?.name ?? '—';
  }

  function setGroupPos(idx: number, team: string) {
    setTournamentForm((prev) => {
      const order = [...prev.final_group_order];
      // remover time de outras posições
      const cleanedOrder = order.map((t) => (t === team ? '' : t));
      cleanedOrder[idx] = team;
      return { ...prev, final_group_order: cleanedOrder };
    });
  }

  function getAvailableTeamsForTournament(idx: number): string[] {
    const taken = tournamentForm.final_group_order.filter((_, i) => i !== idx && tournamentForm.final_group_order[i] !== '');
    return GROUP_TEAMS.filter((t) => !taken.includes(t));
  }

  if (!authed) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin — Bolão da Copa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha de administrador</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (dataLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Carregando dados...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 pb-8">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Painel Admin — Bolão da Copa</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Exportar CSV
            </Button>
            <Button
              size="sm"
              variant={settings?.predictions_locked ? 'destructive' : 'outline'}
              onClick={handleToggleLock}
            >
              {settings?.predictions_locked ? '🔒 Palpites bloqueados' : '🔓 Bloquear palpites'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-green-700">{participants.length}</div>
              <div className="text-sm text-gray-500">Participantes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-green-700">{predictions.length}</div>
              <div className="text-sm text-gray-500">Palpites enviados</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-green-700">
                {results.filter((r) => r.result_status === 'final').length}/3
              </div>
              <div className="text-sm text-gray-500">Resultados finalizados</div>
            </CardContent>
          </Card>
        </div>

        {/* Entrada de resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Inserir Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveResults} className="space-y-5">
              {[
                { label: 'Brasil vs Marrocos', key: 'brazil_morocco' },
                { label: 'Brasil vs Haiti', key: 'brazil_haiti' },
                { label: 'Brasil vs Escócia', key: 'brazil_scotland' },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <Label className="font-semibold">{label}</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Gols Brasil</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        className="text-center"
                        value={matchForm[`${key}_brazil_goals` as keyof typeof matchForm]}
                        onChange={(e) =>
                          setMatchForm((prev) => ({
                            ...prev,
                            [`${key}_brazil_goals`]: e.target.value.replace(/\D/g, '').slice(0, 2),
                          }))
                        }
                      />
                    </div>
                    <span className="text-gray-400 mt-4">×</span>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Gols Adv.</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        className="text-center"
                        value={matchForm[`${key}_opponent_goals` as keyof typeof matchForm]}
                        onChange={(e) =>
                          setMatchForm((prev) => ({
                            ...prev,
                            [`${key}_opponent_goals`]: e.target.value.replace(/\D/g, '').slice(0, 2),
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Status</Label>
                      <Select
                        value={matchForm[`${key}_status` as keyof typeof matchForm]}
                        onValueChange={(val) => {
                          if (val) setMatchForm((prev) => ({ ...prev, [`${key}_status`]: val }));
                        }}
                      >
                        <SelectTrigger>
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

              {/* Tournament results */}
              <div className="border-t pt-4 space-y-3">
                <Label className="font-semibold">Resultado do Torneio</Label>

                <div>
                  <Label className="text-sm text-gray-600">Ordem final do grupo</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {['1º', '2º', '3º', '4º'].map((pos, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6">{pos}</span>
                        <Select
                          value={tournamentForm.final_group_order[i] ?? ''}
                          onValueChange={(val) => { if (val) setGroupPos(i, val); }}
                        >
                          <SelectTrigger className="flex-1">
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Campeão do Mundo</Label>
                    <Input
                      placeholder="Ex: Brasil"
                      value={tournamentForm.champion}
                      onChange={(e) => setTournamentForm((prev) => ({ ...prev, champion: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Total gols Brasil</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: 14"
                      value={tournamentForm.total_brazil_goals}
                      onChange={(e) =>
                        setTournamentForm((prev) => ({
                          ...prev,
                          total_brazil_goals: e.target.value.replace(/\D/g, '').slice(0, 2),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {resultsMsg && (
                <p className={`text-sm ${resultsMsg.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                  {resultsMsg}
                </p>
              )}

              <Button type="submit" disabled={savingResults} className="w-full">
                {savingResults ? 'Salvando...' : 'Salvar Resultados'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card>
          <CardHeader>
            <CardTitle>Participantes ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Palpitou?</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>
                      {predictions.some((pr) => pr.participant_id === p.id) ? '✅' : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Palpites */}
        <Card>
          <CardHeader>
            <CardTitle>Palpites enviados ({predictions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participante</TableHead>
                    <TableHead>Bra×Mar</TableHead>
                    <TableHead>Bra×Hai</TableHead>
                    <TableHead>Bra×Esc</TableHead>
                    <TableHead>Campeão</TableHead>
                    <TableHead>Gols Bra</TableHead>
                    <TableHead>Enviado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{getParticipantName(p.participant_id)}</TableCell>
                      <TableCell>{p.brazil_morocco_brazil_goals}×{p.brazil_morocco_opponent_goals}</TableCell>
                      <TableCell>{p.brazil_haiti_brazil_goals}×{p.brazil_haiti_opponent_goals}</TableCell>
                      <TableCell>{p.brazil_scotland_brazil_goals}×{p.brazil_scotland_opponent_goals}</TableCell>
                      <TableCell>{p.champion ?? '—'}</TableCell>
                      <TableCell>{p.total_brazil_goals ?? '—'}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(p.submitted_at).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
