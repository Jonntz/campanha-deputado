import { GoogleAnalytics } from "@next/third-parties/google";
import { analytics } from "@/content/site";
import { MetaPixel } from "./MetaPixel";

/**
 * Ponto único onde as tags de rastreamento são montadas.
 *
 * Cada tag só é renderizada se o ID correspondente estiver definido, então um
 * ambiente sem as variáveis (preview, local) não envia evento nenhum.
 *
 * A tag do Google usa o componente oficial do `@next/third-parties`; a da Meta
 * usa next/script porque não existe equivalente oficial. Ambas carregam com a
 * mesma estratégia (`afterInteractive`).
 */
export function Analytics() {
  const { googleTagId, metaPixelId } = analytics;

  return (
    <>
      {googleTagId ? <GoogleAnalytics gaId={googleTagId} /> : null}
      {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
    </>
  );
}
