import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Duas responsabilidades: a CSP com nonce e o portão de sessão.
 *
 * A CSP precisa ser montada por requisição porque o Next injeta o payload RSC
 * num `<script>` inline. Com `script-src 'self'` puro o navegador bloqueia esse
 * script, o React não hidrata e a página fica inerte — renderiza, mas nenhum
 * botão funciona. O nonce libera exatamente os scripts do Next sem abrir
 * 'unsafe-inline' para qualquer coisa injetada.
 *
 * O portão é barato de propósito: só verifica a presença do cookie, sem ir ao
 * banco. A verificação real está em `app/(painel)/layout.tsx`. Tratar isto como
 * autorização seria um erro — um cookie forjado passa aqui e morre lá.
 *
 * O arquivo se chama proxy.ts porque o Next 16 renomeou o middleware.
 */

/** Rotas que não exigem sessão, mas ainda recebem a CSP. */
const PUBLIC_PREFIXES = ["/login", "/seguranca", "/api/auth"];

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  return [
    "default-src 'self'",
    // O React Refresh do modo dev depende de eval; em produção não entra.
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    // Estilo inline continua necessário: componentes React escrevem style=.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "font-src 'self' data:",
    // Em dev o HMR usa websocket.
    `connect-src 'self'${isDev ? " ws: wss:" : ""} https://blob.vercel-storage.com`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // O Next lê o nonce daqui para carimbá-lo nos próprios scripts.
  requestHeaders.set("Content-Security-Policy", csp);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isPublic && !getSessionCookie(request)) {
    // Rotas de API respondem em JSON. Redirecioná-las faria um POST cair numa
    // página, que então falha ao ler o corpo e devolve 500 no lugar de 401.
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "não autorizado" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Cobre tudo que renderiza HTML ou responde JSON; arquivos estáticos não
  // precisam de CSP e pagariam o custo à toa.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
