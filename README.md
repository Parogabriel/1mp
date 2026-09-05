# 1MP — One Million Posts

Marcas e criadores negociam campanhas vendo alcance, impressões e retorno
projetados antes de assinar — não depois do relatório.

## Instalação

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`. Node 20+ recomendado (testado com Node 24;
o CI roda em 22).

Para abrir no celular sem publicar, `npm run dev:lan` serve na rede local — o
endereço é `http://<ip-do-pc>:3000`, com o celular na mesma Wi-Fi.

**Não há `.env`.** A aplicação não tem segredo: nada aqui precisa ficar fora do
repositório. A única variável é `NEXT_PUBLIC_GITHUB_PAGES`, ligada pelo workflow
de publicação e por mais ninguém — em desenvolvimento ela não existe. Clonar e
rodar são dois comandos.

## O que está pronto

| Camada | Arquivos | Estado |
|---|---|---|
| `domain/` | value-objects, Creator, Brand, Campaign (+histórico), ScheduledPost | ✅ Completo |
| `infrastructure/` | roiEngine.ts | ✅ Completo |
| `application/` | auth/demoAccounts + 5 stores (auth, theme, accent, godMode, workspace) | ✅ Completo |
| `presentation/` | design system, gráficos, ilustrações, 5 telas | ✅ Completo |
| `app/` | layout + 6 rotas + loading/error/not-found | ✅ Completo |

Seis rotas: Home (`/`), Sobre (`/sobre`), Entrar (`/entrar`), Creator Studio
(`/creator/dashboard`), Brand Manager (`/brand/dashboard`) e God Mode
(`/sys-admin/god-mode`).

Para o estado atual detalhado, o que está pendente e as armadilhas já
descobertas, ver **[CONTINUAR.md](./CONTINUAR.md)**.

## Roteiro rápido pra ver tudo funcionando

0. Abra `/` e role uma tela: em `#produto` estão três telas reais da aplicação
   dentro de uma moldura de janela. Mexa nos controles da projeção e arraste um
   card do board — é a mesma store que os painéis usam.
1. Rode `npm run dev` e abra `/entrar`.
2. Escolha um perfil. Cada conta abre **apenas** o painel do seu papel —
   há gate por papel, e tentar o painel do outro lado mostra um aviso com
   atalho para o correto.
   - Criadora: `lais@1mp.com.br` · Marca: `contato@vervo.com.br`
3. No **Creator Studio**: arraste um card entre colunas do Kanban (transição
   inválida é recusada com toast), clique no título para ver o briefing
   completo e a linha do tempo, e alterne o Post Studio para o calendário.
4. No **Brand Manager**: crie uma campanha pelo botão "Nova campanha" no topo
   e veja o orçamento livre diminuir; explore Analytics de ROI e a aba Perfil
   da marca.

A store **nasce semeada** com 3 criadores, 2 marcas, 6 campanhas e 4 posts —
incluindo problemas de validação de propósito (um post no passado, outro sem
legenda). Persiste em `localStorage` (`1mp.workspace`). O One-Click Seed do
God Mode (`/sys-admin/god-mode`, passcode `1MP-GOD-2026`) hoje serve para
**re-semear**, não mais como única forma de ter dados.

## Publicação

O site vai para o GitHub Pages em
**https://parogabriel.github.io/1mp** a cada push na `main`, pelo workflow
`.github/workflows/deploy-pages.yml`.

**Antes do primeiro deploy, ligue o Pages uma vez** em Settings › Pages ›
Source: **GitHub Actions**. Sem isso o workflow falha no passo de publicação.
Existe um jeito de fazer isso pelo próprio workflow — o input `enablement` do
`actions/configure-pages` —, mas ele exige um token com escopo `repo` guardado
como segredo, e trocar um clique único por um segredo permanente não compensa.

