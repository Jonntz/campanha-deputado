"use client";

/**
 * Reduz a imagem no navegador antes de enviar.
 *
 * Não é otimização: o corpo de uma função serverless da Vercel para em 4,5 MB,
 * e as fotos originais da campanha chegam a 12 MB. Reduzir aqui é o que faz o
 * upload caber — e ainda evita subir 12 MB pela rede do celular de quem estiver
 * publicando de um evento.
 */
const MAX_DIMENSION = 2400;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/png": "png",
  "image/avif": "avif",
};

export async function downscale(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Só JPEG sai como JPEG. JPEG não tem canal alfa: um PNG ou WebP
  // transparente reduzido assim chegava ao servidor com o fundo já preto. O
  // resto sai como WebP, que guarda transparência — e, onde o navegador não
  // codifica WebP, o canvas cai para PNG, que também guarda.
  const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, 0.9),
  );

  // Se por algum motivo a redução ficou maior, o original serve.
  return blob && blob.size < file.size ? blob : file;
}

export type UploadedMedia = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  blurWidth: number | null;
  blurHeight: number | null;
  defaultAlt: string;
  bytes: number;
  createdAt: number | string;
};

export async function uploadFile(
  file: File,
): Promise<{ media: UploadedMedia; reused: boolean } | { error: string }> {
  const body = new FormData();
  const blob = await downscale(file);
  // A extensão acompanha o tipo que de fato vai: o reduzido ou o original.
  const extension = EXTENSIONS[blob.type] ?? file.name.split(".").pop() ?? "img";
  body.append("file", blob, `${file.name.replace(/\.[^.]+$/, "")}.${extension}`);

  const response = await fetch("/api/media", { method: "POST", body });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    return { error: json?.error ?? "Falha no envio." };
  }
  return json;
}
