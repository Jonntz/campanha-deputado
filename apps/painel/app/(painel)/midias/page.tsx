import { MediaLibrary } from "@/components/media/MediaLibrary";
import { createDatabase, listMedia } from "@campanha/db";

export const dynamic = "force-dynamic";

export default async function MidiasPage() {
  const items = await listMedia(createDatabase());

  return (
    <MediaLibrary
      // Sem token do Blob o upload cai no disco local, que não existe em
      // produção. É melhor avisar em cima da tela do que descobrir com a foto
      // quebrada no site.
      localStorage={!process.env.BLOB_READ_WRITE_TOKEN}
      items={items.map((item) => ({
        id: item.id,
        url: item.url,
        width: item.width,
        height: item.height,
        bytes: item.bytes,
        defaultAlt: item.defaultAlt,
      }))}
    />
  );
}
