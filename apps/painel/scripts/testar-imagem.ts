/**
 * Regressão do pipeline de imagem do painel.
 *
 * Transparência precisa sobreviver ao reencode — um PNG ou WebP com fundo
 * transparente já chegou ao site com o fundo preto, porque tudo virava JPEG.
 * Foto opaca precisa continuar JPEG e com blur, que é o caso comum e o mais
 * leve. E trocar a imagem de uma seção não pode herdar o blur da anterior.
 *
 * Uso: pnpm --filter painel testar:imagem
 */
import type { MediaRef } from "@campanha/content";
import sharp from "sharp";
import { withMedia } from "../components/media/pick";
import { processImage } from "../lib/image";

let fails = 0;
const check = (label: string, pass: boolean, extra = "") => {
  if (!pass) fails++;
  console.log(`${pass ? "  ok  " : " FALHA"}  ${label}${extra ? `  — ${extra}` : ""}`);
};

const corner = async (buf: Buffer) =>
  [...(await sharp(buf).ensureAlpha().extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer())];

async function main() {
  console.log("processamento no servidor");
  const square = {
    input: { create: { width: 20, height: 20, channels: 4 as const, background: { r: 255, g: 0, b: 0, alpha: 1 } } },
    left: 20,
    top: 20,
  };
  const transparentPng = await sharp({
    create: { width: 40, height: 40, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([square])
    .png()
    .toBuffer();
  const transparentWebp = await sharp(transparentPng).webp({ lossless: true }).toBuffer();
  const opaquePng = await sharp({
    create: { width: 40, height: 40, channels: 4, background: { r: 30, g: 90, b: 60, alpha: 1 } },
  })
    .png()
    .toBuffer();
  const photo = await sharp({
    create: { width: 40, height: 40, channels: 3, background: { r: 30, g: 90, b: 60 } },
  })
    .jpeg()
    .toBuffer();

  for (const [name, input] of [
    ["PNG transparente", transparentPng],
    ["WebP transparente", transparentWebp],
  ] as const) {
    const out = await processImage(input);
    const meta = await sharp(out.buffer).metadata();
    const px = await corner(out.buffer);
    check(`${name}: mantém o canal alfa`, Boolean(meta.hasAlpha) && px[3] === 0, `${meta.format}, canto RGBA [${px}]`);
    check(`${name}: tipo declarado bate com o arquivo`, out.contentType === `image/${meta.format}`, `${out.contentType} × ${meta.format}`);
    check(`${name}: sem blur`, !out.blurDataURL);
  }
  for (const [name, input] of [
    ["foto JPEG", photo],
    ["PNG totalmente opaco", opaquePng],
  ] as const) {
    const out = await processImage(input);
    check(`${name}: continua JPEG`, out.contentType === "image/jpeg", out.contentType);
    check(`${name}: continua com blur`, Boolean(out.blurDataURL && out.blurWidth && out.blurHeight));
  }

  console.log("\ntroca de imagem numa seção");
  const current: MediaRef = {
    mediaId: "antiga",
    url: "/images/antiga.jpeg",
    width: 800,
    height: 1000,
    blurDataURL: "data:image/jpeg;base64,ANTIGO",
    blurWidth: 6,
    blurHeight: 8,
    alt: "Descrição escrita na seção",
    focal: { x: 40, y: 20 },
  };
  const upload = { id: "nova", url: "/uploads/nova.webp", width: 1052, height: 2285, defaultAlt: "Padrão da biblioteca", bytes: 1, createdAt: 0 };

  const transparentPick = JSON.parse(
    JSON.stringify(withMedia(current, { ...upload, blurDataUrl: null, blurWidth: null, blurHeight: null })),
  ) as MediaRef;
  check("imagem sem blur não herda o blur da anterior", !("blurDataURL" in transparentPick) && !("blurWidth" in transparentPick));
  check("descrição e enquadramento da seção ficam", transparentPick.alt === current.alt && transparentPick.focal?.x === 40);
  check("arquivo e dimensões trocam", transparentPick.url === upload.url && transparentPick.width === 1052);

  const photoPick = withMedia(current, { ...upload, blurDataUrl: "data:image/jpeg;base64,NOVO", blurWidth: 5, blurHeight: 8 });
  check("imagem com blur traz o blur dela", photoPick.blurDataURL === "data:image/jpeg;base64,NOVO" && photoPick.blurWidth === 5);

  console.log(fails ? `\n${fails} falha(s).` : "\nTudo certo.");
  process.exit(fails ? 1 : 0);
}

// Sem await de topo: este pacote não é ESM, e o tsx transpila para CJS.
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
