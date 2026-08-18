import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Enroll } from "./Enroll";

/**
 * Fica fora do grupo (painel) de propósito: o layout de lá exige 2FA ativo, e
 * esta é justamente a tela de quem ainda não tem. Dentro do grupo, entraria em
 * laço de redirecionamento.
 */
export const dynamic = "force-dynamic";

export default async function EnrollPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.user.twoFactorEnabled) redirect("/");

  return <Enroll />;
}
