/**
 * Tenta ocultar seções direto no banco, contornando o painel.
 *
 * `inicio` precisa continuar renderizando: é o alvo do link da marca e o estado
 * inicial do scrollspy. A interface desabilita a caixa, a server action força o
 * valor — e o site força de novo na leitura. Este ensaio testa a última camada,
 * que é a única que protege contra uma escrita direta no banco.
 */
import { and, eq } from "drizzle-orm";
import { createDatabase } from "../src/client";
import { sections } from "../src/schema";

const db = createDatabase();
const restore = process.argv.includes("--restore");

for (const key of ["inicio", "galeria"] as const) {
  await db
    .update(sections)
    .set({ visible: restore })
    .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, key)));
}
console.log(restore ? "visibilidade restaurada" : "inicio e galeria marcadas como ocultas");
