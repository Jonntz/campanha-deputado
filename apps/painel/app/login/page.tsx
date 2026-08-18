"use client";

import { Alert, Card, Field, Submit } from "@/components/Field";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    setPending(false);

    if (result.error) {
      // Mensagem genérica: distinguir "email não existe" de "senha errada"
      // entrega uma lista de usuários válidos a quem estiver tentando.
      setError("E-mail ou senha incorretos.");
      return;
    }

    // Com 2FA ativo a sessão ainda não foi emitida: falta o segundo fator.
    if (result.data && "twoFactorRedirect" in result.data) {
      router.push("/login/2fa");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card title="Entrar no painel">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="E-mail"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error ? <Alert>{error}</Alert> : null}
        <Submit pending={pending}>Entrar</Submit>
      </form>
    </Card>
  );
}
