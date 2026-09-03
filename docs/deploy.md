# Deploy na Vercel

Dois projetos Vercel a partir deste mesmo repositório, cada um apontando para
uma pasta diferente. Depois de configurados, **todo merge para `main` publica os
dois automaticamente**.

| | Projeto | Pasta raiz | Domínio |
| --- | --- | --- | --- |
| Site público | `campanha-site` | `apps/site` | `www.matheusbiancardine.com.br` |
| Painel | `campanha-painel` | `apps/painel` | `painel.matheusbiancardine.com.br` |

---

## 1. Antes de tocar na Vercel

### 1.1 Token somente-leitura do Turso para o site

O site só lê o banco. Dar a ele um token de escrita é risco desnecessário: se o
site for comprometido, o conteúdo publicado não pode ser alterado por ali.

```bash
turso db tokens create database-biancardine-vercel --read-only
```

Guarde a saída — é o `TURSO_AUTH_TOKEN` do **projeto do site**. O painel continua
com o token de leitura e escrita que você já tem.

### 1.2 Rotacionar o token atual

O token read-write que está em uso hoje passou pelo chat, então deve ser
considerado conhecido. Depois de configurar tudo:

```bash
turso db tokens invalidate database-biancardine-vercel
```

Isso revoga **todos** os tokens do banco, inclusive o read-only. Crie os dois
novos logo em seguida e atualize as variáveis nos dois projetos.

### 1.3 Criar o Blob store — marque **público**

Na Vercel: **Storage → Create → Blob**, e conecte ao projeto do painel. O
`BLOB_READ_WRITE_TOKEN` é injetado automaticamente nele.

Na criação, escolha **acesso público**. As fotos do site precisam ser lidas por
qualquer navegador; um store privado exige autenticação a cada leitura e entrega
os arquivos através de uma função, o que anula o cache do CDN e o otimizador de
imagens do Next.

O modo de acesso **não pode ser alterado depois**. Se o store já tiver sido
criado como privado, crie outro — não há como converter.

### 1.4 Migrar a imagem que está em disco local

Há uma foto no hero gravada em `/uploads/` — caminho que só existe na sua
máquina. **Se subir assim, a foto principal do site aparece quebrada.**

Copie o `BLOB_READ_WRITE_TOKEN` para `apps/painel/.env.local` e rode:

```bash
pnpm --filter painel migrar-midias
```

Confira antes com `pnpm --filter painel exec tsx --env-file=.env.local \
scripts/migrar-midias-locais.ts --dry`, que só lista. Depois de migrar, publique
pelo painel para o site passar a servir a URL nova.

---

## 2. Criar os projetos

Pela interface é mais simples que pela CLI, porque a pasta raiz é uma
configuração de projeto.

1. **Add New → Project**, importe `Jonntz/campanha-deputado`.
2. Em **Root Directory**, clique em *Edit* e escolha `apps/site`.
3. Deixe **Include files outside of the Root Directory** ligado — o build
   precisa dos pacotes em `packages/` e do lockfile na raiz.
4. Framework: **Next.js** (detectado sozinho). Não mexa nos comandos de build:
   a Vercel reconhece o workspace pnpm e instala a partir da raiz.
5. Node.js: **22.x**, em Settings → General.
6. Adicione as variáveis da seção 3 **antes** do primeiro deploy.
7. Repita tudo para o painel, com Root Directory `apps/painel`.

---

## 3. Variáveis de ambiente

Marque todas para **Production** e **Preview**. As duas primeiras precisam ser
idênticas nos dois projetos.

### Projeto do site — `campanha-site`

| Variável | Valor | Onde obter |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | `libsql://database-biancardine-vercel-…turso.io` | Turso |
| `TURSO_AUTH_TOKEN` | token **somente-leitura** | passo 1.1 |
| `REVALIDATE_SECRET` | mesmo valor do painel | veja abaixo |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | `G-JXEBVJVR0M` | opcional |
| `NEXT_PUBLIC_META_PIXEL_ID` | só os dígitos | opcional |

### Projeto do painel — `campanha-painel`

| Variável | Valor | Onde obter |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | a mesma do site | Turso |
| `TURSO_AUTH_TOKEN` | token de **leitura e escrita** | Turso |
| `BETTER_AUTH_URL` | `https://painel.matheusbiancardine.com.br` | — |
| `BETTER_AUTH_SECRET` | segredo de 32 bytes | veja abaixo |
| `REVALIDATE_SECRET` | **idêntico** ao do site | veja abaixo |
| `SITE_URL` | `https://www.matheusbiancardine.com.br` | — |
| `BLOB_READ_WRITE_TOKEN` | injetado ao conectar o Blob store | passo 1.3 |

