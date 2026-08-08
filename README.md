# 1MP — One Million Posts

Marcas e criadores negociam campanhas vendo alcance, impressões e retorno
projetados antes de assinar — não depois do relatório.

## Instalação

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_APP_URL
npm run dev
```

Abre em `http://localhost:3000`. Node 20+ recomendado (testado com Node 24;
o CI roda em 22).

O passo do `.env.local` não é opcional: `src/env.ts` valida o ambiente na
importação, então uma variável ausente ou malformada para o build com uma
mensagem dizendo qual é — em vez de virar `undefined` e quebrar em produção.

## O que está pronto

| Camada | Arquivos | Estado |
|---|---|---|
| `domain/` | value-objects, Creator, Brand, Campaign, ScheduledPost | ✅ Completo |
| `infrastructure/` | roiEngine.ts | ✅ Completo |
| `application/` | useAuthStore, useThemeStore, useGodModeStore, useWorkspaceStore | ✅ Completo |
| `presentation/` | Home, Creator Studio, Brand Manager, God Mode | ✅ Completo |
| `app/` | layout + 4 rotas (cascas finas) | ✅ Completo |

Os 4 portais do brief estão de pé: Home (`/`), Creator Studio
(`/creator/dashboard`), Brand Manager (`/brand/dashboard`) e God Mode
(`/sys-admin/god-mode`).

## Roteiro rápido pra ver tudo funcionando

1. Rode `npm run dev` e abra `/sys-admin/god-mode`.
2. Passcode: `1MP-GOD-2026` (fica em `useGodModeStore.ts` — ver aviso de
   segurança lá dentro, é gate de demo, não autenticação de verdade).
3. Clique em **Popular banco local** — isso popula `useWorkspaceStore` com
   3 criadores, 2 marcas, 6 campanhas e 4 posts, cobrindo as 3 colunas do
   Kanban e alguns problemas de validação de propósito (um post agendado no
   passado, um com legenda vazia).
4. Vá para `/creator/dashboard` — Kanban de campanhas + Post Studio.
   Cada card mostra só as transições de status válidas (via `canTransition`
   do domínio); mover é clicar no botão, não arrastar — decisão deliberada,
   ver "Kanban sem drag-and-drop" abaixo.
5. Vá para `/brand/dashboard` — crie uma campanha pelo wizard, favorite um
   criador no CRM, veja o ROI projetado do portfólio.

O seed persiste em `localStorage` (`1mp.workspace`), então sobrevive a um
reload. "Popular banco local" de novo substitui tudo.

## Decisões de arquitetura registradas

### App Router em `src/app`, não em `src/presentation/app`

O brief original pedia as rotas em `src/presentation/app/`. O App Router do
Next.js só reconhece `app/` na raiz ou `src/app/` — um diretório `app`
aninhado em outra pasta é ignorado pelo roteador. `src/app/` contém só
re-exports de uma linha; toda a UI real vive em `src/presentation/screens/`.

### Kanban sem drag-and-drop

HTML5 drag-and-drop não é operável por teclado por padrão e exigiria uma
segunda implementação em paralelo pra acessibilidade. Em vez disso, cada
card expõe como botões as transições válidas a partir do status atual —
calculadas filtrando `CAMPAIGN_STATUSES` por `canTransition`, direto do
domínio, sem regra nova na UI. Isso também resolve uma ambiguidade real: como
`kanbanColumnOf` agrupa vários status numa mesma coluna visual (`paid` e
`cancelled` caem ambos em "Concluídas", por exemplo), "soltar o card na
coluna X" não diz para qual status exato ele deveria ir — o botão já diz.

### `useWorkspaceStore` persiste, mas revive `Date` manualmente

`JSON.stringify` vira `Date` em string ISO; o `JSON.parse` de volta devolve
string, não `Date` — o tipo continua mentindo que é `Date`, e qualquer
`transitionTo`/`validatePost`/`Intl.format` quebra depois de um reload, longe
de onde a mutação aconteceu. O `merge` do `persist` revive os campos de data
na volta. Detalhe que mordeu durante o desenvolvimento: esse `merge` roda de
forma **síncrona durante a criação da store**, então as funções auxiliares de
revivificação precisam estar declaradas *antes* do `create(persist(...))` no
arquivo — depois, e é `ReferenceError` de temporal dead zone, engolido em
silêncio pelo zustand (a store simplesmente volta pro estado vazio sem
avisar nada no console).

### Selectors recebem a coleção crua, não `WorkspaceState`

No Zustand v5 o snapshot é comparado por identidade. Um selector que monta
objeto/array novo a cada chamada (`state => Object.values(state.x).filter(...)`)
nunca "estabiliza" e derruba o componente em loop de re-render. Por isso
`selectKanban`, `selectPostsByCreator` etc. recebem o `Record` cru e quem
consome deriva dentro de `useMemo` — o recálculo só acontece quando a coleção
muda de verdade.

## Qualidade e segurança

| Comando | O que faz |
|---|---|
| `npm run lint` | ESLint 9, incluindo a regra que impede `src/domain` de importar de outra camada |
| `npm run typecheck` | `tsc --noEmit`, strict + `noUncheckedIndexedAccess` |
| `npm run build` | build de produção |

Dois hooks rodam automaticamente. O **pre-commit** bloqueia arquivos de
ambiente (menos `.env.example`), chaves e certificados, e padrões de
credencial nas linhas adicionadas do diff. O **commit-msg** valida a mensagem
contra o Conventional Commits com escopo fechado nas camadas do projeto:
`domain`, `app`, `infra`, `ui`, `store`, `config`, `ci`, `deps`.

Se um hook reprovar, o caminho é corrigir a causa. `--no-verify` desliga a
única barreira que existe antes de um segredo virar histórico — e depois do
push, tirar de lá significa rotacionar a credencial.

O CI repete a checagem de segredos num lugar onde ninguém pode contorná-la, e
roda lint, tipos e build a cada push e pull request na `main`.

## Verificado

`npm run lint`, `npm run typecheck` (strict + `noUncheckedIndexedAccess`) e
`npm run build` passam limpos. Fluxo testado de ponta a ponta no navegador: seed → transição
de status no Kanban → criação de campanha no wizard aparecendo no Kanban do
Creator → CRM favoritando/desfavoritando → analytics de ROI refletindo o
portfólio da marca.
