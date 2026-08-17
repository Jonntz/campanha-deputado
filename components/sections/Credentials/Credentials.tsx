"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { credentials } from "@/content/credentials";
import { Reveal } from "@/components/ui/Reveal";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import styles from "./Credentials.module.css";

const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD = 50;

export function Credentials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((step: number) => {
    setIndex((current) => (current + step + credentials.length) % credentials.length);
  }, []);

  // Depender de `index` faz o timer reiniciar a cada troca, inclusive nas
  // manuais — o slide recém-escolhido ganha o intervalo inteiro na tela.
  useEffect(() => {
    if (paused) return;
    const next = (index + 1) % credentials.length;
    const timer = window.setTimeout(() => setIndex(next), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, index]);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    setPaused(false);

    if (startX === null || endX === undefined) return;
    const delta = startX - endX;
    if (delta > SWIPE_THRESHOLD) go(1);
    if (delta < -SWIPE_THRESHOLD) go(-1);
  };

  const slide = credentials[index];
  if (!slide) return null;

  return (
    <section
      className={`${styles.section} section--ink`}
      aria-label="Trajetória e credenciais"
    >
      <div className="wrap">
        <Reveal>
          <div
            className={`${styles.carousel} surface-card`}
            aria-roledescription="carrossel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              aria-label="Credencial anterior"
              onClick={() => go(-1)}
            >
              <ChevronLeftIcon size={20} />
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              aria-label="Próxima credencial"
              onClick={() => go(1)}
            >
              <ChevronRightIcon size={20} />
            </button>

            <div className={styles.slides}>
              {/* A key por slide reexecuta a animação de entrada a cada troca. */}
              <div className={styles.slide} key={slide.id}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  style={{ objectPosition: slide.objectPosition }}
                  sizes="7rem"
                  placeholder="blur"
                />
                <h3>{slide.title}</h3>
                <p>{slide.text}</p>
              </div>
            </div>

            <div className={styles.dots} role="tablist" aria-label="Credenciais">
              {credentials.map((credential, i) => (
                <button
                  key={credential.id}
                  type="button"
                  role="tab"
                  aria-label={`Ir para ${credential.title}`}
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
