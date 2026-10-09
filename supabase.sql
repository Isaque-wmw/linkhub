-- Execute no Supabase: SQL Editor > New query > Run
create table if not exists public.clients (
  id         text primary key,
  name       text not null,
  notes      text not null default '',
  links      jsonb not null default '[]'::jsonb,
  info       jsonb not null default '[]'::jsonb,
  files      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Se a tabela já existia (versão anterior), este comando adiciona a coluna nova:
alter table public.clients add column if not exists info jsonb not null default '[]'::jsonb;

alter table public.clients add column if not exists files jsonb not null default '[]'::jsonb;

alter table public.clients enable row level security;

-- ATENÇÃO: esta política libera leitura/escrita para QUALQUER pessoa que tenha o link do site
-- (a chave anon fica visível no JavaScript). Serve para começar; para uso real, troque por
-- login (Supabase Auth) e use "to authenticated" no lugar de "to anon".
drop policy if exists linkhub_acesso on public.clients;
create policy linkhub_acesso on public.clients
  for all to anon using (true) with check (true);

-- ===== Arquivos anexados (Storage) =====
-- Bucket privado com limite de 5 MB por arquivo, aplicado pelo próprio Supabase.
insert into storage.buckets (id, name, public, file_size_limit)
values ('linkhub-files', 'linkhub-files', false, 5242880)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

-- ATENÇÃO: igual à tabela, libera acesso a quem tiver o link do site. Restrinja com login (Supabase Auth).
drop policy if exists linkhub_files_acesso on storage.objects;
create policy linkhub_files_acesso on storage.objects
  for all to anon
  using (bucket_id = 'linkhub-files') with check (bucket_id = 'linkhub-files');
