/**
 * Carga inicial: grava o conteúdo padrão no banco, como rascunho e publicado.
 *
 * Idempotente — resolve conflito de chave sobrescrevendo. Depois que o painel
 * existir, rodar isto de novo descarta edições, então serve apenas para
 * inicializar um banco novo.
 */
import { defaultContent, splitContent } from "@campanha/content";
import { createDatabase } from "../src/client";
import { writeWholeDocument } from "../src/queries";

const db = createDatabase();
const document = splitContent(defaultContent);

await writeWholeDocument(db, document, { author: "seed" });

console.log("Conteúdo padrão gravado:");
console.log("  settings: 1 linha");
console.log(`  sections: ${Object.keys(document.sections).length} linhas`);
