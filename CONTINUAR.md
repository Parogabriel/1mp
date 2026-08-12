# Notas de desenvolvimento

Estado do projeto em 11/08/2026. O `README.md` descreve a arquitetura base;
este arquivo cobre o que mudou depois dele, armadilhas já encontradas e o que
está pendente.

## Como validar que está tudo de pé

```bash
npm run typecheck && npm run lint && npm test && npm run dev
```

Estado atual: typecheck limpo, lint em **0 erros e 0 avisos**, **24 testes
passando**.

## Entrar na aplicação

Não existe acesso direto aos painéis — há gate por papel. Vá em `/entrar` e
escolha um perfil:

| Email | Papel | Abre |
|---|---|---|
| `lais@1mp.com.br` | criador | `/creator/dashboard` |
| `pedro@1mp.com.br` | criador | idem |
| `bruna@1mp.com.br` | criador | idem |
| `contato@vervo.com.br` | marca | `/brand/dashboard` |
| `marketing@kaza.com.br` | marca | idem |

God Mode segue em `/sys-admin/god-mode`, passcode `1MP-GOD-2026`.

**A store nasce semeada.** O One-Click Seed do God Mode é *re-seed*, não o
único jeito de ter dados.

---

## O que mudou desde o README

### Home reescrita

A home ganhou uma reformulação em torno de quatro problemas: não mostrava o
produto, todas as seções tinham a mesma forma, faltava conteúdo de venda e
faltava imagem/ilustração. Direção visual: Notion/Figma — amigável, ilustração
humanística, respiro, produto em destaque.

**`ui/ProductFrame.tsx`** — moldura de janela em volta de componentes reais.
Usada em `home/ProductTour.tsx`, a dobra logo depois do hero, com três abas:
`RoiCalculator` (embutida), `KanbanBoard` e um painel `StatStrip`+`BarChart` da
carteira inteira. Tudo lendo a store de verdade — arrastar um card aqui move a
campanha e ela aparece movida no Creator Studio. Os componentes ficam em escala
natural dentro da moldura, não reduzida: `transform: scale()` não encolhe a
caixa no layout (sobra vão embaixo) e derruba o corpo de texto abaixo do
legível.

**Quatro ilustrações SVG** em `home/illustrations/` (`SharedNumber`,
`Projection`, `Escrow`, `Trail`), com `strokes.ts` guardando os atributos
comuns. Usam `currentColor` para o traço, então funcionam nos dois temas sem
uma segunda versão.

**Conteúdo de venda** — `home/BrandStrip.tsx` (marcas fictícias, como
assinatura tipográfica e rotuladas), `home/ProofCases.tsx` (campanhas reais da
store passadas pelo motor de ROI) e `home/Testimonials.tsx` (falas atribuídas
às personas do seed, seção rotulada como ilustrativa). Depoimento e logo de
cliente são prova social — a decisão foi usar apenas as marcas fictícias que a
aplicação já exibe (Vervo, Kaza, Norte Cosméticos, Ferro & Sal, Ondas — em
`home/demoBrands.ts`), nunca inventar empresa ou pessoa real.

**`home/PlatformNumbers.tsx`** — substitui números que a aplicação não tinha
como sustentar ("10 mil+ criadores", "R$ 4,2 mi+"). Conta a store de verdade.
Absorveu o `LiveTicker`.

**Esqueletos alternados** — `HowItWorks` é trilho vertical, `ProofCases` é
lista larga, `Testimonials` é citação assimétrica, em vez de seções vizinhas
repetindo a mesma grade de cards.

**Compartilhado** — `home/demoBrands.ts` (lista única de marcas, o ticker lê
dela) e `home/demoAssumptions.ts` (ticket médio e margem num lugar só).

**Barra de navegação do topo removida** — duplicava a própria página e comia a
primeira dobra. Sobraram marca, "Sobre", configurações e "Entrar". Os ids das
seções continuam de pé.

**Pendências da home:**
- As ilustrações não passaram por revisão visual detalhada — vale conferir a
  olho antes de considerar essa parte fechada.
- `Hero`, `WhyUs`, `Pricing`, `AboutUs` e `Faq` ainda repetem o mesmo cabeçalho
  (sobrelinha + título serifado).
- `CreatorShowcase` (carrossel) e `BrandStrip` disputam a mesma função de
  "quem está aqui" em pontos distantes da página.

### Limpeza e publicação

