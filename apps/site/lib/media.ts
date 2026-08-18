import type { MediaRef } from "@campanha/content";
import type { StaticImageData } from "next/image";

/**
 * Geometria e placeholder de um MediaRef para `next/image`.
 *
 * O `alt` fica de fora de propósito: é conteúdo específico de cada uso, e
 * deixá-lo explícito em quem chama mantém a análise estática de acessibilidade
 * funcionando — através de um spread o ESLint não o enxerga.
 *
 * O `src` vai como objeto, e não como string, porque `blurWidth`/`blurHeight`
 * só existem em `StaticImageData` — não são props públicas de `<Image>`. Sem
 * eles o Next calcula o viewBox do placeholder a partir da largura real da
 * imagem e o desfoque sai fraco demais.
 */
export function imageProps(ref: MediaRef) {
  const src: StaticImageData = {
    src: ref.url,
    width: ref.width,
    height: ref.height,
    ...(ref.blurDataURL ? { blurDataURL: ref.blurDataURL } : {}),
    ...(ref.blurWidth ? { blurWidth: ref.blurWidth } : {}),
    ...(ref.blurHeight ? { blurHeight: ref.blurHeight } : {}),
  };

  return {
    src,
    ...(ref.blurDataURL ? { placeholder: "blur" as const } : {}),
  };
}
