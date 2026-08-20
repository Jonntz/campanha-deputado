/**
 * Ensaio do ciclo de publicação, do rascunho ao site.
 *
 * O ponto que importa é o meio: salvar o rascunho não pode ter efeito nenhum no
 * site. Só publicar tem.
 */
import { defaultContent, splitContent } from "@campanha/content";
import { createDatabase } from "../src/client";
import {
  getPendingChanges,
  publishAll,
  saveSectionDraft,
} from "../src/mutations";
import { readPublishedDocument } from "../src/queries";

const db = createDatabase();
const original = splitContent(defaultContent).sections.inicio;
const step = process.argv[2];

if (step === "rascunho") {
  await saveSectionDraft(
    db,
    "inicio",
    { ...original, badge: "RASCUNHO NAO PUBLICADO" },
    "drill",
  );
  const pending = await getPendingChanges(db);
  const published = await readPublishedDocument(db);
  console.log("pendentes:", pending.map((p) => p.key).join(", ") || "(nenhum)");
  console.log(
    "badge publicado no banco:",
    (published.sections?.inicio as { badge?: string })?.badge,
  );
} else if (step === "publicar") {
  const { published } = await publishAll(db, "drill");
  const doc = await readPublishedDocument(db);
  console.log("publicado:", published.join(", ") || "(nada)");
  console.log(
    "badge publicado no banco:",
    (doc.sections?.inicio as { badge?: string })?.badge,
  );
} else if (step === "restaurar") {
  await saveSectionDraft(db, "inicio", original, "drill");
  await publishAll(db, "drill");
  const doc = await readPublishedDocument(db);
  console.log(
    "badge restaurado:",
    (doc.sections?.inicio as { badge?: string })?.badge,
  );
} else {
  console.error("uso: drill-publish.ts rascunho|publicar|restaurar");
  process.exit(1);
}
