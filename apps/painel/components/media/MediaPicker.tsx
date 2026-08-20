"use client";

import type { MediaRef } from "@campanha/content";
import { useEffect, useState } from "react";
import { Uploader } from "./Uploader";
import type { UploadedMedia } from "./upload";

/**
 * Escolhe uma imagem da biblioteca para uma seção.
 *
 * O `alt` e o enquadramento não vêm junto: são conteúdo de cada uso, e a mesma
 * foto pode ter descrição e recorte diferentes na galeria e no lightbox. O que
 * a biblioteca guarda é uma descrição padrão, usada só como ponto de partida.
 */
export function MediaPicker({
  current,
  onPick,
  onClose,
}: {
  current: MediaRef;
  onPick: (media: MediaRef) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<UploadedMedia[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/media")
      .then((response) => response.json())
      .then((json) => {
        if (active) setItems(json.media ?? []);
      })
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, []);

  function pick(media: UploadedMedia) {
    if (!media.width || !media.height) return;
    onPick({
      ...current,
      mediaId: media.id,
      url: media.url,
      width: media.width,
      height: media.height,
      ...(media.blurDataUrl ? { blurDataURL: media.blurDataUrl } : {}),
      ...(media.blurWidth ? { blurWidth: media.blurWidth } : {}),
      ...(media.blurHeight ? { blurHeight: media.blurHeight } : {}),
      // Mantém a descrição da seção; só usa a padrão se ainda não houver uma.
      alt: current.alt || media.defaultAlt,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 rounded-lg border border-white/15 bg-[var(--color-deep)] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium">Escolher imagem</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/15 px-3 py-1 text-sm transition hover:border-white/35"
          >
            Fechar
          </button>
        </div>

        <Uploader onUploaded={(media) => setItems((prev) => [media, ...(prev ?? [])])} />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items === null ? (
            <p className="text-sm text-white/40">Carregando…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-white/40">
              Nenhuma imagem na biblioteca. Envie a primeira acima.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {items.map((media) => (
                <li key={media.id}>
                  <button
                    type="button"
                    onClick={() => pick(media)}
                    className={`w-full overflow-hidden rounded border transition ${
                      media.url === current.url
                        ? "border-[var(--color-brand)]"
                        : "border-white/10 hover:border-white/40"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.url}
                      alt={media.defaultAlt}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
