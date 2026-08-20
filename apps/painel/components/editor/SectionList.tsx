"use client";

import type { SectionKey } from "@campanha/content";
import { publish, saveSectionLayout, type ActionResult } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type Slot = {
  key: SectionKey;
  label: string;
  visible: boolean;
  canHide: boolean;
  pending: boolean;
};

export function SectionList({
  slots: initial,
  pendingCount,
}: {
  slots: Slot[];
  pendingCount: number;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState(initial);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, startTransition] = useTransition();

  const layoutChanged =
    JSON.stringify(slots.map((s) => [s.key, s.visible])) !==
    JSON.stringify(initial.map((s) => [s.key, s.visible]));

  function move(index: number, to: number) {
    if (to < 0 || to >= slots.length) return;
    const next = [...slots];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(to, 0, moved);
    setSlots(next);
  }

  function run(action: () => Promise<ActionResult>) {
    setResult(null);
    startTransition(async () => {
      const outcome = await action();
      setResult(outcome);
      router.refresh();
    });
  }

  function saveLayout() {
    const form = new FormData();
    form.set(
      "layout",
      JSON.stringify(
        slots.map((slot, position) => ({
          key: slot.key,
          position,
          visible: slot.visible,
        })),
      ),
    );
    run(() => saveSectionLayout(null, form));
  }

  return (
    <div className="space-y-6 pb-28">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Conteúdo</h1>
          <p className="text-sm text-[--muted]">
            Salvar guarda o rascunho; publicar leva ao site.
          </p>
        </div>
        <span className={`chip ${pendingCount ? "chip--warn" : "chip--ok"}`}>
          {pendingCount === 0
            ? "Tudo publicado"
            : `${pendingCount} não publicada(s)`}
        </span>
      </header>

      <ol className="card divide-y divide-[--line]">
        {slots.map((slot, index) => (
          <li key={slot.key} className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.02]">
            <div className="flex shrink-0 flex-col">
              <Arrow
                label={`Mover ${slot.label} para cima`}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                ↑
              </Arrow>
              <Arrow
                label={`Mover ${slot.label} para baixo`}
                disabled={index === slots.length - 1}
                onClick={() => move(index, index + 1)}
              >
                ↓
              </Arrow>
            </div>

            <Link
              href={`/conteudo/${slot.key}`}
              className="flex-1 text-sm font-medium transition hover:text-[--brand]"
            >
              {slot.label}
              {slot.pending ? (
<span className="chip chip--warn ml-2">não publicado</span>
              ) : null}
            </Link>

            <label className="flex shrink-0 items-center gap-2 text-xs text-[--muted]">
              <input
                type="checkbox"
                checked={slot.visible}
                disabled={!slot.canHide}
                onChange={(event) =>
                  setSlots(
                    slots.map((current, i) =>
                      i === index
                        ? { ...current, visible: event.target.checked }
                        : current,
                    ),
                  )
                }
              />
              {slot.canHide ? "visível" : "sempre visível"}
            </label>
          </li>
        ))}
      </ol>

      {result ? (
        <p
          role="status"
          className={`text-sm ${result.ok ? "text-[--brand]" : "text-red-300"}`}
        >
          {result.message}
        </p>
      ) : null}

      <div className="save-bar">
        <div className="save-bar__inner justify-end">
          {layoutChanged ? (
            <button
              type="button"
              onClick={saveLayout}
              disabled={busy}
              className="btn btn--ghost"
            >
              Salvar ordem
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => run(publish)}
            disabled={busy || pendingCount === 0}
            className="btn btn--primary"
          >
            {busy ? "Publicando…" : `Publicar${pendingCount ? ` (${pendingCount})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Arrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="px-1 text-xs leading-tight text-[--muted] transition hover:text-[--fg] disabled:opacity-25"
    >
      {children}
    </button>
  );
}
