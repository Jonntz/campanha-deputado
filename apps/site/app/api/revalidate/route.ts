import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

/**
 * Republicação sob demanda, chamada pelo painel depois de publicar.
 *
 * `revalidatePath` e não `revalidateTag`: o site tem uma rota só, então tags
 * seriam cerimônia sem ganho. Além disso, no Next 16 `revalidateTag` passou a
 * exigir um perfil de cacheLife como segundo argumento, e `updateTag` lança se
 * chamado de fora de uma Server Action.
 *
 * O segundo argumento "layout" é necessário: o title, a descrição e a imagem de
 * OG vêm do `generateMetadata` do layout, e sem ele o metadata não é refeito.
 */
export const runtime = "nodejs";

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual exige o mesmo comprimento; comparar antes já vaza o
  // tamanho, que não é segredo — o conteúdo é o que precisa de tempo constante.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    console.error("[revalidate] REVALIDATE_SECRET não configurado");
    return Response.json({ error: "não configurado" }, { status: 503 });
  }

  if (!secretMatches(request.headers.get("x-revalidate-secret") ?? "", expected)) {
    return Response.json({ error: "não autorizado" }, { status: 401 });
  }

  revalidatePath("/", "layout");

  return Response.json({ revalidated: true, at: Date.now() });
}
