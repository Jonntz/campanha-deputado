# Campanha Matheus Biancardine — Federal MG 2026

Site institucional da pré-candidatura, em **Next.js 16** (App Router) com React 19,
TypeScript e CSS Modules.

O repositório é um monorepo pnpm: o site público e o painel administrativo são
aplicações separadas que compartilham o schema do conteúdo.

## Rodando localmente

```bash
pnpm install
pnpm dev         # site em http://localhost:3000
```

| Script | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento do site (Turbopack) |
| `pnpm build` | Build de produção de todos os pacotes |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` em todo o workspace |
| `pnpm db:push` | Aplica o schema no Turso |
| `pnpm db:seed` | Grava o conteúdo padrão no banco |
| `pnpm db:verify` | Ida e volta pelo banco, comparada com o padrão |
| `pnpm media:generate` | Regenera o manifesto de mídia após trocar imagens |

Requer Node.js 20.9 ou superior e pnpm.

## Estrutura

```
apps/
  site/                    o site público
    app/                   layout, página e estilos globais
    components/
      layout/              header, faixa de doação, rodapé, flutuantes, VLibras
      sections/            uma pasta por seção da página, com seu CSS Module
      ui/                  Reveal, Lightbox e o re-export dos ícones
    content/               documento de conteúdo padrão e o acessor
    hooks/                 useScrollSpy, usePrefersReducedMotion
    lib/                   JSON-LD e a ponte de mídia
    assets/images/         imagens importadas estaticamente pelo next/image
    public/videos/         vídeos do evento e seus posters
packages/
  content/                 schema Zod, tipos, registro de seções, conteúdo padrão
  db/                      schema Drizzle, cliente Turso e consultas
  icons/                   os 19 SVGs e o registro nome → componente
```

## Como o conteúdo chega na página

O Turso **nunca entra no caminho da requisição**. A página é estática com ISR,
então o banco é consultado no build e nas revalidações — se ele cair, o CDN
segue servindo o último HTML bom. A queda afeta a capacidade de publicar, não o
site no ar.

Publicar não é rebuildar: o painel chama `POST /api/revalidate` com o
`REVALIDATE_SECRET` no header `x-revalidate-secret`, e a página é regerada
lendo o banco. O `revalidate = 3600` da página é só rede de segurança para o
caso de essa chamada se perder.

São três camadas de proteção, nesta ordem:

1. **ISR** — o banco não é consultado por requisição, então não há o que falhar.
2. **Stale-on-error** — se uma regeneração falha, o Next mantém o resultado anterior.
3. **Fallback por parte** — `mergeWithDefaults` valida cada seção em separado; um
   payload quebrado cai para o padrão commitado só naquela seção, e as outras
   publicam normalmente.

Isso é verificável: `pnpm --filter @campanha/db db:drill` corrompe uma seção no
banco e mostra a contenção.

## Editando o conteúdo

Todo o conteúdo do site é um documento único, validado pelo schema Zod de
`packages/content`. O padrão versionado fica em `apps/site/content/fallback.ts`
e é lido por `getSiteContent()` — nenhum componente importa conteúdo direto.

A estrutura do documento é garantida por `satisfies SiteContent` no `pnpm
typecheck`; as restrições que o tipo não expressa (tamanhos máximos, formato de
cor, `**negrito**` emparelhado) são validadas pelo Zod em desenvolvimento, com
o erro no console. Em produção a validação não roda sobre o padrão de
propósito: ele é a rede de segurança para quando o banco falhar, e não pode ser
capaz de lançar.

Dois pontos que não são editáveis, por serem estruturais:

- **Âncoras das seções** (`#inicio`, `#bio`, …) vêm de `SECTION_REGISTRY`. O
  `useScrollSpy` procura esses ids no DOM e os links da navegação são derivados
  deles, então uma âncora editável quebraria a navegação em silêncio.
- **Ícones** são guardados por nome e resolvidos por `ICONS`. Uma referência de
  componente não sobrevive a JSON nem à fronteira servidor→cliente.

## Tags de rastreamento

Google e Meta são montados juntos em `components/analytics/Analytics.tsx`. Os IDs
vêm de variáveis de ambiente — copie `.env.example` para `.env.local` (ou defina
na hospedagem):

| Variável | Tag | Sem valor |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | Google Analytics 4 (`G-…`) | usa o ID padrão do código |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel da Meta (só os dígitos) | o pixel não é carregado |

Ambas carregam com `afterInteractive`, depois da hidratação. O pixel da Meta
inclui o beacon `<noscript>` para visitantes sem JavaScript.

> Ao adicionar qualquer tag nova, inclua os domínios dela na CSP em
> `next.config.ts`. E confira se a URL do script redireciona: a CSP valida
> **cada salto**, então o destino final também precisa estar liberado.

## Renderização

A página inteira é gerada estaticamente no build (`○ Static`). Só sete componentes
rodam no cliente: `SiteHeader`, `Credentials`, `ProposalCard`, `GalleryGrid`,
`VideoGrid`, `Reveal` e `Lightbox`.

## Deploy

Feito para rodar no runtime do Next (Vercel ou Netlify), que é o que habilita a
otimização automática de imagens em AVIF/WebP com `srcset` responsivo.

Os headers de segurança (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`) são definidos em `next.config.ts`. Ao adicionar qualquer
script de terceiro, inclua o domínio dele na CSP — caso contrário será bloqueado.
