import { SECTION_KEYS, type SectionKey } from "@campanha/content";
import { createDatabase, readDraftDocument } from "@campanha/db";
import { SectionEditor } from "@/components/editor/SectionEditor";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

export default async function EditarSecaoPage({
  params,
}: {
  params: Promise<{ secao: string }>;
}) {
  const { secao } = await params;
  if (!isSectionKey(secao)) notFound();

  // O editor trabalha sobre o rascunho, nunca sobre o publicado: salvar não
  // pode ter efeito no site sem alguém apertar Publicar.
  const raw = await readDraftDocument(createDatabase());
  const payload = raw.sections?.[secao];
  if (!payload) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/conteudo"
        className="text-sm text-white/50 transition hover:text-white/80"
      >
        ← Conteúdo
      </Link>
      <SectionEditor
        sectionKey={secao}
        payload={payload as Parameters<typeof SectionEditor>[0]["payload"]}
      />
    </div>
  );
}
