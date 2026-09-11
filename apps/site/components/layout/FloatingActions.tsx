import type { SiteContent } from "@campanha/content";
import { whatsappHref } from "@campanha/content";
import { WhatsAppIcon } from "@/components/ui/icons";
import styles from "./FloatingActions.module.css";

/**
 * Atalho fixo para o WhatsApp. O Instagram deixou de ter botão flutuante no
 * layout novo: o link dele fica no contato, e dois círculos disputando o canto
 * da tela com o widget do VLibras poluíam a leitura no celular.
 */
export function FloatingActions({ content }: { content: SiteContent }) {
  return (
    <a
      href={whatsappHref(content)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={content.contact.whatsappActionLabel}
      className={styles.whatsapp}
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
