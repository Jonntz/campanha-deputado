"use client";

import { saveSection, type ActionResult } from "@/lib/actions";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { SaveBar } from "./SaveBar";

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
    <form action={formAction} className="space-y-6 pb-28">
      <input type="hidden" name="section" value={sectionKey} />
      <input type="hidden" name="payload" value={JSON.stringify(value)} />

      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {dirty ? <span className="chip chip--warn">não salvo</span> : null}
      </header>

      {children(value, setValue)}

      <SaveBar dirty={dirty} pending={pending} state={state} />
    </form>
  );
}
