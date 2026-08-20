import { HistoryView } from "@/components/history/HistoryView";
import { SECTION_KEYS } from "@campanha/content";
import {
  createDatabase,
  listPublishEvents,
  listRevisions,
  SETTINGS_KEY,
} from "@campanha/db";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  inicio: "Início",
  credenciais: "Credenciais",
  bio: "Biografia",
  propostas: "Propostas",
  galeria: "Galeria",
  contato: "Contato",
  [SETTINGS_KEY]: "Configurações",
};

/**
 * Formata no servidor, e não no navegador.
 *
 * `toLocaleString` roda com o fuso e o idioma de quem executa; formatar dos
 * dois lados produziria textos diferentes e o React reclamaria da divergência
 * na hidratação.
 */
const formatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ secao?: string }>;
}) {
  const { secao } = await searchParams;
  const keys = [...SECTION_KEYS, SETTINGS_KEY];
  const selected = secao && keys.includes(secao) ? secao : keys[0]!;

  const db = createDatabase();
  const [publishes, revisions] = await Promise.all([
    listPublishEvents(db),
    listRevisions(db, selected),
  ]);

  return (
    <HistoryView
      sections={keys.map((key) => ({ key, label: LABELS[key] ?? key }))}
      selected={selected}
      revisions={revisions.map((revision) => ({
        id: revision.id,
        kind: revision.kind,
        author: revision.author,
        when: formatter.format(revision.createdAt),
      }))}
      publishes={publishes.map((event) => ({
        id: event.id,
        author: event.author,
        when: formatter.format(event.createdAt),
        sections: event.sections.map((key) => LABELS[key] ?? key),
        revalidateOk: event.revalidateOk,
        revalidateError: event.revalidateError,
      }))}
    />
  );
}
