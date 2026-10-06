# LinkHub

Gerenciador de links de ambientes (PRD/HOM/...) por cliente.

## Como usar
Abra `index.html` no navegador. Não precisa de build nem servidor.

## Estrutura
- `css/styles.css` — tema dark, layout e componentes
- `js/01-icons.js` — ícones SVG
- `js/02-models.js` — modelos (Client, Link) e ambientes
- `js/03-repository.js` — persistência (localStorage). Troque por chamadas HTTP para integrar um backend
- `js/04-services.js` — regras de CRUD usadas pelas páginas
- `js/05-ui.js` — toast, modal, confirmação, formulário genérico
- `js/06-components.js` — ClientCard, LinkRow, Stat, Empty
- `js/07-forms.js` — formulários de cliente e link
- `js/08-pages.js` — Dashboard, Clientes, Cliente, Configurações
- `js/09-app.js` — roteador (hash) e shell

Os scripts são carregados em ordem pelo `index.html` (sem módulos ES, para funcionar também via file://).
