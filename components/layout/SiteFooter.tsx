import { site } from "@/content/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <p className={styles.brand}>
          Matheus <span>Biancardine</span>
        </p>
        <p className={styles.note}>
          {site.tagline} · {site.role} · {site.state}
        </p>
      </div>
    </footer>
  );
}
