import { Barlow, Barlow_Condensed } from "next/font/google";

/**
 * Fontes self-hosted pelo next/font: sem request para o Google, sem FOUT e
 * com métricas de fallback ajustadas automaticamente (evita layout shift).
 * Os pesos são exatamente os que o design usa.
 */

export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});
