"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { GalleryPhoto } from "@campanha/content";
import { imageProps } from "@/lib/media";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Gallery.module.css";

/** Duas colunas no mobile, três a partir de 768px. */
const SIZES = "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25rem";

export type GalleryGridContent = {
  photos: readonly GalleryPhoto[];
  labels: { enlarge: string; lightboxLabel: string; lightboxClose: string };
};

export function GalleryGrid({ content }: { content: GalleryGridContent }) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  const closeLightbox = useCallback(() => setSelected(null), []);
  const { photos, labels } = content;

  return (
    <>
      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <Reveal key={photo.id} delay={(index % 3) * 80}>
            <figure className={`${styles.card} surface-card`}>
              <button
                type="button"
                className={styles.trigger}
                aria-label={`${labels.enlarge} ${photo.caption}`}
                onClick={() => setSelected(photo)}
              >
                <Image
                  {...imageProps(photo.image)}
                  alt={photo.image.alt}
                  sizes={SIZES}
                />
              </button>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Lightbox
        item={
          selected
            ? { image: selected.image, caption: selected.caption }
            : null
        }
        labels={{ dialog: labels.lightboxLabel, close: labels.lightboxClose }}
        onClose={closeLightbox}
      />
    </>
  );
}
