"use client";

import { Alert, Card, Field, Submit } from "@/components/Field";
import { twoFactor } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TwoFactorPage() {
  const router = useRouter();
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const code = String(new FormData(event.currentTarget).get("code")).trim();
    const result = useBackup
      ? await twoFactor.verifyBackupCode({ code })
      : await twoFactor.verifyTotp({ code });

    setPending(false);

    if (result.error) {
      setError(
        useBackup
          ? "Código de backup inválido ou já usado."
          : "Código inválido. Confira se o relógio do aparelho está certo.",
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card
      title="Verificação em duas etapas"
      description={
        useBackup
          ? "Digite um dos códigos de backup que você guardou."
          : "Digite o código de 6 dígitos do seu aplicativo autenticador."
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label={useBackup ? "Código de backup" : "Código"}
          name="code"
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          autoFocus
          required
        />
        {error ? <Alert>{error}</Alert> : null}
        <Submit pending={pending}>Verificar</Submit>
      </form>

      <button
        type="button"
        onClick={() => {
          setUseBackup((v) => !v);
          setError(null);
        }}
        className="text-sm text-[--muted] underline-offset-4 transition hover:text-[--fg] hover:underline"
      >
        {useBackup
          ? "Usar o aplicativo autenticador"
          : "Perdi o acesso — usar código de backup"}
      </button>
    </Card>
  );
}
