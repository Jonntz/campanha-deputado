import { UserAdmin } from "@/components/users/UserAdmin";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getSession();
  const isAdmin = session?.user.role === "admin";

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Editores</h1>
        <p className="text-sm text-[--muted]">
          Só administradores podem gerenciar quem tem acesso ao painel.
        </p>
      </div>
    );
  }

  const result = await auth.api.listUsers({
    query: { limit: 100 },
    headers: await headers(),
  });

  const users = ("users" in result ? result.users : []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    twoFactorEnabled: Boolean(
      (user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
    ),
    isSelf: user.id === session.user.id,
  }));

  return <UserAdmin users={users} />;
}
