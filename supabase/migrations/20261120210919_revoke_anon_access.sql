-- Visitante sem login (anon) não acessa nenhum dado: o app só lê/grava depois
-- do login. As regras de acesso (RLS) já bloqueavam, isto tira a permissão
-- de vez (defesa em camadas).

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;

-- tabelas, sequências e funções criadas daqui em diante também nascem sem anon
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
