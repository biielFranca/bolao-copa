import { createServiceClient } from '@/lib/supabase/server';
import { calculateScores } from '@/lib/scoring';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

  const positionEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `${pos}º`;
  };

  return (
    <main className="flex-1 p-4 pb-8">
      <div className="w-full max-w-lg mx-auto space-y-5">
        <div className="text-center space-y-1">
          <div className="text-3xl">🏆</div>
          <h1 className="text-xl font-bold text-green-800">Ranking do Bolão</h1>
          <p className="text-gray-500 text-sm">Lau Burguer — Copa do Mundo</p>
        </div>

        {!hasResults && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-center">
            <p className="text-sm text-yellow-700">
              Os resultados ainda não foram inseridos. A pontuação será calculada após as partidas.
            </p>
          </div>
        )}

        {ranked.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">Nenhum palpite enviado ainda.</p>
              <Link href="/" className="mt-3 inline-block text-green-700 hover:underline text-sm">
                Participar →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ranked.map((p) => (
              <Card
                key={p.participantId}
                className={p.position <= 3 ? 'border-green-200 bg-green-50' : ''}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold w-10">{positionEmoji(p.position)}</span>
                      <CardTitle className="text-base font-semibold">{p.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">
                        {hasResults ? p.totalScore : '—'}
                      </div>
                      {hasResults && (
                        <div className="text-xs text-gray-500">pontos</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {hasResults && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {p.correctChampion && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          🏆 Campeão certo
                        </Badge>
                      )}
                      {p.exactScoreCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          ⚽ {p.exactScoreCount} placar{p.exactScoreCount > 1 ? 'es' : ''} exato{p.exactScoreCount > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {p.correctBrazilPosition && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          🇧🇷 Pos. Brasil certa
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/" className="text-sm text-green-700 hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
