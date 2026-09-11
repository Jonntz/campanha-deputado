"use client";

import { useId, useState, type ReactNode } from "react";
import type { ProposalItem } from "@campanha/content";
import { ChevronDownIcon } from "@/components/ui/icons";
import styles from "./Proposals.module.css";

type ProposalCardProps = {
  number: string;
  proposal: ProposalItem;
  /**
   * O ícone chega já renderizado: componentes são funções e não atravessam a
   * fronteira servidor→cliente. Como elemento, o SVG fica fora deste bundle.
   */
  icon: ReactNode;
  labels: { expand: string; collapse: string; source: string };
};

/**
 * Item do acordeão de propostas, no padrão de disclosure do WAI-ARIA: o botão
 * fica dentro do título, e o painel é ligado a ele por aria-controls.
 *
 * A altura anima pela troca de `grid-template-rows` entre 0fr e 1fr, então não
 * há medição de scrollHeight nem recálculo no resize. Fechado, o painel fica
 * `inert`: sai da ordem de tabulação e da leitura, em vez de só sumir da tela.
 */
export function ProposalCard({ number, proposal, icon, labels }: ProposalCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={styles.item} data-open={open ? "true" : "false"}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={styles.number}>{number}</span>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.text}>
            <span className={styles.titleBlock}>
              <span className={styles.tag}>{proposal.tag}</span>
              <span className={styles.title}>{proposal.title}</span>
            </span>
            {proposal.summary ? (
              <span className={styles.summary}>{proposal.summary}</span>
            ) : null}
          </span>
          <span className={styles.chevron} aria-hidden="true">
            <ChevronDownIcon size={23} />
          </span>
          <span className="sr-only">{open ? labels.collapse : labels.expand}</span>
        </button>
      </h3>

      <div id={panelId} className={styles.panel} inert={!open}>
        <div className={styles.panelClip}>
          <div className={styles.content}>
            <p>{proposal.body}</p>
            {/* O rótulo carrega o espaço final para rótulo e fonte ficarem em
                nós de texto separados, como no texto literal original. */}
            <p className={styles.source}>
              {`${labels.source} `}
              {proposal.source}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
