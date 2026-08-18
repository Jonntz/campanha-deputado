import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * CSP do painel — bem mais fechada que a do site, porque aqui não entra
 * terceiro nenhum: sem analytics, sem widget, sem CDN. Não há necessidade de
 * 'unsafe-inline' em script-src, que é o que torna uma CSP realmente útil.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  // O Next injeta estilo inline em componentes; sem isto o layout quebra.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
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
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // O painel não pode aparecer em buscador nenhum.
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  transpilePackages: ["@campanha/content", "@campanha/db", "@campanha/icons"],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
