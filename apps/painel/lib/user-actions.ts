"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "./auth";
import { getSession } from "./session";

/**
 * Gestão de quem entra no painel.
 *
 * Só administradores mexem aqui. Editores usam o painel normalmente — o layout
 * exige sessão e segundo fator, não papel — mas não podem criar nem remover
 * ninguém.
 */

export type UserActionResult = { ok: boolean; message: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.user.twoFactorEnabled) {
    throw new Error("não autorizado");
  }
  if (session.user.role !== "admin") {
    throw new Error("apenas administradores");
  }
  return session.user;
}

const newUserSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(80),
  email: z.email("E-mail inválido"),
  // Mesmo mínimo exigido no login; abaixo disso o Better Auth recusaria depois.
  password: z.string().min(12, "A senha precisa de pelo menos 12 caracteres"),
  role: z.enum(["admin", "user"]),
});

export async function createEditor(
  _previous: UserActionResult | null,
  formData: FormData,
): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = newUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, message: z.prettifyError(parsed.error) };
  }

  try {
    await auth.api.createUser({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
      },
      headers: await headers(),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return {
      ok: false,
      message: /exist/i.test(message)
        ? "Já existe alguém com esse e-mail."
        : `Não foi possível criar: ${message}`,
    };
  }

  revalidatePath("/usuarios");
  return {
    ok: true,
    message: `${parsed.data.email} criado. No primeiro acesso o painel vai exigir o cadastro do segundo fator.`,
  };
}

export async function removeEditor(userId: string): Promise<UserActionResult> {
  const admin = await requireAdmin();

  // Sem esta guarda, o único administrador consegue se remover e ninguém mais
  // entra para consertar.
  if (userId === admin.id) {
    return { ok: false, message: "Você não pode remover a própria conta." };
  }

  try {
    await auth.api.removeUser({ body: { userId }, headers: await headers() });
  } catch (cause) {
    return {
      ok: false,
      message: `Não foi possível remover: ${cause instanceof Error ? cause.message : String(cause)}`,
    };
  }

  revalidatePath("/usuarios");
  return { ok: true, message: "Acesso removido." };
}
