import "server-only";

import { createHash } from "node:crypto";
import sharp from "sharp";

/**
 * Normaliza uma imagem enviada pelo painel.
 *
 * Quatro detalhes que não são otimização, são correção:
 *
 * 1. `.rotate()` antes de reencodar. Fotos de iPhone trazem a orientação no
 *    EXIF; sem isso, largura e altura saem trocadas e o `next/image`
 *    renderiza o corte errado.
 * 2. O EXIF é descartado no reencode. As fotos de evento da campanha
 *    costumam carregar coordenadas de GPS — publicá-las seria vazar a
 *    localização de quem estava lá. É requisito de privacidade, não de peso.
 * 3. Transparência vira WebP, nunca JPEG. JPEG não tem canal alfa: um
 *    recorte com fundo transparente reencodado como JPEG sai com o fundo
 *    preto. Foto opaca continua JPEG, que é menor.
 * 4. O blur sai com 8px de lado maior e qualidade 70, que é exatamente o que o
 *    Next gera para imports estáticos. Ele dimensiona o viewBox do placeholder
 *    como `blurWidth * 40`; qualquer outro tamanho muda a intensidade do
 *    desfoque em relação ao resto do site.
 */
const MAX_DIMENSION = 2400;
const BLUR_SIZE = 8;
const BLUR_QUALITY = 70;

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/webp";
  extension: "jpg" | "webp";
  width: number;
  height: number;
  /**
   * Ausentes em imagem transparente. O placeholder do Next pinta o blur como
   * fundo e ainda força opacidade total nas bordas — num recorte, isso vira um
   * retângulo borrado por trás da figura até a imagem carregar.
   */
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
  checksum: string;
};

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const rotated = sharp(input, { failOn: "none" }).rotate();
  const metadata = await rotated.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Não foi possível ler as dimensões da imagem.");
  }

  // Ter canal alfa não basta: muito PNG tem alfa e é inteiramente opaco. Só a
  // imagem que de fato usa transparência precisa de um formato que a guarde.
  const transparent =
    Boolean(metadata.hasAlpha) && !(await rotated.clone().stats()).isOpaque;

  const resized = rotated.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const buffer = transparent
    ? await resized.webp({ quality: 85, alphaQuality: 100 }).toBuffer()
    : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  const final = await sharp(buffer).metadata();
  const width = final.width ?? metadata.width;
  const height = final.height ?? metadata.height;
  const checksum = createHash("sha256").update(buffer).digest("hex");

  if (transparent) {
    return { buffer, contentType: "image/webp", extension: "webp", width, height, checksum };
  }

  const blurWidth =
    width >= height ? BLUR_SIZE : Math.max(Math.round((width / height) * BLUR_SIZE), 1);
  const blurHeight =
    width >= height ? Math.max(Math.round((height / width) * BLUR_SIZE), 1) : BLUR_SIZE;

  const blur = await sharp(buffer)
    .resize(blurWidth, blurHeight, { fit: "fill" })
    .jpeg({ quality: BLUR_QUALITY })
    .toBuffer();

  return {
    buffer,
    contentType: "image/jpeg",
    extension: "jpg",
    width,
    height,
    blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
    blurWidth,
    blurHeight,
    checksum,
  };
}

/** Nome estável e único: mesmo conteúdo, mesmo caminho — dedupe de graça. */
export function storageKey(originalName: string, checksum: string, extension: string) {
  const slug =
    originalName
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "imagem";

  return `midias/${slug}-${checksum.slice(0, 10)}.${extension}`;
}
