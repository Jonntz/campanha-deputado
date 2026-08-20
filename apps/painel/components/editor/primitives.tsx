"use client";

import type { ReactNode } from "react";

export function Text({
  label,
  value,
  onChange,
  hint,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="input"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="input"
        />
      )}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

export function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel space-y-5">
      <div className="space-y-1">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-[--muted]">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * Lista editável com adicionar, remover e reordenar.
 *
 * Reordenação por botões ↑↓ em vez de arrastar: funciona com teclado sem
 * esforço extra, funciona no celular, e para listas de 4 a 7 itens é mais
 * rápido do que arrastar.
 */
export function Repeater<T>({
  label,
  items,
  onChange,
  renderItem,
  createItem,
  itemLabel,
  min = 0,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
  createItem: () => T;
  itemLabel: (item: T, index: number) => string;
  min?: number;
}) {
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (moved !== undefined) next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[--muted]">
          {label} <span className="opacity-60">({items.length})</span>
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, createItem()])}
          className="btn btn--ghost btn--sm"
        >
          Adicionar
        </button>
      </div>

      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="card space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-[--muted]">
                {itemLabel(item, index)}
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label={`Mover ${itemLabel(item, index)} para cima`}
                  title="Mover para cima"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="btn btn--icon"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Mover ${itemLabel(item, index)} para baixo`}
                  title="Mover para baixo"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="btn btn--icon"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label={`Remover ${itemLabel(item, index)}`}
                  title="Remover"
                  disabled={items.length <= min}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="btn btn--icon"
                >
                  ✕
                </button>
              </div>
            </div>
            {renderItem(item, (next) =>
              onChange(items.map((current, i) => (i === index ? next : current))),
              index,
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
