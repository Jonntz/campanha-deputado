"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/conteudo", label: "Conteúdo" },
  { href: "/midias", label: "Mídias" },
  { href: "/configuracoes", label: "Configurações" },
  { href: "/historico", label: "Histórico" },
  { href: "/usuarios", label: "Editores" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        // Marca também as subtelas: /conteudo/bio mantém "Conteúdo" ativo.
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="navlink"
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
