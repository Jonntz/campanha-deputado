"use client";

import { removeMedia, updateMediaDescription } from "@/lib/actions";
import { useState, useTransition } from "react";
import { Uploader } from "./Uploader";

export type LibraryItem = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  bytes: number;
  defaultAlt: string;
};

export function MediaLibrary({ items }: { items: LibraryItem[] }) {
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Mídias</h1>
          <p className="text-sm text-[--muted]">
            {items.length} imagem(ns) na biblioteca.
          </p>
        </div>
        <Uploader />
      </div>

      {message ? (
        <p
          role="status"
          className={`text-sm ${message.ok ? "text-[--brand]" : "text-red-300"}`}
        >
          {message.text}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[--line-strong] p-10 text-center text-sm text-[--muted]">
          Nenhuma imagem enviada ainda.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="card space-y-3 p-3 transition hover:border-[--line-strong]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.defaultAlt}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <AltEditor
                id={item.id}
                initial={item.defaultAlt}
                onResult={(text, ok) => setMessage({ text, ok })}
              />
              <div className="flex items-center justify-between text-xs text-[--muted]">
                <span>
                  {item.width}×{item.height} · {Math.round(item.bytes / 1024)} kB
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await removeMedia(item.id);
                      setMessage({ text: result.message, ok: result.ok });
                    })
                  }
                  className="transition hover:text-red-300 disabled:opacity-40"
                >
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AltEditor({
  id,
  initial,
  onResult,
}: {
  id: string;
  initial: string;
  onResult: (text: string, ok: boolean) => void;
}) {
  const [value, setValue] = useState(initial);
  const [busy, startTransition] = useTransition();
  const dirty = value !== initial;

  return (
    <div className="space-y-1.5">
      <label className="field">
        <span className="field__label">Descrição padrão</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="O que aparece na imagem"
          className="input"
        />
      </label>
      {dirty ? (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            startTransition(async () => {
              const result = await updateMediaDescription(id, value);
              onResult(result.message, result.ok);
            })
          }
          className="text-xs text-[--brand] disabled:opacity-40"
        >
          Salvar descrição
        </button>
      ) : null}
    </div>
  );
}
