-- participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- predictions (um por participante)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  brazil_morocco_brazil_goals INT,
  brazil_morocco_opponent_goals INT,
  brazil_haiti_brazil_goals INT,
  brazil_haiti_opponent_goals INT,
  brazil_scotland_brazil_goals INT,
  brazil_scotland_opponent_goals INT,
  group_order TEXT[],         -- ex: ['Brasil','Marrocos','Haiti','Escócia']
  brazil_group_position INT,  -- 1 a 4 (derivado de group_order, salvo para facilitar queries)
  champion TEXT,
  total_brazil_goals INT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- results (por partida)
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_key TEXT UNIQUE NOT NULL CHECK (match_key IN ('brazil_morocco', 'brazil_haiti', 'brazil_scotland')),
  brazil_goals INT,
  opponent_goals INT,
  result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending', 'final'))
);

-- tournament_results (linha única — campeão, ordem do grupo, gols Brasil)
CREATE TABLE tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  final_group_order TEXT[],
  brazil_group_position INT,
  champion TEXT,
  total_brazil_goals INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- app_settings (linha única — configurações globais)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predictions_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: configuração inicial
INSERT INTO app_settings (predictions_locked) VALUES (FALSE);

-- Seed: resultados iniciais (pending)
INSERT INTO results (match_key, result_status) VALUES
  ('brazil_morocco', 'pending'),
  ('brazil_haiti', 'pending'),
  ('brazil_scotland', 'pending');

-- Seed: linha de tournament_results vazia
INSERT INTO tournament_results DEFAULT VALUES;
