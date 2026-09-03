"use client";

import { Alert, Card, Field, Submit } from "@/components/Field";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Falha de credencial e falha de configuração precisam soar diferente.
 *
 * Distinguir "e-mail não existe" de "senha errada" entregaria uma lista de
 * usuários válidos a quem estiver tentando — por isso as duas continuam com a
 * mesma resposta. Mas tratar um erro de configuração como senha errada manda a
 * pessoa trocar a senha várias vezes enquanto o problema está no servidor.
 */
function mensagemDeErro(error: { code?: string; status?: number }): string {
  if (error.code === "INVALID_ORIGIN") {
    return "O painel está mal configurado no servidor (origem não confiável). Fale com o responsável técnico — não adianta tentar outra senha.";
  }
  if (error.status === 429) {
    return "Muitas tentativas seguidas. Espere alguns minutos antes de tentar de novo.";
  }
  if (error.status && error.status >= 500) {
    return "O servidor não conseguiu responder. Tente de novo em instantes.";
  }
  return "E-mail ou senha incorretos.";
}

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
      setError(mensagemDeErro(result.error));
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
