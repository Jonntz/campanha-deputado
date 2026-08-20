"use client";

import type { ReactNode } from "react";

const inputClass =
  "w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brand)]";

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
    <label className="block space-y-1.5">
      <span className="text-sm text-white/70">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {hint ? <span className="block text-xs text-white/40">{hint}</span> : null}
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
    <section className="space-y-4 rounded-lg border border-white/10 bg-black/20 p-5">
      <div className="space-y-1">
        <h2 className="font-medium tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-white/50">{description}</p>
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
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">
          {label} <span className="text-white/40">({items.length})</span>
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, createItem()])}
          className="rounded border border-white/15 px-2.5 py-1 text-xs transition hover:border-white/35"
        >
          Adicionar
        </button>
      </div>

      <ol className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="space-y-3 rounded border border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-white/50">
                {itemLabel(item, index)}
              </span>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  label={`Mover ${itemLabel(item, index)} para cima`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </IconButton>
                <IconButton
                  label={`Mover ${itemLabel(item, index)} para baixo`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  ↓
                </IconButton>
                <IconButton
                  label={`Remover ${itemLabel(item, index)}`}
                  disabled={items.length <= min}
                  onClick={() =>
                    onChange(items.filter((_, i) => i !== index))
                  }
                >
                  ✕
                </IconButton>
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

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-white/15 px-2 py-0.5 text-xs transition hover:border-white/35 disabled:opacity-25"
    >
      {children}
    </button>
  );
}
