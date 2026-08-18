/**
 * Ida e volta pelo banco: lê o publicado, remonta o documento e compara com o
 * padrão. Confirma de uma vez o schema, a divisão em seções e a recomposição.
 */
import { defaultContent, mergeWithDefaults } from "@campanha/content";
import { createDatabase } from "../src/client";
import { readPublishedDocument } from "../src/queries";

const db = createDatabase();
const raw = await readPublishedDocument(db);

console.log("linhas lidas:");
console.log("  settings:", raw.settings ? "presente" : "AUSENTE");
console.log("  sections:", Object.keys(raw.sections ?? {}).join(", "));
console.log("  ordem:", raw.layout?.map((l) => `${l.key}${l.visible ? "" : " (oculta)"}`).join(" → "));

const { content, issues } = mergeWithDefaults(defaultContent, raw);

console.log("\nvalidação por parte:");
if (issues.length === 0) {
  console.log("  tudo veio do banco, sem cair para o padrão");
} else {
  for (const issue of issues) console.log(`  ${issue.part}: ${issue.message}`);
}

/** Ordena as chaves antes de comparar: a ordem no objeto não é significativa. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

const same = canonical(content) === canonical(defaultContent);
console.log(`\nremontado === padrão: ${same ? "SIM" : "NÃO"}`);
if (!same) {
  for (const key of Object.keys(defaultContent) as (keyof typeof defaultContent)[]) {
    const a = canonical(defaultContent[key]);
    const b = canonical(content[key]);
    if (a !== b) console.log(`  difere em: ${key}`);
  }
  process.exit(1);
}
