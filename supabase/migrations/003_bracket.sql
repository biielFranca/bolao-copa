CREATE TABLE bracket_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT UNIQUE NOT NULL CHECK (group_id IN ('A','B','C','D','E','F','G','H')),
  first_place TEXT,
  second_place TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO bracket_standings (group_id) VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H');

CREATE TABLE bracket_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  picks JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bracket_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT UNIQUE NOT NULL,
  winner TEXT,
  result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending','final')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bracket_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read bracket_standings" ON bracket_standings FOR SELECT USING (true);
CREATE POLICY "service update bracket_standings" ON bracket_standings FOR UPDATE USING (true);
CREATE POLICY "public read bracket_predictions" ON bracket_predictions FOR SELECT USING (true);
CREATE POLICY "service insert bracket_predictions" ON bracket_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "public read bracket_results" ON bracket_results FOR SELECT USING (true);
CREATE POLICY "service insert bracket_results" ON bracket_results FOR INSERT WITH CHECK (true);
CREATE POLICY "service update bracket_results" ON bracket_results FOR UPDATE USING (true);
