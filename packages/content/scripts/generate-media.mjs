/**
 * Regenera `content/media.ts` a partir das imagens em `public/images/`.
 *
 * Rode depois de adicionar ou trocar uma imagem do conteúdo padrão.
 *
 * As imagens vivem em `public/` e não como import estático porque a URL de um
 * import carrega o hash do build (`/_next/static/media/hero.HASH.jpg`) e muda a
 * cada alteração do arquivo. Isso serve para cache, mas não serve para ser
 * gravado num banco.
 *
 * O placeholder de blur vem da mesma função que o Next usa no build, em vez de
 * uma reimplementação com sharp — mesmas dimensões, mesmo formato.
 */
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

// resolve o `next` a partir do app: o gerador de blur do build vem de lá
const require = createRequire(
  path.join(path.resolve(import.meta.dirname, "../../.."), "apps/site/package.json"),
);
const { getBlurImage } = require("next/dist/build/webpack/loaders/next-image-loader/blur.js");
const { getImageSize } = require("next/dist/server/image-optimizer.js");

const ROOT = path.resolve(import.meta.dirname, "../../..");
const DIR = path.join(ROOT, "apps/site/public/images");

/**
 * O Next espera um span de tracing cujo `traceFn` execute a função e devolva o
 * resultado. O valor padrão declarado na assinatura devolve um wrapper em vez
 * de chamar — o que faz o dataURL sair como função, e não como string.
 */
const noopTracing = () => ({
  traceFn: (fn) => fn(),
  traceAsyncFn: (fn) => fn(),
});

await mkdir(DIR, { recursive: true });

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort();
const manifest = {};

for (const file of files) {
  const buffer = await readFile(path.join(DIR, file));
  const extension = path.extname(file).slice(1).toLowerCase().replace("jpg", "jpeg");
  const size = await getImageSize(buffer);

  const blur = await getBlurImage(buffer, extension, size, {
    basePath: "",
    outputPath: `/images/${file}`,
    isDev: false,
    tracing: noopTracing,
  });

  const key = path.basename(file, path.extname(file));
  manifest[key] = {
    url: `/images/${file}`,
    width: size.width,
    height: size.height,
    ...(blur.dataURL ? { blurDataURL: blur.dataURL } : {}),
    ...(blur.width ? { blurWidth: blur.width } : {}),
    ...(blur.height ? { blurHeight: blur.height } : {}),
  };

  console.log(`${file}  ${size.width}x${size.height}  blur ${blur.width}x${blur.height}`);
}

const body = `/**
 * GERADO POR \`scripts/generate-media.mjs\` — não editar à mão.
 *
 * Dimensões e placeholders de blur das imagens em \`public/images/\`. O blur foi
 * produzido pela mesma função que o Next usa no build, então é idêntico ao que
 * o site servia quando as imagens eram imports estáticos.
 *
 * Quando a biblioteca de mídia do painel entrar, estes valores passam a vir do
 * banco e este arquivo continua servindo apenas ao conteúdo padrão.
 */

export const MEDIA = ${JSON.stringify(manifest, null, 2)} as const;

export type MediaKey = keyof typeof MEDIA;
`;

await writeFile(path.join(import.meta.dirname, "../src/media-manifest.ts"), body);
console.log(`\n${files.length} imagens → src/media-manifest.ts`);
