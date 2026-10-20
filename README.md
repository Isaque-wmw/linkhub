# LinkHub

Gerenciador de links de ambientes (PRD, HOM, Suporte…) por cliente, usado pela equipe para localizar rápido o ambiente certo de cada cliente.

**Em produção:** https://linkhubwmw.netlify.app/

HTML, CSS e JavaScript puros, **sem build e sem dependências**. Os dados ficam em um banco **Supabase** compartilhado: o que uma pessoa cadastra aparece para todas (atualização automática a cada 5 s).

## Funcionalidades
- Clientes em cards, com busca por nome e atalhos diretos para PRD/HOM/outros ambientes.
- Vários links por cliente, agrupados por ambiente (PRD, HOM, Suporte ou outro).
- Painel **Informações** por cliente (ERP, Integração, VPN, Observação… ou campos livres). URLs digitadas viram links clicáveis depois de salvas.
- **Arquivos** anexados por cliente (até 10 arquivos de 5 MB), guardados no Supabase Storage.
- **Links Úteis:** tela à parte para cadastrar links importantes da equipe (título, URL, descrição e seção), agrupados por seção, com busca e edição.
- Dashboard com totais de clientes, links e ambientes de produção.
- Tema **escuro, claro ou automático** (segue o sistema) e menu lateral retrátil.
- Responsivo: o layout se ajusta de celulares a monitores grandes.

## Configurações (menu lateral → Configurações)
Ficam salvas no navegador de cada pessoa:
- **Tema da interface:** Escuro, Claro ou Automático. O botão do menu lateral também alterna.
- **Abrir links:** *Nova aba* (padrão) ou *Aba atual*. Vale para os links dos clientes, os atalhos dos cards e as URLs do painel Informações.

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
  03-repository.js  persistência genérica (Supabase ou local): clientes e Links Úteis
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
