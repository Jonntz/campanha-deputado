"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadFile, type UploadedMedia } from "./upload";

export function Uploader({
  onUploaded,
}: {
  onUploaded?: (media: UploadedMedia) => void;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage(null);
    setError(false);

    let sent = 0;
    let reused = 0;
    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if ("error" in result) {
        setError(true);
        setMessage(`${file.name}: ${result.error}`);
        break;
      }
      sent++;
      if (result.reused) reused++;
      onUploaded?.(result.media);
    }

    setBusy(false);
    if (input.current) input.current.value = "";
    if (sent > 0 && !error) {
      setMessage(
        reused > 0
          ? `${sent} enviada(s), ${reused} já existia(m) na biblioteca.`
          : `${sent} imagem(ns) enviada(s).`,
      );
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-white/20 px-4 py-2 text-sm transition hover:border-white/40">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          onChange={(event) => handle(event.target.files)}
          className="sr-only"
        />
        {busy ? "Enviando…" : "Enviar imagens"}
      </label>
      {message ? (
        <p
          role="status"
          className={`text-sm ${error ? "text-red-300" : "text-white/60"}`}
        >
          {message}
        </p>
      ) : null}
      <p className="text-xs text-white/40">
        JPEG, PNG, WebP ou AVIF. Fotos grandes são reduzidas no navegador antes
        do envio; HEIC precisa ser exportado como JPEG antes.
      </p>
    </div>
  );
}
