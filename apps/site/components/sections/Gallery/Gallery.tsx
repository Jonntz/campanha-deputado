import type { SiteContent } from "@campanha/content";
import { Reveal } from "@/components/ui/Reveal";
import { PlayIcon } from "@/components/ui/icons";
import { GalleryGrid } from "./GalleryGrid";
import { VideoGrid } from "./VideoGrid";
import styles from "./Gallery.module.css";

export function Gallery({ content }: { content: SiteContent }) {
  const { gallery, ui } = content;

  return (
    <section id="galeria" className="section">
      <div className="wrap">
        <Reveal>
          <div style={{ maxWidth: "42rem" }}>
            <p className="eyebrow">{gallery.header.eyebrow}</p>
            <h2 className="section-title">
              {`${gallery.header.title.lead} `}
              <span className="text-gradient">{gallery.header.title.accent}</span>
            </h2>
            <p className="section-lead">{gallery.header.lead}</p>
          </div>
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

        <Reveal>
          <h3 className={styles.subtitle}>
            <PlayIcon size={22} />
            {gallery.videosTitle}
          </h3>
        </Reveal>

        <VideoGrid
          content={{ videos: gallery.videos, fallbackText: ui.videoFallback }}
        />
      </div>
    </section>
  );
}