Publicar é possível porque nenhuma rota depende de servidor — sem API route,
server action ou rota dinâmica, o build inteiro vira HTML em `out/`. O que muda
no alvo de publicação está em duas constantes de `src/config.ts`, e nada além
delas: o Pages serve em subcaminho (`/1mp`), não na raiz de um domínio.

Duas consequências de servir arquivo estático, ambas aceitas:

**Os cabeçalhos de segurança não existem no site publicado.** O Pages é um CDN
de arquivos e não aceita cabeçalho customizado. `next.config.ts` remove o bloco
`headers` quando o alvo é o Pages em vez de deixá-lo declarado dando a impressão
de proteger algo — as proteções continuam valendo em `next dev` e `next start`.
Se um dia isso pesar, o caminho é uma hospedagem que rode o Next de verdade.

**`basePath` não alcança quem monta URL na mão.** `<Link>` e `next/navigation`
recebem o prefixo do próprio Next; `new Image()`, `fetch` e `url()` em CSS, não.
Hoje o único caso é o `hands.webp` do `HandsNetworkCanvas`, que importa
`BASE_PATH` de `src/config.ts`. Ao adicionar asset carregado em runtime, o
prefixo é manual — e a falha aparece só no site publicado, nunca em
desenvolvimento, porque em `localhost` o prefixo é vazio.

## Decisões de arquitetura registradas

### App Router em `src/app`, não em `src/presentation/app`

O brief original pedia as rotas em `src/presentation/app/`. O App Router do
Next.js só reconhece `app/` na raiz ou `src/app/` — um diretório `app`
aninhado em outra pasta é ignorado pelo roteador. `src/app/` contém só
re-exports de uma linha; toda a UI real vive em `src/presentation/screens/`.

### Kanban com drag-and-drop *e* botões

> Revisado. A versão anterior deste documento defendia **não** ter arrastar.
> As duas objeções continuam válidas — a solução foi resolvê-las, não evitá-las.

**Acessibilidade:** HTML5 drag-and-drop não é operável por teclado. Por isso os
botões de transição **continuam existindo** em cada card, calculados filtrando
`CAMPAIGN_STATUSES` por `canTransition`. Arrastar é atalho de mouse, não o
único caminho.

**Ambiguidade de destino:** como `kanbanColumnOf` agrupa vários status numa
mesma coluna (`paid` e `cancelled` caem ambos em "Concluídas"), soltar numa
coluna não diz para qual status ir. `dropTargetFor`, em `KanbanBoard.tsx`,
resolve escolhendo o primeiro status daquela coluna que `canTransition` aceita
a partir do estado atual — e devolve `null` quando nenhum aceita, caso em que o
card volta e um toast explica o porquê.

### Sem validação de ambiente, porque não há ambiente para validar

Existia um `src/env.ts` com schema Zod validando `NEXT_PUBLIC_APP_URL` na
importação — 91 linhas para conferir uma constante que o próprio repositório
fixa, e que só o `metadataBase` do layout consumia. O `zod` inteiro entrava na
árvore de dependências por causa dela, e clonar o projeto exigia um passo de
configuração antes de ver a tela.

Virou `src/config.ts`, com a URL e um comentário. Se um backend entrar depois —
banco, Stripe, provedor de e-mail —, a validação volta, e aí com função: segredo
de servidor precisa derrubar o build, não virar `undefined` em produção.

### A home mostra o produto rodando, não uma imagem dele

`ProductFrame` é uma moldura de janela em volta de componentes **reais** —
`RoiCalculator`, `KanbanBoard` e o par `StatStrip`/`BarChart`, lendo a mesma
store dos painéis. Captura de tela envelhece na primeira mudança de layout e
passa a mentir sobre o produto; componente vivo não desatualiza. O efeito
colateral é intencional: arrastar um card na home move a campanha de verdade, e
ela aparece movida ao entrar no Creator Studio.

Cuidado ao repetir um componente entre home e painel: `RoiCalculator` tem
`id="roi-heading"` fixo, então montá-lo duas vezes na mesma página duplicaria o
`id`. Hoje ele existe só dentro do `ProductTour`.

