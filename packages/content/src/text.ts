/**
 * Micro-sintaxe de negrito usada nos textos longos.
 *
 * Mantida no lugar de markdown de propósito: um renderizador de markdown
 * exigiria sanitização e CSS para tags arbitrárias, e o ganho seria nenhum
 * para quatro parágrafos. Este parser devolve pedaços, não HTML — o site os
 * transforma em <strong> e o painel usa os mesmos pedaços na pré-visualização,
 * então os dois nunca divergem.
 */

export type TextChunk = { bold: boolean; text: string };

export function parseBold(text: string): TextChunk[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((chunk, index) => ({ bold: index % 2 === 1, text: chunk }));
}

/** Delimitador ** desemparelhado vira erro de formulário, não ** em produção. */
export function hasBalancedBold(text: string): boolean {
  return (text.match(/\*\*/g)?.length ?? 0) % 2 === 0;
}
