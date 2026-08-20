"use client";

import { saveSection, type ActionResult } from "@/lib/actions";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";

/**
 * Casca comum dos editores.
 *
 * O estado inteiro da seção vai num campo escondido, como JSON, em vez de
 * campos individuais: listas com adicionar, remover e reordenar são muito mais
 * simples de manter em estado do React do que espalhadas em nomes de input. A
 * ação valida com o mesmo schema Zod do site antes de gravar.
 */
export function SectionForm<T>({
  sectionKey,
  title,
  initial,
  children,
}: {
  sectionKey: string;
  title: string;
  initial: T;
  children: (value: T, set: (next: T) => void) => ReactNode;
}) {
  const [value, setValue] = useState<T>(initial);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveSection,
    null,
  );
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);

  return (
    <form action={formAction} className="space-y-6 pb-24">
      <input type="hidden" name="section" value={sectionKey} />
      <input type="hidden" name="payload" value={JSON.stringify(value)} />

      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {dirty ? (
          <span className="text-xs text-[var(--color-amber)]">
            alterações não salvas
          </span>
        ) : null}
      </div>

      {children(value, setValue)}

      {state && !state.ok ? (
        <div
          role="alert"
          className="space-y-2 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
        >
          <p>{state.message}</p>
          {state.fieldErrors ? (
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-red-200/80">
              {state.fieldErrors}
            </pre>
          ) : null}
        </div>
      ) : null}

      {state?.ok ? (
        <p role="status" className="text-sm text-[var(--color-brand)]">
          {state.message} Publique em Conteúdo para levar ao site.
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[var(--color-deep)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-6 py-3">
          <button
            type="submit"
            disabled={pending || !dirty}
            className="rounded bg-[var(--color-brand)] px-4 py-2 text-sm font-medium transition hover:brightness-110 disabled:opacity-40"
          >
            {pending ? "Salvando…" : "Salvar rascunho"}
          </button>
        </div>
      </div>
    </form>
  );
}
