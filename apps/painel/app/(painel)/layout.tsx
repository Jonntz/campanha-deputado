import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

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
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/conteudo" className="font-semibold tracking-tight">
            Painel <span className="text-[var(--color-amber)]">Biancardine</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/60">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
