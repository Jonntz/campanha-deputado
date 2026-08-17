"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { navItems, site } from "@/content/site";
import { MenuIcon } from "@/components/ui/icons";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import styles from "./SiteHeader.module.css";

const SECTION_IDS = navItems.map((item) => item.href.slice(1));
const FIRST_SECTION = SECTION_IDS[0] ?? "";

type SiteHeaderProps = {
  /** Faixa de doação: renderizada no servidor e ancorada no header fixo. */
  children?: ReactNode;
};

export function SiteHeader({ children }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sectionIds = useMemo(() => SECTION_IDS, []);
  const activeId = useScrollSpy(sectionIds, FIRST_SECTION);

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
        <nav className={styles.nav} aria-label="Navegação principal">
          <div className={styles.side}>
            <button
              type="button"
              className={styles.toggle}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon size={20} />
            </button>

            <ul className={styles.links}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={
                      item.href === `#${activeId}` ? "true" : undefined
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <a href="#inicio" className={styles.brand}>
            {site.brand.lead} <span>{site.brand.accent}</span>
          </a>

          <div className={`${styles.side} ${styles.sideEnd}`}>
            <a
              href={site.donation.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`btn btn--primary btn--sm pulse-cta ${styles.cta}`}
            >
              Faça parte do projeto
            </a>
          </div>
        </nav>

        <div
          className={styles.mobileMenu}
          id="mobile-menu"
          data-open={menuOpen ? "true" : "false"}
        >
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={site.donation.href}
                target="_blank"
                rel="noreferrer noopener"
                onClick={closeMenu}
              >
                Faça parte do projeto
              </a>
            </li>
          </ul>
        </div>
      </div>

      {children}
    </header>
  );
}
