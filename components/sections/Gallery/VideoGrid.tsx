"use client";

import { useRef } from "react";
import type { EventVideo } from "@/content/types";
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
    <div className={styles.videosGrid} ref={containerRef}>
      {content.videos.map((video, index) => (
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
              {content.fallbackText}
            </video>
            <figcaption>{video.caption}</figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
