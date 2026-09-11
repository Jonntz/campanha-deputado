import type { SectionHeader } from "@campanha/content";
import styles from "./SectionIntro.module.css";

/**
 * Título de duas linhas à esquerda e texto de apoio à direita.
 *
 * As duas partes do título vêm do painel; aqui viram duas linhas. O chapéu
 * (`eyebrow`) segue no schema por compatibilidade, mas o layout atual não o
 * exibe.
 */
export function SectionIntro({
  header,
  tone = "light",
}: {
  header: SectionHeader;
  tone?: "light" | "dark";
}) {
  return (
    <div className={styles.intro} data-tone={tone}>
      <h2 className="heading">
        {header.title.lead}
        <br />
        {header.title.accent}
      </h2>
      {header.lead ? <p>{header.lead}</p> : null}
    </div>
  );
}
