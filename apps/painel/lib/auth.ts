import { createDatabase } from "@campanha/db";
import * as authSchema from "@campanha/db/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { twoFactor } from "better-auth/plugins/two-factor";

/**
 * Autenticação do painel.
 *
 * Sem `server-only` aqui de propósito: o script que cria o primeiro
 * administrador e a CLI do Better Auth precisam carregar esta configuração fora
 * do Next. A guarda fica em `lib/session.ts`, que é o que os componentes
 * realmente importam.
 *
 * Duas decisões carregam o resto:
 *
 * 1. **Não existe cadastro público.** `disableSignUp` fecha a porta de vez; o
 *    primeiro administrador nasce de um script, e os demais por convite. Um
 *    painel de campanha com auto-cadastro aberto é um problema esperando data.
 *
 * 2. **O cookie é do subdomínio, e só dele.** Sem `crossSubDomainCookies`, ele
 *    sai sem atributo `Domain` e nunca é enviado para o domínio do site. Um
 *    vazamento de sessão aqui não alcança a campanha.
 */
/**
 * Variáveis sem as quais o painel não tem como funcionar.
 *
 * Falta delas precisa ser um erro alto na subida, e não um 403 confuso mais
 * tarde: sem `BETTER_AUTH_URL` a lista de origens confiáveis fica vazia, toda
 * requisição de login é recusada com "Invalid origin", e a tela mostra
 * "e-mail ou senha incorretos" — mandando quem lê investigar a credencial, que
 * está certa.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} não está definida. O painel não sobe sem ela — confira as ` +
        `variáveis de ambiente do projeto na Vercel.`,
    );
  }
  return value;
}

// Em desenvolvimento o valor padrão evita atrito; em produção, exigimos.
const baseURL =
  process.env.NODE_ENV === "production"
    ? required("BETTER_AUTH_URL").replace(/\/+$/, "")
    : (process.env.BETTER_AUTH_URL ?? "http://localhost:3001");

export const auth = betterAuth({
  // O schema precisa ser passado explicitamente: sem ele o adapter não
  // encontra os modelos e falha só na primeira operação, em runtime.
  database: drizzleAdapter(createDatabase(), {
    provider: "sqlite",
    schema: authSchema,
  }),

  baseURL,
  secret:
    process.env.NODE_ENV === "production"
      ? required("BETTER_AUTH_SECRET")
      : process.env.BETTER_AUTH_SECRET,
  // Uma barra no fim já basta para a origem não bater, então normalizamos.
  trustedOrigins: [baseURL],

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  advanced: {
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: { sameSite: "lax", httpOnly: true },
  },

  /**
   * Armazenamento em banco, não em memória: na Vercel cada instância tem sua
   * própria memória, então um limite em memória não limita nada.
   */
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 300, max: 5 },
      "/two-factor/verify-totp": { window: 300, max: 5 },
      "/two-factor/verify-backup-code": { window: 900, max: 3 },
    },
  },

  plugins: [twoFactor({ issuer: "Painel Matheus Biancardine" }), admin()],
});
