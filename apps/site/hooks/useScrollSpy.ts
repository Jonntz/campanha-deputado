"use client";

import { useEffect, useState } from "react";

/**
 * Marca qual seção está visível, para destacar o link correspondente no menu.
 * Mesmos parâmetros do site anterior: a seção só conta como ativa quando
 * ocupa a faixa central da viewport.
 */
export function useScrollSpy(
  sectionIds: readonly string[],
  fallback: string,
): string {
  const [activeId, setActiveId] = useState(fallback);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) setActiveId(mostVisible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
