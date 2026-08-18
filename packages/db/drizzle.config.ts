import { defineConfig } from "drizzle-kit";

/**
 * O drizzle-kit roda fora do Next, então carrega o .env da raiz do workspace
 * por conta própria (Node 20.6+ entende --env-file, usado nos scripts).
 */
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
