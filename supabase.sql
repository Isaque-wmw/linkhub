-- Execute no Supabase: SQL Editor > New query > Run
create table if not exists public.clients (
  id         text primary key,
  name       text not null,
  notes      text not null default '',
  links      jsonb not null default '[]'::jsonb,
  info       jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Se a tabela já existia (versão anterior), este comando adiciona a coluna nova:
alter table public.clients add column if not exists info jsonb not null default '[]'::jsonb;

alter table public.clients enable row level security;

-- ATENÇÃO: esta política libera leitura/escrita para QUALQUER pessoa que tenha o link do site
-- (a chave anon fica visível no JavaScript). Serve para começar; para uso real, troque por
-- login (Supabase Auth) e use "to authenticated" no lugar de "to anon".
drop policy if exists linkhub_acesso on public.clients;
create policy linkhub_acesso on public.clients
  for all to anon using (true) with check (true);
