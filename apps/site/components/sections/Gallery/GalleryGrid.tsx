"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { GalleryPhoto } from "@campanha/content";
import { focalToObjectPosition } from "@campanha/content";
import { imageProps } from "@/lib/media";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { ExpandIcon } from "@/components/ui/icons";
import styles from "./Gallery.module.css";

/** Duas colunas no celular, três a partir de 601px. */
const SIZES = "(max-width: 600px) 50vw, (max-width: 1279px) 33vw, 400px";

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
            <button
              type="button"
              className={styles.card}
              aria-label={`${labels.enlarge} ${photo.caption}`}
              onClick={() => setSelected(photo)}
            >
              {/* A moldura é mais alta que o cartão: o corte puxa para cima,
                  onde ficam os rostos nas fotos de evento. */}
              <span className={styles.frame}>
                <Image
                  {...imageProps(photo.image)}
                  alt={photo.image.alt}
                  fill
                  sizes={SIZES}
                  style={{
                    objectFit: "cover",
                    objectPosition: focalToObjectPosition(photo.image.focal) ?? "50% 15%",
                  }}
                />
              </span>
              <span className={styles.caption}>
                {photo.caption}
                <ExpandIcon size={18} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <Lightbox
        item={selected ? { image: selected.image, caption: selected.caption } : null}
        labels={{ dialog: labels.lightboxLabel, close: labels.lightboxClose }}
        onClose={closeLightbox}
      />
    </>
  );
}
