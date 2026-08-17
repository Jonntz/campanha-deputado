# Campanha Matheus Biancardine — Federal MG 2026

Site institucional da pré-candidatura, em **Next.js 16** (App Router) com React 19,
TypeScript e CSS Modules.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint (o comando `next lint` foi removido na v16) |
| `npm run typecheck` | `tsc --noEmit` |

Requer Node.js 20.9 ou superior.

## Estrutura

```
app/            layout, página e estilos globais (tokens, reset, utilitários)
components/
  layout/       header, faixa de doação, rodapé, botões flutuantes, VLibras
  sections/     uma pasta por seção da página, com seu CSS Module
  ui/           Reveal, Lightbox e os ícones
content/        todo o conteúdo editável, tipado
hooks/          useScrollSpy, usePrefersReducedMotion
lib/            dados estruturados (JSON-LD)
assets/images/  imagens importadas estaticamente pelo next/image
public/videos/  vídeos do evento e seus posters
```

## Editando o conteúdo

Textos, links e mídias ficam em `content/` — não é preciso mexer em componente:

- `site.ts` — WhatsApp, Instagram, link de doação, ID do Google Analytics
- `proposals.ts` — as propostas (título, texto, fonte, ícone)
- `credentials.ts` — os slides do carrossel
- `gallery.ts` / `videos.ts` — fotos e vídeos com suas legendas
- `bio.ts` — os parágrafos da biografia e os números em destaque

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
