/**
 * Prova que ordem e visibilidade passam pelo rascunho antes de chegar ao site.
 *
 * Roda inteiro num locale descartável: o `pt-BR` é o que está no ar, e um
 * ensaio que reordena seções de verdade apareceria para quem visita o site.
 * No fim apaga as linhas e os eventos de publicação que criou.
 */
import { defaultContent, splitContent } from "@campanha/content";
import { eq, inArray } from "drizzle-orm";
import { createDatabase } from "../src/client";
import { user } from "../src/auth-schema";
import {
  getPendingChanges,
  publishAll,
  saveLayout,
} from "../src/mutations";
import { readDraftDocument, readPublishedDocument } from "../src/queries";
import { publishEvents, sections } from "../src/schema";

const LOCALE = "ensaio-layout";
const db = createDatabase();
const payloads = splitContent(defaultContent).sections;

let falhas = 0;

function ok(nome: string, condicao: boolean, detalhe = "") {
  console.log(`  ${condicao ? "ok  " : "FALHOU"}  ${nome}${detalhe ? "  — " + detalhe : ""}`);
  if (!condicao) falhas++;
}

const ordem = (layout: { key: string }[] | undefined) =>
  (layout ?? []).map((slot) => slot.key).join(" ");

const [autor] = await db.select({ id: user.id }).from(user).limit(1);
const eventos: string[] = [];

try {
  const agora = new Date();
  for (const [posicao, key] of (["bio", "propostas", "galeria"] as const).entries()) {
    await db.insert(sections).values({
      locale: LOCALE,
      key,
      position: posicao,
      visible: true,
      draftJson: payloads[key],
      publishedJson: payloads[key],
      draftUpdatedAt: agora,
      publishedAt: agora,
    });
  }

  ok("começa sem pendência", (await getPendingChanges(db, LOCALE)).length === 0);

  // --- reordenar ----------------------------------------------------------
  await saveLayout(
    db,
    [
      { key: "galeria", position: 0, visible: true },
      { key: "bio", position: 1, visible: true },
      { key: "propostas", position: 2, visible: true },
    ],
    LOCALE,
  );

  const rascunho = ordem((await readDraftDocument(db, LOCALE)).layout);
  ok("o painel mostra a ordem nova", rascunho === "galeria bio propostas", rascunho);

  const noAr = ordem((await readPublishedDocument(db, LOCALE)).layout);
  ok("o site ainda mostra a ordem antiga", noAr === "bio propostas galeria", noAr);

  // As três trocaram de posição, então as três entram na fila.
  const fila = await getPendingChanges(db, LOCALE);
  ok("reordenar entra na fila", fila.length === 3, fila.map((item) => item.key).join(", "));

  // --- publicar -----------------------------------------------------------
  const publicacao = await publishAll(db, autor?.id ?? "ensaio", LOCALE);
  if (publicacao.eventId) eventos.push(publicacao.eventId);

  const depois = ordem((await readPublishedDocument(db, LOCALE)).layout);
  ok("publicar leva a ordem ao site", depois === "galeria bio propostas", depois);
  ok("a fila zera depois de publicar", (await getPendingChanges(db, LOCALE)).length === 0);

  const linhas = await db.select().from(sections).where(eq(sections.locale, LOCALE));
  ok(
    "o rascunho de layout é limpo",
    linhas.every((linha) => linha.draftPosition === null && linha.draftVisible === null),
  );

  // --- ocultar ------------------------------------------------------------
  await saveLayout(
    db,
    [
      { key: "galeria", position: 0, visible: true },
      { key: "bio", position: 1, visible: false },
      { key: "propostas", position: 2, visible: true },
    ],
    LOCALE,
  );

  ok("ocultar entra na fila", (await getPendingChanges(db, LOCALE)).length === 1);

  const visivelAntes = (await readPublishedDocument(db, LOCALE)).layout?.find(
    (slot) => slot.key === "bio",
  )?.visible;
  ok("o site ainda mostra a seção", visivelAntes === true);

  const segunda = await publishAll(db, autor?.id ?? "ensaio", LOCALE);
  if (segunda.eventId) eventos.push(segunda.eventId);

  const visivelDepois = (await readPublishedDocument(db, LOCALE)).layout?.find(
    (slot) => slot.key === "bio",
  )?.visible;
  ok("publicar oculta no site", visivelDepois === false);
} finally {
  await db.delete(sections).where(eq(sections.locale, LOCALE));
  if (eventos.length > 0) {
    await db.delete(publishEvents).where(inArray(publishEvents.id, eventos));
  }
  const restantes = await db.select().from(sections).where(eq(sections.locale, LOCALE));
  console.log(`\nlimpeza: ${restantes.length} linha(s) de ensaio restantes`);
}

if (falhas > 0) process.exit(1);
