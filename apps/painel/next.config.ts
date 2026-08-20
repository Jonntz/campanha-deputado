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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  transpilePackages: ["@campanha/content", "@campanha/db", "@campanha/icons"],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
