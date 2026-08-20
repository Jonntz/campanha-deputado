"use client";

import { createEditor, removeEditor, type UserActionResult } from "@/lib/user-actions";
import { useActionState, useState, useTransition } from "react";

export type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  isSelf: boolean;
};

export function UserAdmin({ users }: { users: PanelUser[] }) {
  const [state, formAction, pending] = useActionState<UserActionResult | null, FormData>(
    createEditor,
    null,
  );
  const [removal, setRemoval] = useState<UserActionResult | null>(null);
  const [busy, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Editores</h1>
        <p className="text-sm text-[--muted]">
          Quem pode entrar no painel. Não existe cadastro aberto: todo acesso
          nasce aqui.
        </p>
      </header>

      <section className="card">
        <ul className="divide-y divide-[--line]">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {user.name}
                  {user.isSelf ? (
                    <span className="ml-2 text-xs text-[--muted]">(você)</span>
                  ) : null}
                </p>
                <p className="truncate text-sm text-[--muted]">{user.email}</p>
              </div>

              <span className={`chip ${user.role === "admin" ? "chip--brand" : ""}`}>
                {user.role === "admin" ? "Administrador" : "Editor"}
              </span>

              <span
                className={`chip ${user.twoFactorEnabled ? "chip--ok" : "chip--warn"}`}
                title={
                  user.twoFactorEnabled
                    ? "Segundo fator cadastrado"
                    : "Ainda não cadastrou o segundo fator; será exigido no primeiro acesso"
                }
              >
                {user.twoFactorEnabled ? "2FA ativo" : "2FA pendente"}
              </span>

              {user.isSelf ? (
                <span className="w-20 text-right text-xs text-[--muted]">—</span>
              ) : confirming === user.id ? (
                <span className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      startTransition(async () => {
                        setRemoval(await removeEditor(user.id));
                        setConfirming(null);
                      })
                    }
                    className="text-red-300 hover:text-red-200 disabled:opacity-40"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="text-[--muted] hover:text-[--fg]"
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(user.id)}
                  className="w-20 text-right text-xs text-[--muted] transition hover:text-red-300"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {removal ? (
        <p role="status" className={`text-sm ${removal.ok ? "text-[--brand]" : "text-red-300"}`}>
          {removal.message}
        </p>
      ) : null}

      <form action={formAction} className="card space-y-4 p-5">
        <div>
          <h2 className="font-medium tracking-tight">Adicionar editor</h2>
          <p className="mt-1 text-sm text-[--muted]">
            Combine a senha por um canal seguro. No primeiro acesso o painel vai
            exigir o cadastro do segundo fator antes de liberar qualquer tela.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span className="field__label">Nome</span>
            <input name="name" required className="input" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">E-mail</span>
            <input name="email" type="email" required className="input" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Senha inicial</span>
            <input
              name="password"
              type="text"
              required
              minLength={12}
              className="input"
              autoComplete="off"
            />
            <span className="field__hint">Mínimo de 12 caracteres.</span>
          </label>
          <label className="field">
            <span className="field__label">Permissão</span>
            <select name="role" defaultValue="user" className="input">
              <option value="user">Editor — edita conteúdo</option>
              <option value="admin">Administrador — também gerencia acessos</option>
            </select>
          </label>
        </div>

        {state ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${state.ok ? "text-[--brand]" : "text-red-300"}`}
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? "Criando…" : "Criar acesso"}
        </button>
      </form>
    </div>
  );
}
