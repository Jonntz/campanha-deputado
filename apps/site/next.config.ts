import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * Terceiros que o site realmente carrega. Qualquer host fora desta lista é
 * bloqueado pela CSP — ao adicionar uma nova tag, registre o domínio aqui.
 */

// Tag do Google (gtag.js / Google Analytics)
const GOOGLE_TAG = "https://www.googletagmanager.com";
const GOOGLE_ANALYTICS = "https://www.google-analytics.com";
const GOOGLE_ANALYTICS_REGIONAL = "https://*.google-analytics.com";

// Pixel da Meta: connect.facebook.net serve o fbevents.js,
// www.facebook.com recebe os eventos (inclusive o beacon do <noscript>).
const META_PIXEL_SCRIPT = "https://connect.facebook.net";
const META_PIXEL_BEACON = "https://www.facebook.com";

// Widget de acessibilidade em Libras.
// Atenção: vlibras.gov.br/app/vlibras-plugin.js responde 302 para o jsDelivr.
// A CSP valida cada salto do redirecionamento, então o CDN também precisa
// estar liberado — sem ele o widget não carrega.
const VLIBRAS = "https://vlibras.gov.br";
const VLIBRAS_SUBDOMAINS = "https://*.vlibras.gov.br";
const VLIBRAS_CDN = "https://cdn.jsdelivr.net";

const SCRIPT_HOSTS = [
  GOOGLE_TAG,
  GOOGLE_ANALYTICS,
  META_PIXEL_SCRIPT,
  VLIBRAS,
  VLIBRAS_SUBDOMAINS,
  VLIBRAS_CDN,
];
const IMG_HOSTS = [
  GOOGLE_TAG,
  GOOGLE_ANALYTICS,
  GOOGLE_ANALYTICS_REGIONAL,
  META_PIXEL_BEACON,
  VLIBRAS,
  VLIBRAS_SUBDOMAINS,
  VLIBRAS_CDN,
];
const CONNECT_HOSTS = [
  GOOGLE_TAG,
  GOOGLE_ANALYTICS,
  GOOGLE_ANALYTICS_REGIONAL,
  META_PIXEL_SCRIPT,
  META_PIXEL_BEACON,
  VLIBRAS,
  VLIBRAS_SUBDOMAINS,
  VLIBRAS_CDN,
];
const MEDIA_HOSTS = [VLIBRAS, VLIBRAS_SUBDOMAINS, VLIBRAS_CDN];

/**
 * A tag do Google, o pixel da Meta e o VLibras injetam scripts inline, então
 * `script-src` precisa de 'unsafe-inline'. Uma CSP com nonce exigiria proxy.ts
 * e renderização dinâmica, o que anularia a geração estática — não compensa num
 * site sem login, formulário ou qualquer entrada de usuário.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${SCRIPT_HOSTS.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMG_HOSTS.join(" ")}`,
  `font-src 'self' data: ${VLIBRAS_CDN}`,
  `media-src 'self' blob: ${MEDIA_HOSTS.join(" ")}`,
  // O player do VLibras é Unity/WebGL e roda a partir de um worker em blob:.
  "worker-src 'self' blob:",
  `connect-src 'self' ${CONNECT_HOSTS.join(" ")}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Os pacotes do workspace são publicados como TypeScript cru, sem etapa de
  // build própria: quem compila é o app que os consome.
  transpilePackages: ["@campanha/content", "@campanha/icons"],

  // Num monorepo o Next sobe a árvore procurando a raiz e pode errar o alvo.
  // Apontar explicitamente evita que arquivos do workspace inteiro entrem no
  // rastreamento do bundle serverless.
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),

  images: {
    // AVIF primeiro: ~20-30% menor que WebP com a mesma qualidade percebida.
    formats: ["image/avif", "image/webp"],

    // Imagens enviadas pelo painel em produção. Não é preciso mexer na CSP por
    // causa disto: o next/image serve o resultado otimizado a partir de
    // /_next/image, na mesma origem, então `img-src 'self'` já cobre.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],

    // As imagens têm o hash do conteúdo no nome, então nunca mudam sob a mesma
    // URL — o cache pode ser longo.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },

  // O site não tem rotas dinâmicas nem headers por rota: uma regra global basta.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
