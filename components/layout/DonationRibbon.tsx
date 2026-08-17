import { site } from "@/content/site";
import { HeartHandshakeIcon } from "@/components/ui/icons";
import styles from "./DonationRibbon.module.css";

export function DonationRibbon() {
  return (
    <div className={styles.ribbon}>
      <HeartHandshakeIcon size={16} />
      <span>Considere fazer uma doação!</span>
      <a href={site.donation.href} target="_blank" rel="noreferrer noopener">
        Doar
      </a>
    </div>
  );
}
