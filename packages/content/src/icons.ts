/**
 * Nomes de ícone — só os nomes, sem React.
 *
 * O conteúdo não pode guardar uma referência de componente: funções não
 * sobrevivem a JSON nem atravessam a fronteira servidor→cliente. Guarda-se o
 * nome; `@campanha/icons` faz a resolução para o componente.
 */

export const ICON_NAMES = [
  "menu",
  "close",
  "chevron-left",
  "chevron-right",
  "chevron-down",
  "arrow-down",
  "heart",
  "heart-handshake",
  "phone",
  "instagram",
  "message-circle",
  "play",
  "briefcase",
  "graduation-cap",
  "palette",
  "sprout",
  "shield-check",
  "store",
  "landmark",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * Subconjunto oferecido no seletor de ícone das propostas. Os demais são cromo
 * da interface (setas, menu, fechar) e não fazem sentido como escolha
 * editorial — por isso o painel nunca os apresenta.
 */
export const PROPOSAL_ICON_NAMES = [
  "briefcase",
  "graduation-cap",
  "palette",
  "sprout",
  "shield-check",
  "store",
  "landmark",
] as const satisfies readonly IconName[];

export type ProposalIconName = (typeof PROPOSAL_ICON_NAMES)[number];
