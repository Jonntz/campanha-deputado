"use client";

import type { MediaRef, SectionHeader, SplitTitle } from "@campanha/content";
import { PROPOSAL_ICON_NAMES, type ProposalIconName } from "@campanha/content";
import { PROPOSAL_ICONS } from "@campanha/icons";
import { MediaPicker } from "@/components/media/MediaPicker";
import { useState } from "react";
import { Text } from "./primitives";

/** Título partido: a segunda metade recebe o gradiente no site. */
export function SplitTitleField({
  value,
  onChange,
}: {
  value: SplitTitle;
  onChange: (value: SplitTitle) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Text
        label="Título"
        value={value.lead}
        onChange={(lead) => onChange({ ...value, lead })}
      />
      <Text
        label="Destaque (em verde)"
        value={value.accent}
        onChange={(accent) => onChange({ ...value, accent })}
        hint="Aparece com o gradiente da campanha."
      />
    </div>
  );
}

export function SectionHeaderField({
  value,
  onChange,
}: {
  value: SectionHeader;
  onChange: (value: SectionHeader) => void;
}) {
  return (
    <div className="space-y-4">
      <Text
        label="Chapéu"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        hint="Texto pequeno acima do título."
      />
      <SplitTitleField
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
      />
      {value.lead !== undefined ? (
        <Text
          label="Linha de apoio"
          value={value.lead}
          onChange={(lead) => onChange({ ...value, lead })}
          rows={2}
        />
      ) : null}
    </div>
  );
}

/**
 * Imagem de uma seção: arquivo, descrição e enquadramento.
 *
 * O enquadramento existe porque as imagens são cortadas por `object-fit: cover`
 * dentro de proporções fixas no CSS. Quem troca uma foto não controla o corte —
 * controla para onde ele puxa.
 */
export function MediaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MediaRef;
  onChange: (value: MediaRef) => void;
}) {
  const focal = value.focal ?? { x: 50, y: 50 };
  const [picking, setPicking] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[--muted]">{label}</span>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="btn btn--ghost btn--sm"
        >
          Trocar imagem
        </button>
      </div>
      <div className="flex gap-4">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-[--line] bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <Text
            label="Descrição para leitores de tela"
            value={value.alt}
            onChange={(alt) => onChange({ ...value, alt })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <FocalInput
              label="Enquadramento horizontal"
              value={focal.x}
              onChange={(x) => onChange({ ...value, focal: { ...focal, x } })}
            />
            <FocalInput
              label="Enquadramento vertical"
              value={focal.y}
              onChange={(y) => onChange({ ...value, focal: { ...focal, y } })}
            />
          </div>
        </div>
      </div>
      {picking ? (
        <MediaPicker
          current={value}
          onPick={onChange}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  );
}

function FocalInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="field__label">
        {label} — {value}%
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[--brand]"
      />
    </label>
  );
}

/** Só os 7 ícones temáticos: o resto é cromo da interface do site. */
export function IconPicker({
  value,
  onChange,
}: {
  value: ProposalIconName;
  onChange: (value: ProposalIconName) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="field__label">Ícone</legend>
      <div className="flex flex-wrap gap-2">
        {PROPOSAL_ICON_NAMES.map((name) => {
          const Icon = PROPOSAL_ICONS[name];
          const active = name === value;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              aria-label={name}
              title={name}
              onClick={() => onChange(name)}
              className={`rounded-lg border p-2.5 transition ${
                active
                  ? "border-[--brand] bg-[--brand-soft] text-[--fg]"
                  : "border-[--line] text-[--muted] hover:border-[--line-strong] hover:text-[--fg]"
              }`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
