import { SECTION_REGISTRY, type SectionKey } from "@campanha/content";
import { createDatabase, getPendingChanges, readDraftDocument } from "@campanha/db";
import { SectionList } from "@/components/editor/SectionList";

export const dynamic = "force-dynamic";

const LABELS: Record<SectionKey, string> = {
  inicio: "Início",
  credenciais: "Credenciais",
  bio: "Biografia",
  propostas: "Propostas",
  galeria: "Galeria",
  contato: "Contato",
};

export default async function ConteudoPage() {
  const db = createDatabase();
  const [raw, pending] = await Promise.all([
    readDraftDocument(db),
    getPendingChanges(db),
  ]);

  const pendingKeys = new Set(pending.map((change) => change.key));

  const slots = (raw.layout ?? []).map((slot) => ({
    key: slot.key,
    label: LABELS[slot.key],
    visible: slot.visible,
    canHide: SECTION_REGISTRY[slot.key].canHide,
    pending: pendingKeys.has(slot.key),
  }));

  // Avisar antes de a pessoa publicar e ver a mensagem de falha.
  const faltando = [
    !process.env.SITE_URL && "SITE_URL",
    !process.env.REVALIDATE_SECRET && "REVALIDATE_SECRET",
  ].filter(Boolean) as string[];

  return (
    <SectionList
      slots={slots}
      pendingCount={pending.length}
      missingEnv={faltando}
    />
  );
}
