import type { SiteContent } from "@campanha/content";
import { whatsappHref } from "@campanha/content";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRightIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import styles from "./Contact.module.css";

export function Contact({ content }: { content: SiteContent }) {
  const { contact, identity } = content;
  const { title } = contact.header;

  return (
    <section id="contato" className={styles.contact}>
      <div className={`container ${styles.inner}`}>
        <Reveal>
          {/* Aqui o título é uma linha só; nas outras seções, duas. */}
          <h2 className="heading">{`${title.lead} ${title.accent}`}</h2>
          {contact.header.lead ? <p>{contact.header.lead}</p> : null}
        </Reveal>

        <Reveal delay={100}>
          <div className={styles.actions}>
            <a
              className="button button--yellow"
              href={whatsappHref(content)}
              target="_blank"
              rel="noreferrer noopener"
            >
              <WhatsAppIcon size={24} />
              {contact.whatsappActionLabel}
              <ArrowUpRightIcon size={20} />
            </a>
            <a
              className={styles.instagram}
              href={identity.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <InstagramIcon size={22} />
              {contact.instagramActionLabel}
              <ArrowUpRightIcon size={18} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