### Nenhum número da home é inventado

A seção "Neste ambiente, agora", os casos com ROI e a faixa de marcas são
derivados da store e do motor de ROI — contagem de criadores, soma das ofertas,
projeção por campanha. A versão anterior anunciava "10 mil+ criadores" e
"R$ 4,2 mi+ movimentados", números que a aplicação não tem como sustentar.
Depoimentos e marcas são fictícios e rotulados como tal na própria seção.

### Cor de fundo de texto anda em par com a sua tinta

`--accent`/`--accent-ink`, `--signal`/`--signal-ink`, `--violet`/`--violet-ink`.
O par inverte entre os temas — no claro `--signal` é vermelho fundo e pede texto
branco; no escuro é coral claro e pede texto escuro. Branco fixo em cima de um
token de cor funciona num tema e falha no outro.

O piso é 4,5:1 para qualquer texto, nos dois temas, e 11px de tamanho de fonte.
Os tokens de cor foram calibrados para isso: o `#10b981` original dava 2,54:1
como texto sobre a superfície clara, e era justamente a cor dos números grandes.

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
| `npm test` | Vitest sobre o núcleo — 24 testes de domínio e motor de ROI |
| `npm run build` | build de produção — **pare o `npm run dev` antes**, os dois escrevem no mesmo `.next/` e o dev passa a servir chunks que não existem mais |

Os testes cobrem só `src/domain` e `src/infrastructure` de propósito: é lógica
pura, sem I/O nem DOM, então roda em `node` sem jsdom. É onde um teste custa
menos e protege mais — a máquina de transição de campanha e a decisão de
calcular ROI sobre margem de contribuição, não receita bruta.

Dois hooks rodam automaticamente. O **pre-commit** bloqueia arquivos de
ambiente, chaves e certificados, e padrões de credencial nas linhas adicionadas
do diff — a regra continua de pé mesmo sem `.env` no projeto, porque o custo é
zero e o dia em que um aparecer é justamente o dia em que ninguém se lembra. O
**commit-msg** valida a mensagem contra o Conventional Commits com escopo
fechado nas camadas do projeto:
`domain`, `app`, `infra`, `ui`, `store`, `config`, `ci`, `deps`.

Se um hook reprovar, o caminho é corrigir a causa. `--no-verify` desliga a
única barreira que existe antes de um segredo virar histórico — e depois do
push, tirar de lá significa rotacionar a credencial.

O CI repete a checagem de segredos num lugar onde ninguém pode contorná-la, e
roda lint, tipos, testes e build a cada push e pull request na `main`.

## Como o trabalho anda

`main` fica sempre verde. O dia de trabalho vive num ramo curto
`dia/AAAA-MM-DD-<assunto>`, com PR para `main` — mesmo trabalhando sozinho, é o
PR que dispara o CI antes do merge. Merge com rebase, para o histórico continuar
linear e legível por camada.

Um commit por mudança coerente, no escopo da camada que dominou a mudança. No
fim do dia: `typecheck` + `lint` + `test`, atualizar o `CONTINUAR.md` com o que
entrou e o que ficou, e fechar com `docs: fecha o dia AAAA-MM-DD`.

## Verificado

`npm run typecheck` e `npm test` (24 testes) passam limpos; `npm run lint` sem
erros, com um aviso pré-existente em `SmoothScrollProvider`.

Testado de ponta a ponta no navegador: entrar por perfil → gate barrando o
painel do outro papel → recarregar logado sem ser expulso → arrastar campanha
no Kanban, com transição inválida recusada → criar campanha e ver o orçamento
livre diminuir → editar e excluir post → trocar a cor de destaque e ver o site
inteiro repintar.

Na home, as três abas do `ProductTour` foram exercitadas em 375, 768, 1024 e
1280 px, sem estouro horizontal em nenhuma delas, e as ilustrações conferidas
nos dois temas.
