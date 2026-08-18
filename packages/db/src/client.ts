import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as authSchema from "./auth-schema";
import * as schema from "./schema";

/**
 * Cliente do Turso.
 *
 * Usa a build `/web` do @libsql/client de propósito: é HTTP puro, sem binário
 * nativo, então empacota bem em qualquer runtime da Vercel. A build padrão
 * carrega bindings nativos que dão problema no bundle serverless.
 *
 * Como o mesmo endpoint remoto é usado em desenvolvimento e em produção, o
 * caminho de código é idêntico nos dois — não existe uma classe de bug que só
 * aparece depois do deploy.
 */
export type Database = ReturnType<typeof createDatabase>;

export function createDatabase(config?: { url?: string; authToken?: string }) {
  const url = config?.url ?? process.env.TURSO_DATABASE_URL;
  const authToken = config?.authToken ?? process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL não definida");
  }

  return drizzle(createClient({ url, authToken }), {
    schema: { ...schema, ...authSchema },
  });
}
