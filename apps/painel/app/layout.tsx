import type { Metadata } from "next";
import "./globals.css";

/**
 * Nada no painel é estático.
 *
 * A CSP usa nonce, e um nonce só existe por requisição — uma página gerada no
 * build sai com scripts sem nonce, que o navegador então bloqueia. O resultado
 * é uma página que aparece mas não responde a nada. Um painel administrativo
 * também não tem o que ganhar com cache.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel — Matheus Biancardine",
  // Reforça o header X-Robots-Tag: cinto e suspensório num painel administrativo.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
