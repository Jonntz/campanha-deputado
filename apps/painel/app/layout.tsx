import type { Metadata } from "next";
import "./globals.css";

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
