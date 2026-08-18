import { createClient } from "@libsql/client/web";
const c = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const r = await c.execute("select email, role, two_factor_enabled from user");
console.log(r.rows.length ? r.rows.map((x) => JSON.stringify(x)).join("\n") : "(nenhum usuário)");
