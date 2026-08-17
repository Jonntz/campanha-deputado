"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Proposal } from "@/content/proposals";
import { ChevronDownIcon } from "@/components/ui/icons";
import styles from "./Proposals.module.css";

const RESIZE_DEBOUNCE_MS = 150;

type ProposalCardProps = {
  proposal: Omit<Proposal, "Icon">;
  /**
   * O ícone chega já renderizado: componentes são funções e não atravessam a
   * fronteira servidor→cliente. Como elemento, o SVG fica fora deste bundle.
   */
  icon: ReactNode;
};

export function ProposalCard({ proposal, icon }: ProposalCardProps) {
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
        <span className={styles.source}>Fonte: {proposal.source}</span>
      </div>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={textId}
        onClick={toggle}
      >
        <span>{expanded ? "Esconder" : "Ver mais"}</span>
        <ChevronDownIcon size={16} />
      </button>
    </article>
  );
}
