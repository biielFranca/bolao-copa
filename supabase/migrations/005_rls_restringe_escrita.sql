-- Fecha o acesso público direto ao banco.
--
-- As políticas de 002_rls.sql e 003_bracket.sql se chamavam "public read" e
-- "service ...", mas nenhuma tinha cláusula TO. Sem TO, a política vale para
-- PUBLIC — inclusive o papel `anon`. Com a chave publicável (que vai no bundle
-- do navegador), qualquer visitante podia:
--
--   * listar `participants`, que guarda NOME e TELEFONE de todo mundo;
--   * alterar a classificação, os resultados e as travas em `app_settings`;
--   * inserir palpites fora do site, ignorando a trava de horário.
--
-- Bastava chamar a API REST do Supabase direto, sem passar pelas telas.
--
-- Nada no app depende dessas políticas: toda leitura e escrita acontece em
-- app/api/**, com createServiceClient() — e o papel service_role ignora RLS.
-- O painel admin era a única exceção (lia direto do navegador) e passou a usar
-- /api/admin/data, protegida por getAdminSessionFromRequest().
--
-- Com RLS ligado e nenhuma política, `anon` e `authenticated` não leem nem
-- escrevem nada: o padrão do RLS é negar.

drop policy if exists "public read participants"          on participants;
drop policy if exists "service insert participants"       on participants;
drop policy if exists "service update participants"       on participants;

drop policy if exists "public read predictions"           on predictions;
drop policy if exists "service insert predictions"        on predictions;

drop policy if exists "public read results"               on results;
drop policy if exists "service update results"            on results;

drop policy if exists "public read tournament_results"    on tournament_results;
drop policy if exists "service update tournament_results" on tournament_results;

drop policy if exists "public read app_settings"          on app_settings;
drop policy if exists "service update app_settings"       on app_settings;

drop policy if exists "public read bracket_standings"     on bracket_standings;
drop policy if exists "service update bracket_standings"  on bracket_standings;

drop policy if exists "public read bracket_predictions"   on bracket_predictions;
drop policy if exists "service insert bracket_predictions" on bracket_predictions;

drop policy if exists "public read bracket_results"       on bracket_results;
drop policy if exists "service insert bracket_results"    on bracket_results;
drop policy if exists "service update bracket_results"    on bracket_results;
