import { site } from "@/content/site";
import { InstagramIcon, MessageCircleIcon } from "@/components/ui/icons";
import styles from "./FloatingActions.module.css";

export function FloatingActions() {
  return (
    <div className={styles.floating}>
      <a
        href={site.instagram.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Instagram"
        className={`${styles.instagram} pulse-cta`}
      >
        <InstagramIcon size={28} />
      </a>
      <a
        href={site.whatsapp.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="WhatsApp"
        className={`${styles.whatsapp} pulse-cta`}
      >
        <MessageCircleIcon size={28} />
      </a>
    </div>
  );
}
