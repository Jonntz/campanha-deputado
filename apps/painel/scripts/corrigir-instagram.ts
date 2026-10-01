/**
 * Corrige o perfil do Instagram no conteúdo publicado.
 *
 * O site no ar aponta para `@matheus.biancardine`; o perfil correto é
 * `@matheus.biancardinemg`. Como é um link errado já visível para quem visita,
 * o script usa o fluxo normal do painel — grava o rascunho, publica e avisa o
 * site — em vez de escrever no banco por baixo: assim a correção aparece no
 * histórico, com autor e horário, e dá para desfazer por lá.
 *
 * Uso:
 *   pnpm --filter painel corrigir-instagram             # mostra o que mudaria
 *   pnpm --filter painel corrigir-instagram --aplicar   # grava, publica e revalida
 */
import { defaultContent, settingsSchema, splitContent } from "@campanha/content";
import {
  createDatabase,
  publishAll,
  readDraftDocument,
  recordRevalidation,
  saveSettingsDraft,
} from "@campanha/db";

const AUTHOR = "correcao-instagram";

async function main() {
  const apply = process.argv.includes("--aplicar");
  const db = createDatabase();

  const current = settingsSchema.safeParse((await readDraftDocument(db)).settings);
  if (!current.success) {
    throw new Error("As configurações no banco não passam na validação — nada foi alterado.");
  }

  const target = splitContent(defaultContent).settings.identity.instagram;
  const before = current.data.identity.instagram;

  console.log(`antes:  ${before.handle}  ${before.url}`);
  console.log(`depois: ${target.handle}  ${target.url}`);

  if (before.handle === target.handle && before.url === target.url) {
    console.log("\nJá está correto. Nada a fazer.");
    return;
  }

  if (!apply) {
    console.log("\nSimulação — nada foi gravado.");
    console.log("Para aplicar: pnpm --filter painel corrigir-instagram --aplicar");
    return;
  }

  const next = {
    ...current.data,
    identity: { ...current.data.identity, instagram: target },
  };

  await saveSettingsDraft(db, next, AUTHOR);
  const { eventId, published } = await publishAll(db, AUTHOR);
  console.log(`\npublicado: ${published.join(", ") || "(nada)"}`);

  const siteUrl = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!siteUrl || !secret) {
    console.log("SITE_URL ou REVALIDATE_SECRET ausente: o site recolhe a mudança na revalidação automática, em até uma hora.");
    return;
  }

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(10_000),
    });
    if (eventId) await recordRevalidation(db, eventId, { ok: response.ok });
    console.log(response.ok ? "site avisado — já está no ar." : `o site respondeu ${response.status}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (eventId) await recordRevalidation(db, eventId, { ok: false, error: message });
    console.log(`não foi possível avisar o site (${message}). Entra na revalidação automática.`);
  }
}

// Sem await de topo: este pacote não é ESM, e o tsx transpila para CJS.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
