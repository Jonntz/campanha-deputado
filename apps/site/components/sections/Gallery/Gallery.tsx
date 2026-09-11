import type { SiteContent } from "@campanha/content";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryGrid } from "./GalleryGrid";
import { VideoGrid } from "./VideoGrid";
import styles from "./Gallery.module.css";

export function Gallery({ content }: { content: SiteContent }) {
  const { gallery, ui } = content;

  return (
    <section id="galeria" className="section container">
      <Reveal>
        <SectionIntro header={gallery.header} />
      </Reveal>

      <GalleryGrid
        content={{
          photos: gallery.photos,
          labels: {
            enlarge: ui.enlargePhoto,
            lightboxLabel: ui.lightboxLabel,
            lightboxClose: ui.lightboxClose,
          },
        }}
      />

      <div className={styles.videoHeading}>
        <h3>{gallery.videosTitle}</h3>
        {ui.videosKicker ? <span>{ui.videosKicker}</span> : null}
      </div>

      <VideoGrid content={{ videos: gallery.videos, fallbackText: ui.videoFallback }} />
    </section>
  );
}
