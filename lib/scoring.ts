import type { MatchResult, TournamentResult, RankedParticipant } from './types';

const POINTS_EXACT_SCORE = 5;
const POINTS_CORRECT_RESULT = 2;
const POINTS_CHAMPION = 10;
const POINTS_BRAZIL_POSITION_EXACT = 5;
const POINTS_GROUP_POSITION_EACH = 2;

type MatchKey = 'brazil_morocco' | 'brazil_haiti' | 'brazil_scotland';

function getMatchResult(results: MatchResult[], key: MatchKey) {
  return results.find((r) => r.match_key === key) ?? null;
}

function scoreMatch(
  predictedBrazil: number | null,
  predictedOpponent: number | null,
  actualBrazil: number | null,
  actualOpponent: number | null
): { points: number; isExact: boolean } {
  if (
    actualBrazil === null ||
    actualOpponent === null ||
    predictedBrazil === null ||
    predictedOpponent === null
  ) {
    return { points: 0, isExact: false };
  }

  if (predictedBrazil === actualBrazil && predictedOpponent === actualOpponent) {
    return { points: POINTS_EXACT_SCORE, isExact: true };
  }

  const predictedResult = Math.sign(predictedBrazil - predictedOpponent);
  const actualResult = Math.sign(actualBrazil - actualOpponent);

  if (predictedResult === actualResult) {
    return { points: POINTS_CORRECT_RESULT, isExact: false };
  }

  return { points: 0, isExact: false };
}

function scoreGroupOrder(
  predicted: string[] | null,
  actual: string[] | null
): number {
  if (!predicted || !actual || actual.length === 0) return 0;
  let points = 0;
  predicted.forEach((team, index) => {
    if (actual[index] === team) {
      points += POINTS_GROUP_POSITION_EACH;
    }
  });
  return points;
}

// Tipo mínimo necessário — compatível com resultado de queries Supabase com join
type PredictionWithParticipant = {
  participant_id: string;
  participant_name: string;
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
};

export function calculateScores(
  predictions: PredictionWithParticipant[],
  results: MatchResult[],
  tournament: TournamentResult | null
): RankedParticipant[] {
  const morocco = getMatchResult(results, 'brazil_morocco');
  const haiti = getMatchResult(results, 'brazil_haiti');
  const scotland = getMatchResult(results, 'brazil_scotland');

  const scores = predictions.map((p) => {
    const m1 = scoreMatch(
      p.brazil_morocco_brazil_goals,
      p.brazil_morocco_opponent_goals,
      morocco?.result_status === 'final' ? morocco.brazil_goals : null,
      morocco?.result_status === 'final' ? morocco.opponent_goals : null
    );
    const m2 = scoreMatch(
      p.brazil_haiti_brazil_goals,
      p.brazil_haiti_opponent_goals,
      haiti?.result_status === 'final' ? haiti.brazil_goals : null,
      haiti?.result_status === 'final' ? haiti.opponent_goals : null
    );
    const m3 = scoreMatch(
      p.brazil_scotland_brazil_goals,
      p.brazil_scotland_opponent_goals,
      scotland?.result_status === 'final' ? scotland.brazil_goals : null,
      scotland?.result_status === 'final' ? scotland.opponent_goals : null
    );

    const exactScoreCount = [m1, m2, m3].filter((m) => m.isExact).length;
    const matchPoints = m1.points + m2.points + m3.points;

    const correctChampion =
      tournament?.champion !== null &&
      tournament?.champion !== undefined &&
      p.champion?.toLowerCase() === tournament.champion?.toLowerCase();

    const championPoints = correctChampion ? POINTS_CHAMPION : 0;

    const correctBrazilPosition =
      tournament?.brazil_group_position !== null &&
      tournament?.brazil_group_position !== undefined &&
      p.brazil_group_position === tournament.brazil_group_position;

    const brazilPositionPoints = correctBrazilPosition
      ? POINTS_BRAZIL_POSITION_EXACT
      : 0;

    const groupOrderPoints = scoreGroupOrder(
      p.group_order,
      tournament?.final_group_order ?? null
    );

    const brazilGoalsDiff =
      tournament?.total_brazil_goals !== null &&
      tournament?.total_brazil_goals !== undefined &&
      p.total_brazil_goals !== null
        ? Math.abs(p.total_brazil_goals - tournament.total_brazil_goals)
        : null;

    const totalScore =
      matchPoints + championPoints + brazilPositionPoints + groupOrderPoints;

    return {
      participantId: p.participant_id,
      name: p.participant_name,
      totalScore,
      correctChampion: correctChampion ?? false,
      exactScoreCount,
      correctBrazilPosition: correctBrazilPosition ?? false,
      brazilGoalsDiff,
      submittedAt: p.submitted_at,
    };
  });

  // Ordenação com desempate
  scores.sort((a, b) => {
    // 1. Maior pontuação
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // 2. Acertou o campeão
    if (b.correctChampion !== a.correctChampion)
      return b.correctChampion ? 1 : -1;
    // 3. Mais placares exatos
    if (b.exactScoreCount !== a.exactScoreCount)
      return b.exactScoreCount - a.exactScoreCount;
    // 4. Acertou posição do Brasil
    if (b.correctBrazilPosition !== a.correctBrazilPosition)
      return b.correctBrazilPosition ? 1 : -1;
    // 5. Menor diferença em gols do Brasil (mais próximo)
    const aDiff = a.brazilGoalsDiff ?? Infinity;
    const bDiff = b.brazilGoalsDiff ?? Infinity;
    if (aDiff !== bDiff) return aDiff - bDiff;
    // 6. Quem enviou primeiro
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  return scores.map((s, i) => ({ ...s, position: i + 1 }));
}
