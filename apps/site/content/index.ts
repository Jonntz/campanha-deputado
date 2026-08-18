import { siteContentSchema, type SiteContent } from "@campanha/content";
import { fallbackContent } from "./fallback";

export { fallbackContent };

/**
 * Ponto único de leitura do conteúdo.
 *
 * Hoje devolve o documento commitado. Quando o banco entrar, passa a consultar
 * a versão publicada e a cair neste mesmo documento em caso de falha — por
 * isso já é async: os componentes não mudam quando isso acontecer.
 *
 * A validação só roda em desenvolvimento. `satisfies SiteContent` já garante a
 * estrutura no typecheck; o Zod acrescenta o que o tipo não expressa (tamanhos
 * máximos, formato da cor, `**negrito**` emparelhado). Em produção ela não roda
 * sobre o padrão de propósito: este documento é a rede de segurança para quando
 * o banco falhar, e não pode ser capaz de lançar.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (process.env.NODE_ENV === "development") {
    const result = siteContentSchema.safeParse(fallbackContent);
    if (!result.success) {
      console.error(
        "[content] conteúdo padrão fora do schema:",
        result.error.issues,
      );
    }
  }

  return fallbackContent;
}
