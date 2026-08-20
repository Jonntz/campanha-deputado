import { NavLinks } from "@/components/NavLinks";
import { SignOutButton } from "@/components/SignOutButton";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Verificação real de acesso. Roda em toda rota do painel.
 *
 * O segundo fator é obrigatório e não tem escape: o plugin do Better Auth só
 * desafia quem já cadastrou o TOTP, então quem nunca cadastrou entraria direto.
 * É esta guarda que fecha esse buraco — e ela precisa estar aqui, no layout, e
 * não no proxy, porque só aqui existe a sessão verificada.
 */
export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!session.user.twoFactorEnabled) redirect("/seguranca/2fa");

  return (
    <div className="min-h-screen">
      <header className="topbar">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
          <Link href="/conteudo" className="shrink-0 font-semibold tracking-tight">
            Painel <span className="text-[--amber]">Biancardine</span>
          </Link>

          <div className="hidden flex-1 md:block">
            <NavLinks />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-[--muted] lg:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>

        {/* No celular a navegação desce para a própria linha em vez de sumir. */}
        <div className="border-t border-[--line] px-4 py-2 md:hidden">
          <NavLinks />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
        <div className="rise">{children}</div>
      </main>
    </div>
  );
}
