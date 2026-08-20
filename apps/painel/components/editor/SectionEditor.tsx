"use client";

import type { SectionKey, SectionPayloads } from "@campanha/content";
import { IconPicker, MediaField, SectionHeaderField } from "./fields";
import { Group, Repeater, Text } from "./primitives";
import { SectionForm } from "./SectionForm";

const TITLES: Record<SectionKey, string> = {
  inicio: "Início",
  credenciais: "Credenciais",
  bio: "Biografia",
  propostas: "Propostas",
  galeria: "Galeria",
  contato: "Contato",
};

export function SectionEditor({
  sectionKey,
  payload,
}: {
  sectionKey: SectionKey;
  payload: SectionPayloads[SectionKey];
}) {
  const title = TITLES[sectionKey];

  switch (sectionKey) {
    case "inicio": {
      const initial = payload as SectionPayloads["inicio"];
      return (
        <SectionForm sectionKey={sectionKey} title={title} initial={initial}>
          {(v, set) => (
            <>
              <Group title="Chamada principal">
                <Text label="Selo" value={v.badge} onChange={(badge) => set({ ...v, badge })} />
                <Repeater
                  label="Linhas do título"
                  items={[...v.title.lines]}
                  min={1}
                  onChange={(lines) => set({ ...v, title: { ...v.title, lines } })}
                  createItem={() => ""}
                  itemLabel={(line, i) => line || `Linha ${i + 1}`}
                  renderItem={(line, update) => (
                    <Text label="Texto" value={line} onChange={update} />
                  )}
                />
                <Text
                  label="Destaque (em verde, no fim da última linha)"
                  value={v.title.accent}
                  onChange={(accent) => set({ ...v, title: { ...v.title, accent } })}
                />
                <Text label="Subtítulo" value={v.subtitle} onChange={(subtitle) => set({ ...v, subtitle })} />
                <Text
                  label="Texto"
                  value={v.body}
                  rows={5}
                  hint="Use **negrito** para destacar trechos."
                  onChange={(body) => set({ ...v, body })}
                />
              </Group>

              <Group title="Botões">
                <Repeater
                  label="Botões"
                  items={[...v.ctas]}
                  onChange={(ctas) => set({ ...v, ctas })}
                  createItem={() => ({
                    id: crypto.randomUUID().slice(0, 8),
                    label: "Novo botão",
                    target: "contato" as const,
                    icon: "heart" as const,
                    variant: "ghost" as const,
                  })}
                  itemLabel={(cta) => cta.label}
                  renderItem={(cta, update) => (
                    <Text label="Texto do botão" value={cta.label} onChange={(label) => update({ ...cta, label })} />
                  )}
                />
              </Group>

              <Group title="Foto">
                <MediaField label="Retrato" value={v.image} onChange={(image) => set({ ...v, image })} />
              </Group>
            </>
          )}
        </SectionForm>
      );
    }

    case "credenciais": {
      const initial = payload as SectionPayloads["credenciais"];
      return (
        <SectionForm sectionKey={sectionKey} title={title} initial={initial}>
          {(v, set) => (
            <Group
              title="Carrossel"
              description="Passa sozinho a cada 6,5 segundos. Precisa de pelo menos um item."
            >
              <Repeater
                label="Credenciais"
                items={[...v.items]}
                min={1}
                onChange={(items) => set({ ...v, items })}
                createItem={() => ({
                  id: crypto.randomUUID().slice(0, 8),
                  image: v.items[0]!.image,
                  title: "Nova credencial",
                  text: "",
                })}
                itemLabel={(item) => item.title}
                renderItem={(item, update) => (
                  <div className="space-y-3">
                    <Text label="Título" value={item.title} onChange={(t) => update({ ...item, title: t })} />
                    <Text label="Descrição" value={item.text} rows={3} onChange={(text) => update({ ...item, text })} />
                    <MediaField label="Foto" value={item.image} onChange={(image) => update({ ...item, image })} />
                  </div>
                )}
              />
            </Group>
          )}
        </SectionForm>
      );
    }

    case "bio": {
      const initial = payload as SectionPayloads["bio"];
      return (
        <SectionForm sectionKey={sectionKey} title={title} initial={initial}>
          {(v, set) => (
            <>
              <Group title="Cabeçalho">
                <SectionHeaderField value={v.header} onChange={(header) => set({ ...v, header })} />
              </Group>
              <Group title="Texto">
                <Repeater
                  label="Parágrafos"
                  items={[...v.paragraphs]}
                  min={1}
                  onChange={(paragraphs) => set({ ...v, paragraphs })}
                  createItem={() => ({ id: crypto.randomUUID().slice(0, 8), text: "" })}
                  itemLabel={(p, i) => p.text.slice(0, 40) || `Parágrafo ${i + 1}`}
                  renderItem={(p, update) => (
                    <Text
                      label="Parágrafo"
                      value={p.text}
                      rows={4}
                      hint="Use **negrito** para destacar trechos."
                      onChange={(text) => update({ ...p, text })}
                    />
                  )}
                />
              </Group>
              <Group title="Números em destaque">
                <Repeater
                  label="Destaques"
                  items={[...v.stats]}
                  onChange={(stats) => set({ ...v, stats })}
                  createItem={() => ({ id: crypto.randomUUID().slice(0, 8), value: "", label: "" })}
                  itemLabel={(s, i) => s.value || `Destaque ${i + 1}`}
                  renderItem={(s, update) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Text label="Número" value={s.value} onChange={(value) => update({ ...s, value })} />
                      <Text label="Legenda" value={s.label} onChange={(label) => update({ ...s, label })} />
                    </div>
                  )}
                />
              </Group>
              <Group title="Foto">
                <MediaField label="Retrato" value={v.image} onChange={(image) => set({ ...v, image })} />
              </Group>
            </>
          )}
        </SectionForm>
      );
    }

    case "propostas": {
      const initial = payload as SectionPayloads["propostas"];
      return (
        <SectionForm sectionKey={sectionKey} title={title} initial={initial}>
          {(v, set) => (
            <>
              <Group title="Cabeçalho">
                <SectionHeaderField value={v.header} onChange={(header) => set({ ...v, header })} />
              </Group>
              <Group title="Propostas">
                <Repeater
                  label="Propostas"
                  items={[...v.items]}
                  onChange={(items) => set({ ...v, items })}
                  createItem={() => ({
                    id: crypto.randomUUID().slice(0, 8),
                    tag: "Nova",
                    title: "Nova proposta",
                    body: "",
                    source: "",
                    icon: "briefcase" as const,
                  })}
                  itemLabel={(item) => item.title}
                  renderItem={(item, update) => (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Text label="Etiqueta" value={item.tag} onChange={(tag) => update({ ...item, tag })} />
                        <Text label="Fonte" value={item.source} onChange={(source) => update({ ...item, source })} />
                      </div>
                      <Text label="Título" value={item.title} onChange={(t) => update({ ...item, title: t })} />
                      <Text label="Texto" value={item.body} rows={8} onChange={(body) => update({ ...item, body })} />
                      <IconPicker value={item.icon} onChange={(icon) => update({ ...item, icon })} />
                    </div>
                  )}
                />
              </Group>
            </>
          )}
        </SectionForm>
      );
    }

    case "galeria": {
      const initial = payload as SectionPayloads["galeria"];
      return (
        <SectionForm sectionKey={sectionKey} title={title} initial={initial}>
          {(v, set) => (
            <>
              <Group title="Cabeçalho">
                <SectionHeaderField value={v.header} onChange={(header) => set({ ...v, header })} />
              </Group>
              <Group title="Fotos">
                <Repeater
                  label="Fotos"
                  items={[...v.photos]}
                  onChange={(photos) => set({ ...v, photos })}
                  createItem={() => ({
                    id: crypto.randomUUID().slice(0, 8),
                    image: v.photos[0]!.image,
                    caption: "",
                  })}
                  itemLabel={(p, i) => p.caption.slice(0, 40) || `Foto ${i + 1}`}
                  renderItem={(p, update) => (
                    <div className="space-y-3">
                      <Text label="Legenda" value={p.caption} rows={2} onChange={(caption) => update({ ...p, caption })} />
                      <MediaField label="Foto" value={p.image} onChange={(image) => update({ ...p, image })} />
                    </div>
                  )}
                />
              </Group>
              <Group title="Vídeos">
                <Text label="Título da seção de vídeos" value={v.videosTitle} onChange={(videosTitle) => set({ ...v, videosTitle })} />
                <Repeater
                  label="Vídeos"
                  items={[...v.videos]}
                  onChange={(videos) => set({ ...v, videos })}
                  createItem={() => ({ id: crypto.randomUUID().slice(0, 8), src: "", poster: "", caption: "" })}
                  itemLabel={(video, i) => video.caption.slice(0, 40) || `Vídeo ${i + 1}`}
                  renderItem={(video, update) => (
                    <div className="space-y-3">
                      <Text label="Legenda" value={video.caption} rows={2} onChange={(caption) => update({ ...video, caption })} />
                      <Text label="Arquivo do vídeo" value={video.src} onChange={(src) => update({ ...video, src })} hint="Caminho em public/, ex. /videos/evento-video-1.mp4" />
                      <Text label="Imagem de capa" value={video.poster} onChange={(poster) => update({ ...video, poster })} />
                    </div>
                  )}
                />
              </Group>
            </>
          )}
        </SectionForm>
      );
    }

    case "contato": {
      const initial = payload as SectionPayloads["contato"];
      return (
        <SectionForm sectionKey={sectionKey} title={title} initial={initial}>
          {(v, set) => (
            <>
              <Group title="Cabeçalho">
                <SectionHeaderField value={v.header} onChange={(header) => set({ ...v, header })} />
              </Group>
              <Group
                title="Rótulos"
                description="Os números e links em si ficam em Configurações."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Text label="Rótulo do WhatsApp" value={v.whatsappLabel} onChange={(x) => set({ ...v, whatsappLabel: x })} />
                  <Text label="Rótulo do Instagram" value={v.instagramLabel} onChange={(x) => set({ ...v, instagramLabel: x })} />
                  <Text label="Botão do Instagram" value={v.instagramActionLabel} onChange={(x) => set({ ...v, instagramActionLabel: x })} />
                  <Text label="Botão do WhatsApp" value={v.whatsappActionLabel} onChange={(x) => set({ ...v, whatsappActionLabel: x })} />
                </div>
              </Group>
            </>
          )}
        </SectionForm>
      );
    }
  }
}
