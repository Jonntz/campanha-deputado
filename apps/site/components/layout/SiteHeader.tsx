"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavLink } from "@campanha/content";
import { ArrowUpRightIcon, CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/ui/icons";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import styles from "./SiteHeader.module.css";

/**
 * Recebe só o recorte de que precisa, e não o documento inteiro: este é um
 * client component, então tudo que entra aqui é serializado no payload RSC.
 */
export type SiteHeaderContent = {
  navAriaLabel: string;
  links: readonly NavLink[];
  logoAlt: string;
  ctaLabel: string;
  donationUrl: string;
  whatsappUrl: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  menuTitle: string;
  menuWhatsapp: string;
  menuDonate: string;
};

export function SiteHeader({ content }: { content: SiteHeaderContent }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);

  const { links } = content;

  // As âncoras vêm do registro de seções, nunca de texto editável: é o que
  // impede o scrollspy de apontar para um id que não existe no DOM.
  const sectionIds = useMemo(() => links.map((link) => link.href.slice(1)), [links]);
  // Sem fallback: a abertura não está no menu, então no topo da página nenhum
  // link deve aparecer marcado — antes, o primeiro item acendia sem motivo.
  const activeId = useScrollSpy(sectionIds, "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // O menu do celular é um <dialog> modal: o navegador cuida do foco preso lá
  // dentro, do retorno do foco ao botão e do Escape. O estado só espelha isso.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const onClose = () => setMenuOpen(false);
    sheet.addEventListener("close", onClose);
    return () => sheet.removeEventListener("close", onClose);
  }, []);

  const openMenu = useCallback(() => {
    sheetRef.current?.showModal();
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => sheetRef.current?.close(), []);

  return (
    <header className={styles.header} data-scrolled={scrolled ? "true" : "false"}>
      <div className={`container ${styles.inner}`}>
        <a href="#inicio" className={styles.brand} aria-label={content.logoAlt}>
          <Image
            src="/assets/logo-matheus.webp"
            alt=""
            width={797}
            height={142}
            sizes="240px"
            preload
          />
        </a>

        <nav className={styles.nav} aria-label={content.navAriaLabel}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.href === `#${activeId}` ? "true" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          className={`button button--small ${styles.donate}`}
          href={content.donationUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content.ctaLabel}
          <ArrowUpRightIcon size={18} />
        </a>

        <button
          type="button"
          className={styles.toggle}
          aria-label={menuOpen ? content.closeMenuLabel : content.openMenuLabel}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={openMenu}
        >
          <MenuIcon size={24} />
        </button>
      </div>

      <dialog
        ref={sheetRef}
        id="mobile-menu"
        className={styles.sheet}
        aria-label={content.menuTitle}
        // Clique no fundo escurecido: o alvo é o próprio <dialog>, não um filho.
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className={styles.sheetTop}>
          <p className={styles.sheetTitle}>{content.menuTitle}</p>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={content.closeMenuLabel}
            onClick={closeMenu}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <nav className={styles.sheetNav} aria-label={content.navAriaLabel}>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
              <ArrowUpRightIcon size={20} />
            </a>
          ))}
        </nav>

        <a
          className="button"
          href={content.whatsappUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content.menuWhatsapp}
          <WhatsAppIcon size={22} />
        </a>
        <a
          className="text-link"
          href={content.donationUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content.menuDonate}
          <ArrowUpRightIcon size={18} />
        </a>
      </dialog>
    </header>
  );
}
