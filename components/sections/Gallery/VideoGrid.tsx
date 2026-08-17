"use client";

import { useRef } from "react";
import { videos } from "@/content/videos";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Gallery.module.css";

export function VideoGrid() {
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
    <div className={styles.videosGrid} ref={containerRef}>
      {videos.map((video, index) => (
        <Reveal key={video.id} delay={index * 80}>
          <figure className={`${styles.videoCard} surface-card`}>
            <video
              controls
              preload="none"
              playsInline
              poster={video.poster}
              onPlay={(event) => pauseOthers(event.currentTarget)}
            >
              <source src={video.src} type="video/mp4" />
              Seu navegador não suporta vídeo em HTML5.
            </video>
            <figcaption>{video.caption}</figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
