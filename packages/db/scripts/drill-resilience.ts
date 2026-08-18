/**
 * Ensaio de resiliência: corrompe uma seção no banco e confirma a contenção.
 *
 * É a razão de existir uma linha por seção em vez de um documento único. O
 * site da campanha precisa continuar no ar com um payload ruim, e este script
 * verifica que o estrago para na fronteira da seção.
 *
 * Restaura o estado ao final.
 */
import { defaultContent, mergeWithDefaults, splitContent } from "@campanha/content";
import { and, eq } from "drizzle-orm";
import { createDatabase } from "../src/client";
import { readPublishedDocument } from "../src/queries";
import { sections } from "../src/schema";

const db = createDatabase();
const document = splitContent(defaultContent);

console.log("corrompendo o payload de `propostas`...");
await db
  .update(sections)
  .set({ publishedJson: { items: "isto não é uma lista" } as never })
  .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, "propostas")));

const { content, issues } = mergeWithDefaults(defaultContent, await readPublishedDocument(db));

console.log("\npartes que caíram para o padrão:");
for (const issue of issues) {
  console.log(`  ${issue.part}: ${issue.message.split("\n")[0]}`);
}

const proposalsOk =
  JSON.stringify(content.proposals) === JSON.stringify(defaultContent.proposals);
const heroOk = JSON.stringify(content.hero) === JSON.stringify(defaultContent.hero);
const bioOk = JSON.stringify(content.bio) === JSON.stringify(defaultContent.bio);

console.log("\nresultado:");
console.log(`  propostas usou o padrão: ${proposalsOk ? "sim" : "NÃO"}`);
console.log(`  demais seções intactas:  ${heroOk && bioOk ? "sim" : "NÃO"}`);
console.log(`  seções afetadas:         ${issues.length} de 7 partes`);

console.log("\nrestaurando...");
await db
  .update(sections)
  .set({ publishedJson: document.sections.propostas })
  .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, "propostas")));

const after = mergeWithDefaults(defaultContent, await readPublishedDocument(db));
console.log(`restaurado sem problemas: ${after.issues.length === 0 ? "sim" : "NÃO"}`);
