import type { SiteContent } from "@campanha/content";
import { whatsappHref } from "@campanha/content";
import { InstagramIcon, MessageCircleIcon } from "@/components/ui/icons";
import styles from "./FloatingActions.module.css";

export function FloatingActions({ content }: { content: SiteContent }) {
  return (
    <div className={styles.floating}>
      <a
        href={content.identity.instagram.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={content.contact.instagramLabel}
        className={`${styles.instagram} pulse-cta`}
      >
        <InstagramIcon size={28} />
      </a>
      <a
        href={whatsappHref(content)}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={content.contact.whatsappLabel}
        className={`${styles.whatsapp} pulse-cta`}
      >
        <MessageCircleIcon size={28} />
      </a>
    </div>
  );
}
