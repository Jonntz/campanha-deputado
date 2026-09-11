import type { MediaRef } from "@campanha/content";
import type { UploadedMedia } from "./upload";

/**
 * Troca a imagem de um MediaRef, preservando o que pertence à seção.
 *
 * Descrição e enquadramento continuam os da seção: a mesma foto pode ter
 * descrição e recorte diferentes na galeria e no lightbox. Os campos de blur,
 * ao contrário, são sempre substituídos — inclusive por nada. Uma imagem
 * transparente não tem blur, e herdar o da foto anterior faria o placeholder
 * de outra imagem aparecer por baixo dela enquanto carrega.
 */
export function withMedia(
  current: MediaRef,
  media: UploadedMedia & { width: number; height: number },
): MediaRef {
  return {
    ...current,
    mediaId: media.id,
    url: media.url,
    width: media.width,
    height: media.height,
    blurDataURL: media.blurDataUrl ?? undefined,
    blurWidth: media.blurWidth ?? undefined,
    blurHeight: media.blurHeight ?? undefined,
    // Mantém a descrição da seção; só usa a padrão se ainda não houver uma.
    alt: current.alt || media.defaultAlt,
  };
}
