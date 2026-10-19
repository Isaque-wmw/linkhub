# LinkHub

Gerenciador de links de ambientes (PRD, HOM, Suporte…) por cliente, usado pela equipe para localizar rápido o ambiente certo de cada cliente.

**Em produção:** https://linkhubwmw.netlify.app/

HTML, CSS e JavaScript puros, **sem build e sem dependências**. Os dados ficam em um banco **Supabase** compartilhado: o que uma pessoa cadastra aparece para todas (atualização automática a cada 5 s).

## Funcionalidades
- Clientes em cards, com busca por nome e atalhos diretos para PRD/HOM/outros ambientes.
- Vários links por cliente, agrupados por ambiente (PRD, HOM, Suporte ou outro).
- Painel **Informações** por cliente (ERP, Integração, VPN, Observação… ou campos livres). URLs digitadas viram links clicáveis depois de salvas.
- **Arquivos** anexados por cliente (até 10 arquivos de 5 MB), guardados no Supabase Storage.
- Dashboard com totais de clientes, links e ambientes de produção.
- Tema **escuro, claro ou automático** (segue o sistema) e menu lateral retrátil.
- Responsivo: o layout se ajusta de celulares a monitores grandes.

## Configurações (menu lateral → Configurações)
Ficam salvas no navegador de cada pessoa:
- **Tema da interface:** Escuro, Claro ou Automático. O botão do menu lateral também alterna.
- **Abrir links:** *Nova aba* (padrão) ou *Aba atual*. Vale para os links dos clientes, os atalhos dos cards e as URLs do painel Informações.

## Configurar o Supabase (para montar do zero)
1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, execute o conteúdo de `supabase.sql`. Ele cria a tabela `clients` (com `links`, `info` e `files`) e o bucket privado `linkhub-files` (limite de 5 MB por arquivo). Pode ser executado de novo sem problemas.
3. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public*.
4. Preencha `js/00-config.js`:
   ```js
   const CONFIG={ supabaseUrl:'https://SEU-PROJETO.supabase.co', supabaseKey:'SUA_CHAVE_ANON' };
   ```
   Com os campos vazios o app roda em **modo local** (dados só no navegador).

> **Segurança:** a chave `anon` é pública por natureza (fica visível no JavaScript). Quem protege os dados são as políticas (RLS) do Supabase, e as do `supabase.sql` deixam leitura e escrita abertas a quem tiver o link do site. Não guarde senhas ou credenciais de VPN nos campos do app. Para restringir à equipe, adicione login com Supabase Auth e troque `to anon` por `to authenticated` nas políticas.

## Publicação (Netlify)
Site estático: não precisa de comando de build. Publique a pasta raiz do repositório (*Publish directory* vazio ou `.`). Se o site estiver conectado a este repositório, cada push na branch `main` gera um novo deploy.

Para rodar localmente, basta abrir `index.html` no navegador.

## Estrutura
```
index.html          página única (shell, menu lateral)
css/styles.css      tema escuro/claro e componentes
images/             favicons (claro e escuro)
supabase.sql        tabela, bucket e políticas
js/
  00-config.js      URL e chave do Supabase
  01-icons.js       ícones SVG
  02-models.js      modelos, ambientes e limites de anexos
  03-repository.js  persistência (Supabase ou local)
  03-files.js       armazenamento de arquivos (Storage ou IndexedDB)
  04-services.js    regras de CRUD
  05-ui.js          toast, modal, confirmação, formulário e preferências
  06-components.js  cards, linhas de link, painéis de Informações e Arquivos
  07-forms.js       formulários de cliente e link
  08-pages.js       Dashboard, Clientes, Cliente e Configurações
  09-app.js         tema, roteador e inicialização
```
Para usar outro backend (API própria), crie um objeto com `start(set)`, `put(c)` e `del(id)` em `03-repository.js`, como o `SupabaseBackend`.

## Limites de arquivos
Ficam em `LIMITS` (`js/02-models.js`). O limite de 5 MB também é imposto pelo Supabase (`supabase.sql`); se mudar o tamanho, altere nos dois lugares e execute o SQL de novo.
