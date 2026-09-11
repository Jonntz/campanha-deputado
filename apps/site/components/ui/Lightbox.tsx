"use client";

import type { MediaRef } from "@campanha/content";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { imageProps } from "@/lib/media";
import { CloseIcon } from "@/components/ui/icons";
import styles from "./Lightbox.module.css";

export type LightboxImage = {
  image: MediaRef;
  caption?: string;
};

type LightboxProps = {
  item: LightboxImage | null;
  labels: { dialog: string; close: string };
  onClose: () => void;
};

/**
 * Usa <dialog> nativo: o navegador cuida da top-layer, do foco preso dentro do
 * modal, do retorno do foco ao fechar e do Escape.
 */
export function Lightbox({ item, labels, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item && !dialog.open) {
      dialog.showModal();
    } else if (!item && dialog.open) {
      dialog.close();
    }
  }, [item]);

  // Escape dispara "cancel"/"close" no <dialog>: propagamos para o estado.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.lightbox}
      aria-label={item?.caption ?? labels.dialog}
      // Fecha no clique do fundo escurecido — o alvo é o próprio <dialog>.
      // Clicar na foto não fecha.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {item ? (
        <>
          <div className={styles.top}>
            <p className={styles.title}>{item.caption ?? labels.dialog}</p>
            <button
              type="button"
              className={styles.close}
              aria-label={labels.close}
              onClick={onClose}
            >
              <CloseIcon size={24} />
            </button>
          </div>
          <div className={styles.photo}>
            <Image
              {...imageProps(item.image)}
              alt={item.image.alt}
              sizes="(max-width: 700px) 100vw, 650px"
            />
          </div>
        </>
      ) : null}
    </dialog>
  );
}
