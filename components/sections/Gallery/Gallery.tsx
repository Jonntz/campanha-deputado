import { Reveal } from "@/components/ui/Reveal";
import { PlayIcon } from "@/components/ui/icons";
import { GalleryGrid } from "./GalleryGrid";
import { VideoGrid } from "./VideoGrid";
import styles from "./Gallery.module.css";

export function Gallery() {
  return (
    <section id="galeria" className="section">
      <div className="wrap">
        <Reveal>
          <div style={{ maxWidth: "42rem" }}>
            <p className="eyebrow">Galeria</p>
            <h2 className="section-title">
              Galeria de <span className="text-gradient">Fotos</span>
            </h2>
            <p className="section-lead">
              Momentos do lançamento da pré-candidatura e das agendas por Minas.
            </p>
          </div>
        </Reveal>

        <GalleryGrid />

        <Reveal>
          <h3 className={styles.subtitle}>
            <PlayIcon size={22} />
            Vídeos do evento
          </h3>
        </Reveal>

        <VideoGrid />
      </div>
    </section>
  );
}
