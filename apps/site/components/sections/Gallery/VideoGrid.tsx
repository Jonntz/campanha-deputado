"use client";

import { useRef } from "react";
import type { EventVideo } from "@campanha/content";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Gallery.module.css";

export type VideoGridContent = {
  videos: readonly EventVideo[];
  fallbackText: string;
};

export function VideoGrid({ content }: { content: VideoGridContent }) {
  const containerRef = useRef<HTMLDivElement>(null);

  /** Dar play em um vídeo pausa os demais. */
  const pauseOthers = (current: EventTarget) => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("video").forEach((video) => {
      if (video !== current) video.pause();
    });
  };

  return (
    <div className={styles.videos} ref={containerRef}>
      {content.videos.map((video, index) => (
        <Reveal key={video.id} delay={index * 80}>
          <figure className={styles.videoCard}>
            {/* Os vídeos têm legenda queimada na imagem; não há faixa de
                legenda separada para oferecer. */}
            <video
              controls
              preload="none"
              playsInline
              poster={video.poster}
              aria-label={video.caption}
              onPlay={(event) => pauseOthers(event.currentTarget)}
            >
              <source src={video.src} type="video/mp4" />
              {content.fallbackText}
            </video>
            <figcaption>{video.caption}</figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
