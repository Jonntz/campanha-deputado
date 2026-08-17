"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type RevealProps = {
  children: ReactNode;
  /** Escalona a entrada de itens vizinhos de uma grade. */
  delay?: number;
  className?: string;
};

/**
 * Anima a entrada do conteúdo quando ele chega à viewport.
 *
 * Recebe `children` como prop, então tudo que está dentro continua sendo
 * renderizado no servidor — só este invólucro vai para o bundle do cliente.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [intersected, setIntersected] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Com movimento reduzido o conteúdo já nasce visível: valor derivado, sem
  // um setState extra só para isso.
  const visible = intersected || reducedMotion;

  useEffect(() => {
    if (reducedMotion) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className ? `reveal ${className}` : "reveal"}
    >
      {children}
    </div>
  );
}
