"use client";

import type { ActionResult } from "@/lib/actions";

/**
 * Barra de salvar, comum a todos os editores.
 *
 * Salvar grava no rascunho e não toca no site — por isso a mensagem lembra que
 * publicar é um segundo gesto, na tela de Conteúdo.
 */
export function SaveBar({
  dirty,
  pending,
  state,
}: {
  dirty: boolean;
  pending: boolean;
  state: ActionResult | null;
}) {
  return (
    <>
      {state && !state.ok ? (
        <div role="alert" className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-medium">{state.message}</p>
          {state.fieldErrors ? (
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-red-200/70">
              {state.fieldErrors}
            </pre>
          ) : null}
        </div>
      ) : null}

      <div className="save-bar">
        <div className="save-bar__inner">
          <p className="text-sm text-[--muted]">
            {state?.ok
              ? "Rascunho salvo. Publique em Conteúdo para levar ao site."
              : dirty
                ? "Alterações não salvas"
                : "Tudo salvo"}
          </p>
          <button type="submit" disabled={pending || !dirty} className="btn btn--primary">
            {pending ? "Salvando…" : "Salvar rascunho"}
          </button>
        </div>
      </div>
    </>
  );
}
