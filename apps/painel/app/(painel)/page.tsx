import { SECTION_KEYS } from "@campanha/content";
import { createDatabase, readDraftDocument } from "@campanha/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const raw = await readDraftDocument(createDatabase());
  const order = raw.layout ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conteúdo do site</h1>
        <p className="mt-1 text-sm text-white/60">
          {order.length} de {SECTION_KEYS.length} seções carregadas do banco.
        </p>
      </div>

      <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
        {order.map((slot) => (
          <li
            key={slot.key}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="font-medium">{slot.key}</span>
            <span className="text-white/50">
              {slot.visible ? "visível" : "oculta"}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-white/40">
        As telas de edição chegam na próxima etapa.
      </p>
    </div>
  );
}
