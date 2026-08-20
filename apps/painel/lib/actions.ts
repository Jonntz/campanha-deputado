"use server";

import {
  SECTION_KEYS,
  SECTION_PAYLOAD_SCHEMAS,
  SECTION_REGISTRY,
  type SectionKey,
} from "@campanha/content";
import {
  createDatabase,
  deleteMedia,
  findMediaUsage,
  listMedia,
  publishAll,
  recordRevalidation,
  saveLayout,
  saveSectionDraft,
  updateMediaAlt,
} from "@campanha/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "./session";
import { getStorage } from "./storage";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: string };

/**
 * Toda ação passa por aqui. O `proxy.ts` não protege server actions — elas são
 * um endpoint POST próprio, e sem esta checagem estariam abertas.
 */
async function requireUser() {
  const session = await getSession();
  if (!session || !session.user.twoFactorEnabled) {
    throw new Error("não autorizado");
  }
  return session.user;
}

function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

export async function saveSection(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const key = String(formData.get("section"));
  if (!isSectionKey(key)) {
    return { ok: false, message: "Seção desconhecida." };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(String(formData.get("payload")));
  } catch {
    return { ok: false, message: "Não foi possível ler o formulário." };
  }

  // Validação na borda: nada inválido chega ao banco.
  const result = SECTION_PAYLOAD_SCHEMAS[key].safeParse(parsedJson);
  if (!result.success) {
    return {
      ok: false,
      message: "Há campos com problema.",
      fieldErrors: z.prettifyError(result.error),
    };
  }

  await saveSectionDraft(
    createDatabase(),
    key,
    result.data as never,
    user.id,
  );

  revalidatePath("/conteudo");
  revalidatePath(`/conteudo/${key}`);

  return { ok: true, message: "Rascunho salvo." };
}

const layoutSchema = z.array(
  z.object({
    key: z.enum(SECTION_KEYS),
    position: z.number().int().min(0),
    visible: z.boolean(),
  }),
);

/**
 * Grava ordem e visibilidade das seções.
 *
 * `inicio` é forçada visível aqui, e não só na interface: é o alvo do link da
 * marca e o estado inicial do scrollspy. Confiar apenas no botão desabilitado
 * deixaria a regra a um POST de distância de ser burlada.
 */
export async function saveSectionLayout(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("layout")));
  } catch {
    return { ok: false, message: "Não foi possível ler a ordem das seções." };
  }

  const result = layoutSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, message: "Ordem inválida." };
  }

  const layout = result.data.map((slot) => ({
    ...slot,
    visible: SECTION_REGISTRY[slot.key].canHide ? slot.visible : true,
  }));

  await saveLayout(createDatabase(), layout);
  void user;

  revalidatePath("/conteudo");
  return { ok: true, message: "Ordem e visibilidade salvas." };
}

/**
 * Publica e avisa o site.
 *
 * A ordem importa: o banco é a fonte da verdade, então ele é atualizado
 * primeiro. Se a chamada ao site falhar, o conteúdo continua publicado e o
 * painel oferece nova tentativa — em vez de reverter algo que já está correto.
 */
export async function publish(): Promise<ActionResult> {
  const user = await requireUser();
  const db = createDatabase();

  const { eventId, published } = await publishAll(db, user.id);

  if (published.length === 0) {
    return { ok: true, message: "Nada pendente para publicar." };
  }

  const siteUrl = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!siteUrl || !secret) {
    if (eventId) {
      await recordRevalidation(db, eventId, {
        ok: false,
        error: "SITE_URL ou REVALIDATE_SECRET ausente",
      });
    }
    revalidatePath("/conteudo");
    return {
      ok: false,
      message:
        "Publicado no banco, mas o site não foi avisado: falta configurar SITE_URL/REVALIDATE_SECRET.",
    };
  }

  let ok = false;
  let error: string | undefined;

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(10_000),
    });
    ok = response.ok;
    if (!ok) error = `HTTP ${response.status}`;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
  }

  if (eventId) await recordRevalidation(db, eventId, { ok, error });
  revalidatePath("/conteudo");

  return ok
    ? { ok: true, message: `Publicado: ${published.length} alteração(ões).` }
    : {
        ok: false,
        message: `Publicado no banco, mas o site não confirmou a atualização (${error}).`,
      };
}

export async function updateMediaDescription(
  id: string,
  alt: string,
): Promise<ActionResult> {
  await requireUser();
  await updateMediaAlt(createDatabase(), id, alt.trim());
  revalidatePath("/midias");
  return { ok: true, message: "Descrição salva." };
}

/**
 * Só apaga o que não está em uso.
 *
 * Uma mídia removida enquanto ainda referenciada deixaria uma imagem quebrada
 * no site — e o `MediaRef` gravado na seção é desnormalizado, então nada
 * avisaria antes de a página renderizar.
 */
export async function removeMedia(id: string): Promise<ActionResult> {
  await requireUser();
  const db = createDatabase();

  const usage = await findMediaUsage(db, id);
  if (usage.length > 0) {
    return {
      ok: false,
      message: `Em uso em: ${usage.join(", ")}. Troque a imagem nessas seções antes de apagar.`,
    };
  }

  const record = (await listMedia(db)).find((item) => item.id === id);
  if (record) await getStorage().remove(record.pathname);

  await deleteMedia(db, id);
  revalidatePath("/midias");
  return { ok: true, message: "Mídia removida." };
}
