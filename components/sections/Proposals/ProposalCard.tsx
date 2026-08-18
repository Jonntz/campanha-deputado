"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProposalItem } from "@/content/types";
import { ChevronDownIcon } from "@/components/ui/icons";
import styles from "./Proposals.module.css";

const RESIZE_DEBOUNCE_MS = 150;

type ProposalCardProps = {
  proposal: ProposalItem;
  /**
   * O ícone chega já renderizado: componentes são funções e não atravessam a
   * fronteira servidor→cliente. Como elemento, o SVG fica fora deste bundle.
   */
  icon: ReactNode;
  labels: { expand: string; collapse: string; source: string };
};

export function ProposalCard({ proposal, icon, labels }: ProposalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const textId = useId();

  /**
   * A altura expandida vem do conteúdo real, então o texto nunca fica cortado.
   * Ao recolher, limpamos o inline e o max-height do CSS volta a valer.
   */
  const toggle = useCallback(() => {
    const next = !expanded;
    const element = textRef.current;
    if (element) {
      element.style.maxHeight = next ? `${element.scrollHeight}px` : "";
    }
    setExpanded(next);
  }, [expanded]);

  // Ao mudar a largura da tela o texto reflui e a altura precisa ser refeita.
  useEffect(() => {
    if (!expanded) return;

    let timer: number;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const element = textRef.current;
        if (!element) return;
        element.style.maxHeight = "none";
        element.style.maxHeight = `${element.scrollHeight}px`;
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [expanded]);

  return (
    <article
      className={`${styles.card} surface-card`}
      data-expanded={expanded ? "true" : "false"}
    >
      <span className={styles.icon}>{icon}</span>

      <span className={styles.tag}>{proposal.tag}</span>
      <h3>{proposal.title}</h3>

      <div className={styles.text} ref={textRef} id={textId}>
        <p>{proposal.body}</p>
        {/* O rótulo carrega o espaço final para o HTML sair idêntico ao
            texto literal que havia aqui antes. */}
        <span className={styles.source}>
          {`${labels.source} `}
          {proposal.source}
        </span>
      </div>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={textId}
        onClick={toggle}
      >
        <span>{expanded ? labels.collapse : labels.expand}</span>
        <ChevronDownIcon size={16} />
      </button>
    </article>
  );
}
