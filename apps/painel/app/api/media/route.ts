import { processImage, storageKey } from "@/lib/image";
import { getSession } from "@/lib/session";
import { getStorage } from "@/lib/storage";
import {
  createDatabase,
  findMediaByChecksum,
  insertMedia,
  listMedia,
} from "@campanha/db";

/**
 * Recebe um arquivo e devolve o MediaRef pronto para o editor.
 *
 * Roda no runtime Node porque o sharp precisa do buffer. O limite de 4 MB
 * existe porque o corpo de uma função serverless da Vercel para em 4,5 MB — o
 * navegador reduz a imagem antes de enviar, então na prática nada chega perto.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Lista para o seletor de imagem dos editores. */
export async function GET() {
  const session = await getSession();
  if (!session || !session.user.twoFactorEnabled) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }
  return Response.json({ media: await listMedia(createDatabase()) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.user.twoFactorEnabled) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (!ACCEPTED.includes(file.type)) {
    // HEIC é o caso comum: as builds do sharp não trazem libheif, então
    // rejeitar com uma mensagem clara é melhor do que falhar no meio.
    return Response.json(
      {
        error:
          file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")
            ? "Formato HEIC não é aceito. Exporte como JPEG antes de enviar."
            : "Envie uma imagem JPEG, PNG, WebP ou AVIF.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Imagem grande demais. O limite é 4 MB depois da redução." },
      { status: 413 },
    );
  }

  let processed;
  try {
    processed = await processImage(Buffer.from(await file.arrayBuffer()));
  } catch {
    return Response.json(
      { error: "Não foi possível processar a imagem." },
      { status: 400 },
    );
  }

  const db = createDatabase();

  // Mesmo conteúdo já enviado antes: reaproveita em vez de duplicar.
  const existing = await findMediaByChecksum(db, processed.checksum);
  if (existing) {
    return Response.json({ media: existing, reused: true });
  }

  let stored;
  try {
    stored = await getStorage().put(
      storageKey(file.name, processed.checksum, processed.extension),
      processed.buffer,
      processed.contentType,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[media] falha ao gravar no armazenamento:", message);

    // Um store privado recusa escrita pública, e a mensagem crua do SDK fala em
    // token inválido — o que manda quem lê investigar a credencial errada.
    return Response.json(
      {
        error: /private store|private access/i.test(message)
          ? "O armazenamento de imagens está configurado como privado. Fale com o responsável técnico: o store precisa ser público."
          : "Não foi possível guardar a imagem. Tente de novo em alguns instantes.",
      },
      { status: 502 },
    );
  }

  const record = await insertMedia(db, {
    id: crypto.randomUUID(),
    kind: "image",
    url: stored.url,
    pathname: stored.pathname,
    mimeType: processed.contentType,
    bytes: processed.buffer.byteLength,
    width: processed.width,
    height: processed.height,
    blurDataUrl: processed.blurDataURL,
    blurWidth: processed.blurWidth,
    blurHeight: processed.blurHeight,
    checksum: processed.checksum,
    defaultAlt: "",
    createdBy: session.user.id,
  });

  return Response.json({ media: record, reused: false });
}
