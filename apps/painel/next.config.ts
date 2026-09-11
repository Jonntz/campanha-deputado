import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * A CSP não está aqui: ela é montada por requisição em `proxy.ts`, porque
 * precisa carregar um nonce novo a cada resposta. Um valor estático em
 * next.config não teria como fazer isso.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // O painel não pode aparecer em buscador nenhum.
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

/**
 * De onde vêm as mídias com caminho relativo.
 *
 * O conteúdo guarda caminhos do site — `/images/…`, `/assets/…`, `/videos/…` —
 * que não existem no domínio do painel: sem isto, a miniatura de toda imagem que
 * não veio do Blob aparece quebrada no editor. O rewrite busca no site e entrega
 * pela origem do próprio painel, então a CSP segue `img-src 'self'`. Como o proxy
 * roda antes dos rewrites, só quem está logado chega a buscar.
 *
 * Localmente, `MEDIA_ORIGIN=http://localhost:3000` mostra arquivos que ainda não
 * subiram para o site publicado.
 */
const MEDIA_ORIGIN = (process.env.MEDIA_ORIGIN ?? process.env.SITE_URL)?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  transpilePackages: ["@campanha/content", "@campanha/db", "@campanha/icons"],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async rewrites() {
    if (!MEDIA_ORIGIN) return [];
    return ["images", "assets", "videos", "uploads"].map((dir) => ({
      source: `/${dir}/:path*`,
      destination: `${MEDIA_ORIGIN}/${dir}/:path*`,
    }));
  },
};

export default nextConfig;
