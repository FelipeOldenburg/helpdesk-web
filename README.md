# HelpDesk Web

Frontend desacoplado que consome a HelpDesk API com `fetch`.

## Funcionalidades

- cadastro e login;
- listagem e abertura de chamados para clientes;
- atualizacao de status e comentarios para tecnicos;
- URL da API configuravel por variavel de ambiente no build.

## Executar localmente

Sirva esta pasta com qualquer servidor HTTP estatico. Com a API em execucao, informe sua URL na tela de login.

```bash
npm run build
npx serve dist
```

## Variavel de ambiente

| Variavel | Uso |
| --- | --- |
| `FRONTEND_API_URL` | URL publica da HelpDesk API, sem barra final. |

Copie `.env.example` para `.env` apenas para referencia local. O build le a variavel do ambiente do processo; na Vercel, configure-a no painel.

## Deploy na Vercel

Importe este repositorio, configure `FRONTEND_API_URL` e publique. O `vercel.json` executa o build e entrega `dist/`. Depois, configure a URL gerada em `FRONTEND_ORIGIN` na API.

Repositorio esperado: https://github.com/FelipeOldenburg/helpdesk-web.git
