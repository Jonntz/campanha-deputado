import { MediaLibrary } from "@/components/media/MediaLibrary";
import { createDatabase, listMedia } from "@campanha/db";

export const dynamic = "force-dynamic";

export default async function MidiasPage() {
  const items = await listMedia(createDatabase());

  return (
    <MediaLibrary
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
