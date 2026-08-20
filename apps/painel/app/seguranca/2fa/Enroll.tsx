"use client";

import { Alert, Card, Field, Submit } from "@/components/Field";
import { twoFactor } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code";

/**
 * Cadastro do segundo fator, obrigatório antes de qualquer acesso ao painel.
 *
 * A confirmação por código no fim não é cerimônia: sem ela alguém pode ativar o
 * 2FA com um QR que leu errado e ficar trancado para fora da própria conta.
 * Só marcamos como ativo depois que um código gerado de verdade é aceito.
 */
export function Enroll() {
  const router = useRouter();
  const [step, setStep] = useState<"senha" | "confirmar">("senha");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function enable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const password = String(new FormData(event.currentTarget).get("password"));
    const result = await twoFactor.enable({ password });
    setPending(false);

    if (result.error || !result.data) {
      setError("Senha incorreta.");
      return;
    }

    setTotpURI(result.data.totpURI);
    setBackupCodes(result.data.backupCodes);
    setStep("confirmar");
  }

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const code = String(new FormData(event.currentTarget).get("code")).trim();
    const result = await twoFactor.verifyTotp({ code });
    setPending(false);

    if (result.error) {
      setError("Código inválido. Confira o relógio do aparelho e tente de novo.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (step === "senha") {
    return (
      <Card
        title="Ative a verificação em duas etapas"
        description="O painel exige segundo fator. Confirme sua senha para começar."
      >
        <form onSubmit={enable} className="space-y-4">
          <Field
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {error ? <Alert>{error}</Alert> : null}
          <Submit pending={pending}>Continuar</Submit>
        </form>
      </Card>
    );
  }

  return (
    <div className="panel rise mx-auto mt-16 w-full max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Escaneie o código
        </h1>
        <p className="text-sm leading-relaxed text-[--muted]">
          Use o Google Authenticator, o Authy ou o gerenciador de senhas do seu
          celular.
        </p>
      </div>

      <div className="flex justify-center rounded bg-white p-4">
        <QRCode value={totpURI} size={168} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Códigos de backup</p>
        <p className="text-sm leading-relaxed text-[--muted]">
          Guarde agora, fora deste computador. Eles são a única forma de entrar
          se você perder o celular, e não voltam a ser exibidos.
        </p>
        <ul className="grid grid-cols-2 gap-1.5 rounded-lg border border-[--line] bg-black/30 p-3 font-mono text-sm">
          {backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <label className="flex items-start gap-2 text-sm text-[--muted]">
          <input
            type="checkbox"
            checked={saved}
            onChange={(event) => setSaved(event.target.checked)}
          />
          Guardei os códigos em lugar seguro
        </label>
      </div>

      <form onSubmit={confirm} className="space-y-4">
        <Field
          label="Código do aplicativo"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={!saved}
          required
        />
        {error ? <Alert>{error}</Alert> : null}
        <Submit pending={pending || !saved}>Ativar</Submit>
      </form>
    </div>
  );
}
