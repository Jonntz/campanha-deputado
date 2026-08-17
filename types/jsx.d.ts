import "react";

/**
 * O plugin do VLibras identifica seus containers por atributos HTML próprios
 * (`vw`, `vw-access-button`, `vw-plugin-wrapper`). Como não são atributos
 * padrão, precisam ser declarados para o JSX aceitá-los.
 */
declare module "react" {
  interface HTMLAttributes<T> {
    vw?: string;
    "vw-access-button"?: string;
    "vw-plugin-wrapper"?: string;
  }
}
