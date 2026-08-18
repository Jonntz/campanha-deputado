"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NavLink } from "@/content";
import type { SplitTitle } from "@/content/types";
import { MenuIcon } from "@/components/ui/icons";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import styles from "./SiteHeader.module.css";

/**
 * Recebe só o recorte de que precisa, e não o documento inteiro: este é um
 * client component, então tudo que entra aqui é serializado no payload RSC.
 * Passar `SiteContent` completo mandaria os textos das propostas para o
 * navegador sem necessidade.
 */
export type SiteHeaderContent = {
  navAriaLabel: string;
  links: readonly NavLink[];
  brand: SplitTitle;
  ctaLabel: string;
  donationUrl: string;
  openMenuLabel: string;
  closeMenuLabel: string;
};

type SiteHeaderProps = {
  content: SiteHeaderContent;
  /** Faixa de doação: renderizada no servidor e ancorada no header fixo. */
  children?: ReactNode;
};

export function SiteHeader({ content, children }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { links } = content;

  // As âncoras vêm do registro de seções, nunca de texto editável: é o que
  // impede o scrollspy de apontar para um id que não existe no DOM.
  const sectionIds = useMemo(
    () => links.map((link) => link.href.slice(1)),
    [links],
  );
  const activeId = useScrollSpy(sectionIds, sectionIds[0] ?? "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu no Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className={styles.header}>
      <div className={styles.bar} data-scrolled={scrolled ? "true" : "false"}>
        <nav className={styles.nav} aria-label={content.navAriaLabel}>
          <div className={styles.side}>
            <button
              type="button"
              className={styles.toggle}
              aria-label={menuOpen ? content.closeMenuLabel : content.openMenuLabel}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon size={20} />
            </button>

            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={
                      link.href === `#${activeId}` ? "true" : undefined
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <a href="#inicio" className={styles.brand}>
            {content.brand.lead} <span>{content.brand.accent}</span>
          </a>

          <div className={`${styles.side} ${styles.sideEnd}`}>
            <a
              href={content.donationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={`btn btn--primary btn--sm pulse-cta ${styles.cta}`}
            >
              {content.ctaLabel}
            </a>
          </div>
        </nav>

        <div
          className={styles.mobileMenu}
          id="mobile-menu"
          data-open={menuOpen ? "true" : "false"}
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={content.donationUrl}
                target="_blank"
                rel="noreferrer noopener"
                onClick={closeMenu}
              >
                {content.ctaLabel}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {children}
    </header>
  );
}
