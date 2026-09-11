import localFont from "next/font/local";

/**
 * Amsi Pro, a fonte da identidade da campanha.
 *
 * Servida pelo próprio site via next/font: nenhuma requisição a terceiros — a
 * CSP continua `font-src 'self'` — e com fallback de métricas ajustado, o que
 * evita o texto pular de tamanho quando a fonte chega.
 *
 * Os arquivos são os TTF entregues com o layout, convertidos para WOFF2 sem
 * subsetting (46 a 51 KB cada). A fonte é comercial, da Stawix Foundry: o uso
 * no site depende de a campanha ter licença de webfont.
 */
export const amsi = localFont({
  src: [
    {
      path: "../assets/fonts/AmsiProNormal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/AmsiProNormal-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/AmsiProNormal-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-amsi",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
