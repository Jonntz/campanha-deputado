"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { photos, type Photo } from "@/content/gallery";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Gallery.module.css";

/** Duas colunas no mobile, três a partir de 768px. */
const SIZES = "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25rem";

export function GalleryGrid() {
  const [selected, setSelected] = useState<Photo | null>(null);
  const closeLightbox = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <Reveal key={photo.id} delay={(index % 3) * 80}>
            <figure className={`${styles.card} surface-card`}>
              <button
                type="button"
                className={styles.trigger}
                aria-label={`Ampliar foto: ${photo.caption}`}
                onClick={() => setSelected(photo)}
              >
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  sizes={SIZES}
                  placeholder="blur"
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
            ? {
                image: selected.image,
                alt: selected.alt,
                caption: selected.caption,
              }
            : null
        }
        onClose={closeLightbox}
      />
    </>
  );
}
