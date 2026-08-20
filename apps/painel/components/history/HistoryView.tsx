"use client";

import { restoreVersion, type ActionResult } from "@/lib/actions";
import Link from "next/link";
import { useState, useTransition } from "react";

export type SectionOption = { key: string; label: string };
export type RevisionRow = {
  id: string;
  kind: "save" | "publish";
  author: string;
  when: string;
};
export type PublishRow = {
  id: string;
  author: string;
  when: string;
  sections: string[];
  revalidateOk: boolean | null;
  revalidateError: string | null;
};

export function HistoryView({
  sections,
  selected,
  revisions,
  publishes,
}: {
  sections: SectionOption[];
  selected: string;
  revisions: RevisionRow[];
  publishes: PublishRow[];
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
        <p className="text-sm text-[--muted]">
          Cada salvamento vira uma versão. Restaurar traz o texto de volta para o
          rascunho — publicar continua sendo um passo à parte.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold tracking-tight">Versões</h2>

        <div className="flex flex-wrap gap-1.5">
          {sections.map((section) => (
            <Link
              key={section.key}
              href={`/historico?secao=${section.key}`}
              aria-current={section.key === selected ? "page" : undefined}
              className="navlink"
            >
              {section.label}
            </Link>
          ))}
        </div>

        {result ? (
          <p
            role="status"
            className={`text-sm ${result.ok ? "text-[--brand]" : "text-red-300"}`}
          >
            {result.message}
          </p>
        ) : null}

        {revisions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[--line-strong] p-8 text-center text-sm text-[--muted]">
            Nenhuma versão salva desta parte ainda.
          </p>
        ) : (
          <ol className="card divide-y divide-[--line]">
            {revisions.map((revision, index) => (
              <li
                key={revision.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
              >
                <span className="w-32 shrink-0 font-mono text-xs text-[--muted]">
                  {revision.when}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {revision.author}
                </span>
                {index === 0 ? (
                  <span className="chip chip--ok">versão atual</span>
                ) : (
                  <span className="chip">
                    {revision.kind === "publish" ? "publicação" : "salvamento"}
                  </span>
                )}

                {index === 0 ? (
                  <span className="w-24 text-right text-xs text-[--muted]">—</span>
                ) : confirming === revision.id ? (
                  <span className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        startTransition(async () => {
                          setResult(await restoreVersion(revision.id));
                          setConfirming(null);
                        })
                      }
                      className="text-[--brand] disabled:opacity-40"
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
                    onClick={() => setConfirming(revision.id)}
                    className="w-24 text-right text-xs text-[--muted] transition hover:text-[--fg]"
                  >
                    Restaurar
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold tracking-tight">Publicações</h2>

        {publishes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[--line-strong] p-8 text-center text-sm text-[--muted]">
            Nada publicado ainda.
          </p>
        ) : (
          <ol className="card divide-y divide-[--line]">
            {publishes.map((event) => (
              <li key={event.id} className="space-y-1 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="w-32 shrink-0 font-mono text-xs text-[--muted]">
                    {event.when}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {event.author}
                  </span>
                  {/* O site pode não ter sido avisado mesmo com a publicação
                      gravada: são dois passos, e só o primeiro é garantido. */}
                  <span
                    className={`chip ${
                      event.revalidateOk === false ? "chip--warn" : "chip--ok"
                    }`}
                    title={event.revalidateError ?? undefined}
                  >
                    {event.revalidateOk === false
                      ? "site não avisado"
                      : "site atualizado"}
                  </span>
                </div>
                <p className="pl-0 text-xs text-[--muted] sm:pl-36">
                  {event.sections.join(", ")}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
