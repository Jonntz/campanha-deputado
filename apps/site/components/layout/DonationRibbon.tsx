import type { SiteContent } from "@campanha/content";
import { HeartHandshakeIcon } from "@/components/ui/icons";
import styles from "./DonationRibbon.module.css";

export function DonationRibbon({ content }: { content: SiteContent }) {
  const { ribbon } = content.nav;

  return (
    <div className={styles.ribbon}>
      <HeartHandshakeIcon size={16} />
      <span>{ribbon.text}</span>
      <a
        href={content.identity.donation.url}
        target="_blank"
        rel="noreferrer noopener"
      >
        {ribbon.linkLabel}
      </a>
    </div>
  );
}
