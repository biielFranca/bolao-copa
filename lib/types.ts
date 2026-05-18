export type Participant = {
  id: string;
  phone: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Prediction = {
  id: string;
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
  updated_at: string;
};

export type MatchResult = {
  id: string;
  match_key: 'brazil_morocco' | 'brazil_haiti' | 'brazil_scotland';
  brazil_goals: number | null;
  opponent_goals: number | null;
  result_status: 'pending' | 'final';
};

export type TournamentResult = {
  id: string;
  final_group_order: string[] | null;
  brazil_group_position: number | null;
  champion: string | null;
  total_brazil_goals: number | null;
  updated_at: string;
};

export type AppSettings = {
  id: string;
  predictions_locked: boolean;
  updated_at: string;
};

export type RankedParticipant = {
  position: number;
  participantId: string;
  name: string;
  totalScore: number;
  correctChampion: boolean;
  exactScoreCount: number;
  correctBrazilPosition: boolean;
  brazilGoalsDiff: number | null;
  submittedAt: string;
};
