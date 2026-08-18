import type { SiteContent } from "@/content";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ content }: { content: SiteContent }) {
  const { identity, footer } = content;

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        {/* O espaço vai dentro do template para o texto e o <span> ficarem em
            nós adjacentes distintos — é o que o HTML atual já produz. */}
        <p className={styles.brand}>
          {`${footer.brand.lead} `}
          <span>{footer.brand.accent}</span>
        </p>
        <p className={styles.note}>
          {identity.tagline} · {identity.role} · {identity.state}
        </p>
      </div>
    </footer>
  );
}
