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
  painel/                  o painel administrativo (subdomínio próprio)
    app/(painel)/          rotas protegidas: exigem sessão e 2FA ativo
    app/login/             entrada e desafio do segundo fator
    app/seguranca/2fa/     cadastro do TOTP, fora do grupo protegido
    proxy.ts               portão de borda (presença de cookie)
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

## Acesso ao painel

Não existe cadastro público, e não deve passar a existir. O primeiro
administrador nasce de um script, rodado localmente uma única vez:

```bash
pnpm --filter painel create-admin
```

O segundo fator é obrigatório e não tem escape. O plugin do Better Auth só
desafia quem já cadastrou o TOTP, então quem nunca cadastrou entraria direto —
quem fecha esse buraco é a guarda em `app/(painel)/layout.tsx`, que redireciona
para o cadastro. Ela precisa estar no layout, e não no `proxy.ts`, porque só ali
existe a sessão verificada.

O `proxy.ts` é deliberadamente otimista: checa apenas a presença do cookie, sem
ir ao banco. Um cookie forjado passa por ele e morre no layout. Tratá-lo como
autorização seria um erro.

O cookie de sessão sai sem atributo `Domain`, então fica preso ao subdomínio do
painel e nunca é enviado para o domínio do site.

A CSP do painel é montada por requisição em `proxy.ts`, com um nonce novo a cada
resposta — não em `next.config.ts`, que só aceita valor estático. O motivo é que
o Next injeta o payload RSC num `<script>` inline: sem nonce, `script-src 'self'`
o bloqueia, o React não hidrata e a página renderiza sem responder a nada. Por
isso também nada no painel é estático (`dynamic = "force-dynamic"` no layout
raiz): uma página gerada no build sairia com scripts sem nonce.

## Editando pelo painel

Cada seção tem sua tela em `/conteudo/<secao>`. **Salvar** grava no rascunho e
não tem efeito nenhum no site; **Publicar** copia o rascunho para o publicado,
numa transação, e chama a revalidação do site. A separação é deliberada: uma
publicação regenera a página da campanha, e isso merece um gesto explícito.

Listas (propostas, credenciais, fotos, vídeos, parágrafos) têm adicionar,
remover e reordenar por botões ↑↓ — acessíveis por teclado, funcionais no
celular, e sem dependência de arrastar.

A ordem e a visibilidade das seções são colunas, então reordenar não reescreve
payload nenhum. `inicio` não pode ser ocultada, e isso é garantido em três
lugares: a caixa vem desabilitada, a server action força o valor, e o site força
de novo na leitura — só a última protege contra uma escrita direta no banco.

## Histórico

`/historico` mostra duas coisas: as versões de cada parte do conteúdo e o
registro das publicações — quem publicou, quando, o que entrou, e se o site
chegou a ser avisado. Publicar e revalidar são passos separados, então uma
publicação pode constar como gravada com o aviso ao site tendo falhado.

Restaurar devolve a versão ao **rascunho**, nunca direto ao publicado: dá para
conferir o que voltou antes de a campanha inteira ver. A própria restauração
vira uma versão, então desfazer um desfazer também funciona.

Uma revisão antiga é validada contra o schema atual antes de ser gravada. Sem
isso, uma versão de meses atrás — de quando um campo ainda não era obrigatório —
entraria como rascunho quebrado, e o erro só apareceria na hora de publicar,
longe da causa.

## Configurações e editores

`/configuracoes` reúne o que não pertence a uma seção só: links de WhatsApp,
Instagram e doação, identidade, textos do menu, descrições para buscadores,
IDs de rastreamento e os rótulos de interface. O número do WhatsApp é gravado
uma vez e alimenta os três lugares onde aparece — card de contato, botão de
ação e botão flutuante.

`/usuarios` controla quem entra. Não existe cadastro aberto: todo acesso nasce
ali ou pelo `create-admin`. Dois papéis:

| Papel | Edita conteúdo | Gerencia acessos |
| --- | --- | --- |
| Editor | sim | não |
| Administrador | sim | sim |

Ninguém pode remover a própria conta — sem essa guarda o único administrador
consegue se trancar do lado de fora. Quem é criado ali entra com senha e é
obrigado a cadastrar o segundo fator antes de ver qualquer tela.

## Biblioteca de mídia

Em `/midias`. O envio passa por três etapas que não são otimização:

- **Redução no navegador antes de subir.** O corpo de uma função serverless da
  Vercel para em 4,5 MB e as fotos originais chegam a 12 MB.
- **`rotate()` antes de ler as dimensões.** Fotos de iPhone trazem a orientação
  no EXIF; sem isso largura e altura saem trocadas.
- **EXIF descartado no reencode.** As fotos de evento costumam carregar
  coordenadas de GPS — publicá-las vazaria a localização de quem estava lá.

O blur sai com 8px no lado maior e qualidade 70, que é o que o Next gera para
imports estáticos: ele dimensiona o viewBox do placeholder como `blurWidth * 40`,
então outro tamanho mudaria a intensidade do desfoque em relação ao resto do site.

O arquivo é nomeado pelo hash do conteúdo, então enviar a mesma imagem duas
vezes reaproveita a primeira. Apagar é bloqueado enquanto alguma seção
referenciar a mídia: o `MediaRef` gravado na seção é desnormalizado e não há
chave estrangeira, então nada avisaria antes da página renderizar quebrada.

Em produção o destino é o Vercel Blob (`BLOB_READ_WRITE_TOKEN`); sem o token,
grava em `apps/site/public/uploads/` para desenvolvimento. Trocar de provedor é
trocar um driver em `lib/storage.ts`.

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
