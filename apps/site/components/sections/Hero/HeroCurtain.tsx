import styles from "./Hero.module.css";

/**
 * As duas metades que cobrem o retrato e deslizam para fora na abertura.
 * A animação é 100% CSS (delay de 1.2s, duração de 2s), então não precisa de
 * JavaScript nem vira componente de cliente.
 */
export function HeroCurtain() {
  return (
    <>
      <div
        className={`${styles.curtain} ${styles.curtainLeft}`}
        aria-hidden="true"
      >
        {/* Bandeira do Brasil */}
        <svg viewBox="0 0 720 504" preserveAspectRatio="none">
          <rect width="720" height="504" fill="#009c3b" />
          <path d="M360 42 682 252 360 462 38 252Z" fill="#ffdf00" />
          <circle cx="360" cy="252" r="94" fill="#002776" />
          <path
            d="M266 232c70-18 142-6 188 30-2 10-5 19-9 28-44-38-116-51-186-32 2-9 4-18 7-26Z"
            fill="#fff"
          />
        </svg>
      </div>

      <div
        className={`${styles.curtain} ${styles.curtainRight}`}
        aria-hidden="true"
      >
        {/* Bandeira de Minas Gerais */}
        <svg viewBox="0 0 720 504" preserveAspectRatio="none">
          <rect width="720" height="504" fill="#fff" />
          <path d="M360 96 566 424H154Z" fill="#c8102e" />
        </svg>
      </div>
    </>
  );
}