**Sem `.env`.** `src/env.ts` eram 91 linhas de schema Zod para validar uma
constante que o repositório fixa, consumida só pelo `metadataBase`. Virou
`src/config.ts` (~15 linhas). Saíram junto o `.env.example` e a dependência
`zod`. A regra `.env*` do `.gitignore` e o hook de pre-commit ficam: custam
zero e cobrem o dia em que um `.env` aparecer.

**Código morto removido — ~1.000 linhas:**

| Removido | Linhas | Por quê |
|---|---|---|
| `home/NavPanels.tsx` | 231 | Órfão: nenhum componente o renderizava |
| `ui/ScrollRolodex.tsx` | 169 | Ver "Armadilhas" nº 7 |
| `home/CreatorsExplorer.tsx` | 181 | Só o `NavPanels` o usava |
| `src/env.ts` | 91 | Acima |
| `hooks/useMagneticButton.ts` | 47 | Nunca importado |
| `hooks/useScrollOpacity.ts` | 44 | Só o `ScrollRolodex` o usava |
| `StatStripCustom`, `breakEvenInvestment` | ~22 | Exportados, nunca usados |
| `zod`, `lucide-react` | — | `lucide-react` tinha zero imports |

**Revisão de segurança.** Sem `dangerouslySetInnerHTML`, `eval`, `innerHTML` ou
`_blank` sem `rel`; sem `any`, `@ts-ignore` ou `console.log`; cabeçalhos
completos no `next.config.ts`; nenhum segredo em arquivo rastreado ou no
histórico. Dependências atualizadas para Next 16, zerando os alertas do `npm
audit`.

### Contraste e leitura

Medição de contraste no navegador revelou vários tokens abaixo do mínimo de
4,5:1 — o pior caso era o `--accent` verde (`#10b981`), que dava 2,54:1 como
texto e é a cor usada em ROI, valor de campanha, total do orçamento.

| Token | Antes | Depois |
|---|---|---|
| `--ink-muted` claro | 4,63:1 | 7,24:1 (`#6b7280` → `#4b5563`) |
| `--ink-muted` escuro | 6,02:1 | 7,59:1 (`#8b8fa3` → `#9ca3af`) |
| `--accent` claro como texto | 2,54:1 | 5,23:1 (`#10b981` → `#047857`) |
| branco sobre `--accent` claro | 2,54:1 | 5,46:1 |
| `--signal` claro como texto | 2,66:1 | 4,63:1 (`#ff6b6b` → `#dc2626`) |
| `--violet` claro como texto | 4,28:1 | 6,03:1 (`#6366f1` → `#4f46e5`) |
| branco sobre `--signal` escuro | 2,78:1 | 6,62:1 (via `--signal-ink`) |
| branco sobre `--violet` escuro | 4,23:1 | 4,55:1 (via `--violet-ink`) |

Além dos tokens: `--backdrop-orb-opacity` caiu (0,85 → 0,5 no claro; 0,5 → 0,38
no escuro), a malha do `HandsNetworkCanvas` foi de 0,4 para 0,25, e todo
`text-[9px]`/`text-[10px]` do projeto virou `text-[11px]`. Boa parte do texto
das seções assenta direto sobre o `AmbientBackdrop`, sem superfície opaca no
meio — cada ponto de opacidade ali era contraste perdido.

**Convenção:** cor usada como fundo de texto anda em par com a sua tinta
(`--accent-ink`, `--signal-ink`, `--violet-ink`), porque o par inverte entre os
temas. Branco fixo em cima de token de cor é bug esperando acontecer.

Nota de medição: `getComputedStyle` devolve `color(srgb …)` em 0–1 e
`oklab(…)` em outra escala — um parser que assume 0–255 sem checar o formato
inventa falso negativo.

### Adicionado em rodadas anteriores

**Design system** (`presentation/components/ui/`) — `Button`, `Card`, `Field`
(+`Input`/`Select`/`Textarea`/`Slider`), `Toast`+`useToast`, `ConfirmDialog`,
`EmptyState`+`Skeleton`, `Tabs`, `Modal`, `BrandSeal`. Tokens `rounded-card`,
`shadow-lift`, `shadow-lift-sm` expostos no `@theme inline` de `globals.css`.

**Gráficos** (`presentation/components/charts/`) — `BarChart` (com modo
divergente), `DonutChart`, `StatStrip`, `ChartTable`. Sem dependência externa.

**Autenticação de demonstração** — `application/auth/demoAccounts.ts`,
`useAuthStore` com `signInWithEmail` e flag `isHydrated`, `RequireRole`,
`AppShell` + `SideNav` recolhível, `SettingsPanel` (tema + cor de destaque).

