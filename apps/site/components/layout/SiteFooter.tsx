import Image from "next/image";
import type { SiteContent } from "@campanha/content";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ content }: { content: SiteContent }) {
  const { identity, footer, ui } = content;
  const fullName = [identity.name, identity.number].filter(Boolean).join(" ");

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* A arte oficial tem margem branca generosa; a caixa recorta só a
            marca, em vez de exigir uma versão da logo sem respiro. */}
        <a href="#inicio" className={styles.brand} aria-label={fullName}>
          <Image
            src="/assets/logo-oficial-04.webp"
            alt={`${fullName}, ${identity.role}`}
            width={1081}
            height={1350}
            sizes="276px"
          />
        </a>

        <div className={styles.copy}>
          {footer.tagline ? <strong>{footer.tagline}</strong> : null}
          <p>{fullName}</p>
          <Image
            className={styles.party}
            src="/assets/logo-novo.webp"
            alt="NOVO"
            width={300}
            height={66}
            sizes="90px"
          />
          {/* Aviso e CNPJ são exigência da legislação eleitoral para
              propaganda de campanha — não é enfeite de rodapé. */}
          {footer.legal || footer.cnpj ? (
            <p className={styles.legal}>
              {footer.legal}
              {footer.legal && footer.cnpj ? <br /> : null}
              {footer.cnpj ? `CNPJ: ${footer.cnpj}` : null}
            </p>
          ) : null}
        </div>

        {ui.backToTop ? (
          <a href="#inicio" className={styles.backTop}>
            {ui.backToTop}
            <ArrowUpRightIcon size={18} />
          </a>
        ) : null}
      </div>
    </footer>
  );
}
