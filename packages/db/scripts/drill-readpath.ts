/**
 * Altera um texto no banco para que o build seguinte prove a via de leitura.
 * `--restore` desfaz.
 */
import { defaultContent, splitContent } from "@campanha/content";
import { and, eq } from "drizzle-orm";
import { createDatabase } from "../src/client";
import { sections } from "../src/schema";

const db = createDatabase();
const restore = process.argv.includes("--restore");
const original = splitContent(defaultContent).sections.inicio;

const payload = restore
  ? original
  : { ...original, badge: "EDITADO PELO BANCO · 2026" };

await db
  .update(sections)
  .set({ publishedJson: payload })
  .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, "inicio")));

console.log(restore ? "badge restaurado" : `badge alterado para: ${payload.badge}`);