**Domínio** — `Campaign.history` (`CampaignEvent[]`) e `timeInStatus`;
`Creator.location`/`verified`/`avatarUrl`; `kanbanColumnOfStatus`.

**Store** — `updateBrand` (com validação de orçamento), `createCampaign` agora
soma em `committedCents`.

**Testes** — Vitest só para o núcleo (`src/domain`, `src/infrastructure`).
`vitest.config.ts` usa `environment: 'node'`; não há setup de React/jsdom.

---

## Armadilhas que já morderam (não repetir)

### 1. Temporal dead zone em `useWorkspaceStore`

A store nasce semeada, então `buildSeedData()` roda durante
`create(persist(...))`. Qualquer helper que ela use precisa ser declaração de
função (hoisted), não `const` de arrow — senão é
`ReferenceError: Cannot access 'X' before initialization`.

Já aconteceu duas vezes, com `indexBy` e com `addDays`. Ambos hoje são
`function`. O zustand engole esse erro em silêncio em alguns caminhos: a store
volta ao estado vazio sem nada no console.

### 2. `style={{ opacity: motionValue }}` não atualiza

Nesta versão do framer-motion, um `MotionValue` ligado a `style.opacity` é
escrito uma vez e nunca mais — enquanto `y`, `scale` e `rotate` da mesma origem
funcionam. Verificado em três componentes independentes.

Usar `opacity` em `animate`, `initial` ou `whileInView` funciona normal — o
problema é só via `style`. Não reintroduza o padrão de escrever opacidade via
`style` a partir de um `MotionValue`.

### 3. Migração ao mexer no domínio

`localStorage` guarda estado antigo. Ao adicionar campo obrigatório numa
entidade persistida, atualize os `revive*` de `useWorkspaceStore`
(`reviveCreator`, `reviveCampaign`) com fallback — senão quem já usou o site
abre numa tela quebrada. Os dois já fazem isso; siga o padrão.

### 4. `font-mono` foi eliminado de propósito

Não existe família mono declarada no projeto, então `font-mono` caía no
fallback do sistema (Consolas), sem relação com Fraunces/Plus Jakarta Sans.
Todos os usos viraram sans + `tabular-nums`. Não volte a usar `font-mono` —
para alinhar dígito em coluna, use `tabular-nums`.

### 5. Testes no navegador com `AnimatePresence`

Ler o DOM logo após um filtro pode pegar itens no meio da animação de saída,
que ainda estão montados — resultando em contagem de elementos errada. Espere
a animação terminar antes de contar elementos.

### 6. `BlurReveal` quebra `position: absolute` de quem está dentro

`transform` cria bloco de contenção para descendentes absolutos — então um
marcador com `absolute left-0` ancorado ao `li` passa a se posicionar contra o
`motion.div` do `BlurReveal` durante a animação, e sai do lugar. No trilho do
`HowItWorks` o marcador ficou fora do `BlurReveal` por isso.

Do mesmo tipo: `BlurReveal` renderiza uma `div`, então envolvê-lo em volta de
um `<li>` põe uma `div` como filha direta de `ol`. Ponha o `BlurReveal` dentro
do `li` (é o que o `ProofCases` faz).

### 7. Lenis em `root: true` nunca percebe o conteúdo crescer — só a viewport

A página parou de rolar duas vezes seguidas, por causas diferentes.

**Causa 1: capturar a instância do Lenis errado.** `autoRaf: false` significa
que o Lenis só avança pelo `raf` que o ticker do GSAP chama. Capturar
`lenisRef.current?.lenis` uma vez na entrada do efeito lê a ref antes dela
existir — o `ReactLenis` monta no mesmo commit — e o valor fica `undefined`
para sempre. Correção: ler a ref a cada frame, dentro do próprio `update`.

**Causa 2: dimensões nunca remedidas.** Com `root: true` o Lenis mede a altura
rolável contra `window`, e a única fonte automática de remedição embutida nele
é o evento `resize` da janela — que dispara quando o viewport muda de tamanho,
nunca quando o conteúdo cresce. Boa parte desta página só atinge a altura final
depois do mount (o `LiveTicker` popula linhas num efeito), então o Lenis mede a
altura da viewport no instante em que monta e trava com `limit.y = 0` — para
sempre, mesmo com a página correta e milhares de pixels mais alta um segundo
depois. Um evento de wheel real não faz nada, e a única pista é a classe
`lenis-scrolling` grudada no `html`, porque o Lenis registra o gesto mas não
tem para onde rolar.

