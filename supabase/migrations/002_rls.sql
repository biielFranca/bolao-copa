-- Habilitar RLS em todas as tabelas
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- participants: leitura pública; escrita via service role (server-side)
CREATE POLICY "public read participants"
  ON participants FOR SELECT USING (true);

CREATE POLICY "service insert participants"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "service update participants"
  ON participants FOR UPDATE
  USING (true);

-- predictions: leitura pública; escrita via service role
CREATE POLICY "public read predictions"
  ON predictions FOR SELECT USING (true);

CREATE POLICY "service insert predictions"
  ON predictions FOR INSERT
  WITH CHECK (true);

-- results: leitura pública; escrita via service role
CREATE POLICY "public read results"
  ON results FOR SELECT USING (true);

CREATE POLICY "service update results"
  ON results FOR UPDATE USING (true);

-- tournament_results: leitura pública; escrita via service role
CREATE POLICY "public read tournament_results"
  ON tournament_results FOR SELECT USING (true);

CREATE POLICY "service update tournament_results"
  ON tournament_results FOR UPDATE USING (true);

-- app_settings: leitura pública; escrita via service role
CREATE POLICY "public read app_settings"
  ON app_settings FOR SELECT USING (true);

CREATE POLICY "service update app_settings"
  ON app_settings FOR UPDATE USING (true);
