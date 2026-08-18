import type { SiteContent } from "@/content";
import { whatsappHref } from "@/content";
import { Reveal } from "@/components/ui/Reveal";
import {
  InstagramIcon,
  MessageCircleIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import styles from "./Contact.module.css";

export function Contact({ content }: { content: SiteContent }) {
  const { contact, identity } = content;
  const whatsapp = whatsappHref(content);

  return (
    <section id="contato" className={`section ${styles.contact}`}>
      <div className={`glow ${styles.glow}`} aria-hidden="true" />

      <div className="wrap">
        <Reveal>
          <p className="eyebrow">{contact.header.eyebrow}</p>
          <h2 className="section-title">
            {`${contact.header.title.lead} `}
            <span className="text-gradient">{contact.header.title.accent}</span>
          </h2>
          {/* Lead próprio: este é centralizado, ao contrário do .section-lead
              global usado em Propostas e Galeria. */}
          <p className={styles.lead}>{contact.header.lead}</p>
        </Reveal>

        <div className={styles.cards}>
          <Reveal>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className={`${styles.card} surface-card`}
            >
              <span className={styles.cardIcon}>
                <PhoneIcon size={24} />
              </span>
              <span>
                <strong>{contact.whatsappLabel}</strong>
                <span>{identity.whatsapp.display}</span>
              </span>
            </a>
          </Reveal>

          <Reveal delay={90}>
            <a
              href={identity.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
              className={`${styles.card} ${styles.cardAmber} surface-card`}
            >
              <span className={styles.cardIcon}>
                <InstagramIcon size={24} />
              </span>
              <span>
                <strong>{contact.instagramLabel}</strong>
                <span>{identity.instagram.handle}</span>
              </span>
            </a>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className={styles.actions}>
            <a
              href={identity.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--ghost"
            >
              <InstagramIcon size={16} />
              {contact.instagramActionLabel}
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--primary pulse-cta"
            >
              <MessageCircleIcon size={16} />
              {contact.whatsappActionLabel}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
