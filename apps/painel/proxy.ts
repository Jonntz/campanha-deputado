import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Portão barato, na borda: só verifica a presença do cookie de sessão.
 *
 * Não valida nada — não consulta banco, não confere assinatura, não olha o
 * segundo fator. É otimista de propósito, para não pagar uma ida ao banco em
 * toda navegação. A verificação que vale acontece em `app/(painel)/layout.tsx`,
 * no runtime Node, com a sessão de verdade.
 *
 * Tratar isto como autorização seria um erro: um cookie forjado passa por aqui
 * e morre no layout.
 *
 * O arquivo se chama proxy.ts porque o Next 16 renomeou o middleware.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!login|seguranca|api/auth|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
