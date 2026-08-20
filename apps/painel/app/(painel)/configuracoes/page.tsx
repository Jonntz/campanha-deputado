import { SettingsEditor } from "@/components/editor/SettingsEditor";
import { settingsSchema } from "@campanha/content";
import { createDatabase, readDraftDocument } from "@campanha/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const raw = await readDraftDocument(createDatabase());

  // Valida na leitura, como o site faz: o editor trabalha sobre um objeto com
  // forma garantida, e uma linha corrompida vira 404 em vez de tela quebrada.
  const settings = settingsSchema.safeParse(raw.settings);
  if (!settings.success) notFound();

  return <SettingsEditor initial={settings.data} />;
}