Gerar os segredos:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Os valores que já estão em `.env.local` servem — nunca saíram da sua máquina.
Se preferir gerar novos, gere e troque nos dois lugares.

### Três detalhes que causam problema

- **`REVALIDATE_SECRET` diferente entre os projetos** faz o painel publicar no
  banco e o site nunca atualizar.
- **`SITE_URL` é só do painel** e é a mais fácil de esquecer, porque não tem
  par do outro lado. Sem ela o painel publica e não avisa ninguém. A tela de
  Conteúdo mostra um aviso amarelo quando ela falta, antes de você publicar.

  Para conferir os dois de uma vez, do seu terminal:

  ```bash
  curl -i -X POST https://www.matheusbiancardine.com.br/api/revalidate \
    -H "x-revalidate-secret: SEU_SEGREDO"
  ```

  `200 {"revalidated":true}` significa que o segredo está certo. `401` significa
  que ele não bate com o do projeto do site. `503` significa que o projeto do
  site está sem a variável.
- **`BETTER_AUTH_URL` precisa bater exatamente** com o domínio que serve o
  painel, com `https://` e sem barra no fim.

  Essa variável define a lista de origens confiáveis. Errada ou ausente, o
  login é recusado com `INVALID_ORIGIN` **antes** de qualquer consulta ao
  banco — a pessoa vê uma mensagem sobre o servidor e nenhuma senha funciona,
  embora o usuário exista e o banco esteja certo. Desde a versão atual, faltar
  essa variável faz o build falhar com a mensagem explícita, em vez de publicar
  um painel inutilizável.
- **`NEXT_PUBLIC_*` são embutidas no build.** Mudar exige novo deploy; não basta
  salvar na Vercel. E elas têm precedência sobre o que estiver em Configurações
  no painel — deixe-as em branco se quiser controlar os IDs pelo painel.

---

## 4. Domínios

No projeto do site, **Settings → Domains**:

- `www.matheusbiancardine.com.br` — principal
- `matheusbiancardine.com.br` — a Vercel oferece redirecionar para o `www`;
  aceite

No projeto do painel:

- `painel.matheusbiancardine.com.br`

A Vercel mostra o registro DNS exato para cada um. Para o subdomínio do painel
costuma ser um `CNAME` de `painel` apontando para `cname.vercel-dns.com`.

Aguarde o certificado ficar verde antes de testar o login — em HTTP puro o
cookie de sessão, que é `Secure`, não é aceito pelo navegador.

---

## 5. Publicar

```bash
git checkout main
git merge feat/painel-cms
git push origin main
```

A Vercel dispara os dois projetos. `main` é a branch de produção por padrão.

Os dois projetos assistem ao mesmo repositório, então cada merge reconstrói
ambos. É inofensivo — o site regenera com o mesmo conteúdo. Se quiser evitar,
em Settings → Git → **Ignored Build Step** do projeto do site:

```bash
git diff --quiet HEAD^ HEAD -- apps/site packages
```

Sai com 0 quando nada relevante mudou, e a Vercel pula o build.

---

## 6. Conferir depois de subir

| O quê | Como | Esperado |
| --- | --- | --- |
| Site no ar | abrir `www.matheusbiancardine.com.br` | página completa, **foto do hero aparecendo** |
| Banco conectado | editar um texto no painel e publicar | site muda em segundos |
| Login | abrir o painel | e-mail, senha, código de 6 dígitos |
| Escopo do cookie | DevTools → Application → Cookies | cookie `better-auth…` **sem** atributo `Domain` |
| Revalidação protegida | `curl -X POST https://www.matheusbiancardine.com.br/api/revalidate` | `401` |
| Painel fora do Google | `curl -I https://painel.matheusbiancardine.com.br` | `X-Robots-Tag: noindex` |
| Upload | enviar uma foto em Mídias | sem o aviso amarelo de armazenamento local |

### O teste que mais importa

Com tudo no ar, quebre o banco de propósito uma vez: troque o
`TURSO_AUTH_TOKEN` do **site** por um valor inválido e faça um redeploy. O site
precisa subir normalmente, servindo o conteúdo commitado em
`apps/site/content/fallback.ts`. Depois restaure o token.

É o que garante que uma queda do Turso derruba a sua capacidade de publicar, e
não o site da campanha.

---

## 7. Depois

- Merge para `main` publica. Trabalho em branch, como agora.
- Conteúdo não precisa de deploy: o painel publica direto.
- `apps/site/content/fallback.ts` é a rede de segurança. Vale atualizá-lo de
  tempos em tempos com o conteúdo real, para que uma queda do banco mostre algo
  atual em vez do texto de lançamento.
