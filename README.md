# LinkHub

Gerenciador de links de ambientes (PRD/HOM/...) por cliente. HTML/CSS/JS puro, sem build.

## Rodar
Abra `index.html` (modo local, dados só no navegador) ou publique no GitHub Pages.

## Banco compartilhado (Supabase, grátis)
1. Crie um projeto em https://supabase.com.
2. SQL Editor: cole e execute o conteúdo de `supabase.sql`.
3. Project Settings > API: copie a **Project URL** e a chave **anon public**.
4. Copie `js/00-config.example.js` para `js/00-config.js` (se ainda não existir), cole a URL e a chave e faça commit/push.
   O `00-config.js` é só seu: ao atualizar o projeto com um zip novo, **não sobrescreva** esse arquivo.
5. Todos que abrirem o site passam a ver os mesmos dados (sincroniza a cada 5 s).

> A política do `supabase.sql` deixa o banco aberto a quem tiver o link. Para restringir à equipe, adicione login com Supabase Auth.

## GitHub Pages
Settings > Pages > Deploy from a branch > `main` / root.

## Estrutura
- `js/00-config.js` configuração
- `js/02-models.js` modelos · `js/03-repository.js` persistência (local ou Supabase) · `js/04-services.js` regras de CRUD
- `js/05-ui.js`, `06-components.js`, `07-forms.js`, `08-pages.js`, `09-app.js` interface e roteador
