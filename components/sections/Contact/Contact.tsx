import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import {
  InstagramIcon,
  MessageCircleIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import styles from "./Contact.module.css";

export function Contact() {
  return (
    <section id="contato" className={`section ${styles.contact}`}>
      <div className={`glow ${styles.glow}`} aria-hidden="true" />

      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Contato</p>
          <h2 className="section-title">
            Fale <span className="text-gradient">Conosco</span>
          </h2>
          <p className={styles.lead}>
            Sua voz é fundamental para construirmos uma Minas melhor. Entre em
            contato e acompanhe nossas redes sociais.
          </p>
        </Reveal>

        <div className={styles.cards}>
          <Reveal>
            <a
              href={site.whatsapp.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`${styles.card} surface-card`}
            >
              <span className={styles.cardIcon}>
                <PhoneIcon size={24} />
              </span>
              <span>
                <strong>WhatsApp</strong>
                <span>{site.whatsapp.display}</span>
              </span>
            </a>
          </Reveal>

          <Reveal delay={90}>
            <a
              href={site.instagram.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`${styles.card} ${styles.cardAmber} surface-card`}
            >
              <span className={styles.cardIcon}>
                <InstagramIcon size={24} />
              </span>
              <span>
                <strong>Instagram</strong>
                <span>{site.instagram.handle}</span>
              </span>
            </a>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className={styles.actions}>
            <a
              href={site.instagram.href}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--ghost"
            >
              <InstagramIcon size={16} />
              Seguir no Instagram
            </a>
            <a
              href={site.whatsapp.href}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--primary pulse-cta"
            >
              <MessageCircleIcon size={16} />
              Conversar no WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
