import { GoogleAnalytics } from "@next/third-parties/google";
import type { SiteContent } from "@campanha/content";
import { MetaPixel } from "./MetaPixel";

/**
 * Ponto único onde as tags de rastreamento são montadas.
 *
 * Cada tag só é renderizada se o ID correspondente estiver definido, então um
 * ambiente sem as variáveis (preview, local) não envia evento nenhum.
 *
 * As variáveis de ambiente têm precedência sobre o conteúdo: é o que permite
 * homologação e preview usarem contas diferentes das de produção. Quando o
 * painel passar a ser a fonte dos IDs, esta precedência precisa ser revista —
 * caso contrário passam a existir duas fontes de verdade.
 *
 * A tag do Google usa o componente oficial do `@next/third-parties`; a da Meta
 * usa next/script porque não existe equivalente oficial. Ambas carregam com a
 * mesma estratégia (`afterInteractive`).
 */
export function Analytics({ content }: { content: SiteContent }) {
  const googleTagId =
    process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? content.analytics.googleTagId;
  const metaPixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID ?? content.analytics.metaPixelId;

  return (
    <>
      {googleTagId ? <GoogleAnalytics gaId={googleTagId} /> : null}
      {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
    </>
  );
}