Correção: checar `document.documentElement.scrollHeight` a cada frame (leitura
barata) e só chamar `lenis.resize()` (mais caro) quando esse valor muda de
verdade. Chamar `resize()` incondicionalmente a cada frame funciona mas deixa
o scroll pesado — a guarda evita o custo.

**Para testar rolagem, despache um evento de wheel de verdade** e espere a
inércia assentar antes de ler `scrollY` — `window.scrollBy`/`scrollTo` passam
por cima do Lenis e continuam funcionando mesmo com o scroll real travado.

### 8. `npm run build` derruba o servidor de dev que estiver rodando

Os dois escrevem no mesmo `.next/`. Rodar o build com o `next dev` de pé faz o
dev passar a servir chunks que não existem mais — o site abre, mas clicar em
qualquer coisa dá `ChunkLoadError` e a rota cai no error boundary.

Se acontecer: pare o dev, `rm -rf .next`, suba de novo. Para evitar, não rode
`build` sem parar o `dev` antes.

### 9. Componente reaproveitado entre home e painel duplica `id`

`RoiCalculator` tem `id="roi-heading"` fixo. Montá-lo na home e no painel da
mesma página duplicaria o `id` e quebraria o `aria-labelledby`. Foi por isso
que a calculadora solta saiu da home e ficou só dentro do `ProductTour`. Se for
montar duas vezes, o `id` precisa virar `useId`.

---

## Convenções em vigor

1. **Nada de segurança de mentira.** O gate por email é UX; sem servidor,
   qualquer um edita o `localStorage`. Todo arquivo de auth carrega esse aviso.
2. **Primitivo antes de tela.** Use `Button`/`Card`/`Field` — não recrie a
   receita em Tailwind inline.
3. **Toda mutação dá retorno** (toast); **ação irreversível pede confirmação**
   (`ConfirmDialog`) — só as terminais, para não treinar o usuário a clicar em
   "sim" sem ler.
4. **Movimento serve à compreensão** — anima o que muda de lugar ou de valor.
5. **`prefers-reduced-motion` respeitado** em tudo.
6. **Sem dado inventado na UI.** Se o domínio não tem o campo, estenda o
   domínio ou não mostre.
7. **Estado vazio, carregando e erro** em toda lista e formulário.
8. **Gráfico é SVG/HTML à mão**, sem biblioteca nova.
9. Comentários explicam **por quê**, não o quê. Em português.
10. **Contraste mínimo de 4,5:1** para qualquer texto, nos dois temas — e cor
    de fundo de texto anda em par com a sua tinta (`--*-ink`). Nada de
    `opacity` para "apagar" texto: desbota contra o fundo. Use `text-ink-muted`.
11. **Piso de 11px** no tamanho de fonte.
12. **Sem `.env`.** Constante pública vai em `src/config.ts`. Se um dia entrar
    segredo de servidor, aí sim volta a validação — e ela derruba o build.
13. **Comentário que fica** registra: armadilha que já causou bug, decisão onde
    a alternativa óbvia está errada, ou restrição não-local. O que reafirma o
    código, explica recurso de framework ou narra a tela, sai.
14. **Componente com variante ou prop que ninguém usa é código morto.** Antes
    de generalizar, conte os chamadores.

---

## Pendente, em ordem sugerida

### Melhorias de alto valor e baixo esforço

- **Comparar criadores** — marcar 2–3 no CRM e ver lado a lado.
- **Exportar CSV** do Analytics de ROI e do CRM.
- **Central de notificações** — o toast some sem deixar rastro.
- **Paleta de comando (Ctrl+K)** — encaixa na estética Notion.
- **`metadata` por rota** — só `/sobre` tem; as outras herdam o layout raiz.
- **Mais testes** — `ScheduledPost.validatePost` e `Brand` (availableBudget /
  canAfford) são lógica pura e ainda não têm cobertura.

### Dívida conhecida

- `BriefWizard` (450 linhas) ainda usa inputs crus e um `Field` local em vez do
  primitivo compartilhado.
- Revisão do wizard omite `mustMention`/`mustAvoid`/criador escolhido.
- `PostPreviewCard` ainda é uma caixa vazia com o nome do formato, não um
  preview real da plataforma.
- `RoiAnalytics` tem um `AssumptionSlider` local em vez do `Slider` do `Field`
  — mesma dívida do `BriefWizard`, em escala menor.
- A `ProductFrame` só é usada na home. Se um dia a `/sobre` quiser mostrar
  telas, ela já serve.
