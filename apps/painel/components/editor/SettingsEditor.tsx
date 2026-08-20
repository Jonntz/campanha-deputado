"use client";

import type { Settings } from "@campanha/content";
import { saveSettings, type ActionResult } from "@/lib/actions";
import { useActionState, useState } from "react";
import { SplitTitleField } from "./fields";
import { Group, Repeater, Text } from "./primitives";
import { SaveBar } from "./SaveBar";

const SECTION_LABELS: Record<string, string> = {
  inicio: "Início",
  credenciais: "Credenciais",
  bio: "Biografia",
  propostas: "Propostas",
  galeria: "Galeria",
  contato: "Contato",
};

export function SettingsEditor({ initial }: { initial: Settings }) {
  const [v, setValue] = useState<Settings>(initial);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveSettings,
    null,
  );
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setValue({ ...v, [key]: value });

  return (
    <form action={formAction} className="space-y-6 pb-28">
      <input type="hidden" name="payload" value={JSON.stringify(v)} />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-[--muted]">
          Vale para o site inteiro: links, identidade, buscadores e rastreamento.
        </p>
      </header>

      <Group
        title="Links e contato"
        description="Um só lugar: o WhatsApp aparece no contato, nos botões flutuantes e no cabeçalho."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="WhatsApp — como aparece na tela"
            value={v.identity.whatsapp.display}
            onChange={(display) =>
              set("identity", {
                ...v.identity,
                whatsapp: { ...v.identity.whatsapp, display },
              })
            }
            hint="Ex.: (31) 99696-5298"
          />
          <Text
            label="WhatsApp — número do link"
            value={v.identity.whatsapp.e164}
            onChange={(e164) =>
              set("identity", {
                ...v.identity,
                whatsapp: { ...v.identity.whatsapp, e164 },
              })
            }
            hint="Só dígitos, com DDI. Ex.: 5531996965298 — vira wa.me/5531996965298"
          />
          <Text
            label="Instagram — arroba"
            value={v.identity.instagram.handle}
            onChange={(handle) =>
              set("identity", {
                ...v.identity,
                instagram: { ...v.identity.instagram, handle },
              })
            }
          />
          <Text
            label="Instagram — endereço"
            value={v.identity.instagram.url}
            onChange={(url) =>
              set("identity", {
                ...v.identity,
                instagram: { ...v.identity.instagram, url },
              })
            }
            hint="Endereço completo, começando com https://"
          />
        </div>
        <Text
          label="Link de doação"
          value={v.identity.donation.url}
          onChange={(url) => set("identity", { ...v.identity, donation: { url } })}
          hint='Destino do botão "Faça parte do projeto" e da faixa de doação.'
        />
      </Group>

      <Group title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Nome" value={v.identity.name} onChange={(name) => set("identity", { ...v.identity, name })} />
          <Text label="Cargo" value={v.identity.role} onChange={(role) => set("identity", { ...v.identity, role })} />
          <Text label="Lema" value={v.identity.tagline} onChange={(tagline) => set("identity", { ...v.identity, tagline })} />
          <Text label="Estado" value={v.identity.state} onChange={(state) => set("identity", { ...v.identity, state })} />
        </div>
        <Text
          label="Endereço do site"
          value={v.identity.url}
          onChange={(url) => set("identity", { ...v.identity, url })}
          hint="Base dos links canônicos e das imagens de compartilhamento."
        />
        <div className="space-y-2">
          <span className="text-sm text-[--muted]">Marca no cabeçalho</span>
          <SplitTitleField
            value={v.identity.brand}
            onChange={(brand) => set("identity", { ...v.identity, brand })}
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm text-[--muted]">Marca no rodapé</span>
          <SplitTitleField value={v.footer.brand} onChange={(brand) => set("footer", { brand })} />
        </div>
      </Group>

      <Group
        title="Menu"
        description="A âncora de cada item é fixa; aqui muda só o texto. Mostrar ou esconder seções é na tela de Conteúdo."
      >
        <div className="space-y-3">
          {v.nav.items.map((item, index) => (
            <Text
              key={item.sectionKey}
              label={SECTION_LABELS[item.sectionKey] ?? item.sectionKey}
              value={item.label}
              onChange={(label) =>
                set("nav", {
                  ...v.nav,
                  items: v.nav.items.map((current, i) =>
                    i === index ? { ...current, label } : current,
                  ),
                })
              }
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Botão do cabeçalho" value={v.nav.ctaLabel} onChange={(ctaLabel) => set("nav", { ...v.nav, ctaLabel })} />
          <Text label="Texto da faixa de doação" value={v.nav.ribbon.text} onChange={(text) => set("nav", { ...v.nav, ribbon: { ...v.nav.ribbon, text } })} />
          <Text label="Link da faixa de doação" value={v.nav.ribbon.linkLabel} onChange={(linkLabel) => set("nav", { ...v.nav, ribbon: { ...v.nav.ribbon, linkLabel } })} />
        </div>
      </Group>

      <Group
        title="Buscadores e compartilhamento"
        description="O que aparece no Google e ao compartilhar o link no WhatsApp ou nas redes."
      >
        <Text label="Descrição" value={v.seo.description} rows={3} onChange={(description) => set("seo", { ...v.seo, description })} />
        <Text label="Descrição ao compartilhar" value={v.seo.ogDescription} rows={3} onChange={(ogDescription) => set("seo", { ...v.seo, ogDescription })} hint="Pode ser mais direta que a de busca." />
        <Text label="Descrição para dados estruturados" value={v.seo.jsonLdDescription} rows={3} onChange={(jsonLdDescription) => set("seo", { ...v.seo, jsonLdDescription })} />
        <Repeater
          label="Palavras-chave"
          items={[...v.seo.keywords]}
          onChange={(keywords) => set("seo", { ...v.seo, keywords })}
          createItem={() => ""}
          itemLabel={(word, i) => word || `Palavra ${i + 1}`}
          renderItem={(word, update) => <Text label="Palavra" value={word} onChange={update} />}
        />
        <Text label="Cor da barra do navegador" value={v.seo.themeColor} onChange={(themeColor) => set("seo", { ...v.seo, themeColor })} hint="Hexadecimal, ex.: #12303c" />
      </Group>

      <Group
        title="Rastreamento"
        description="Deixe em branco para não carregar a tag. As variáveis de ambiente, quando definidas, têm prioridade sobre estes valores."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Google Analytics" value={v.analytics.googleTagId} onChange={(googleTagId) => set("analytics", { ...v.analytics, googleTagId })} hint="Começa com G-" />
          <Text label="Pixel da Meta" value={v.analytics.metaPixelId} onChange={(metaPixelId) => set("analytics", { ...v.analytics, metaPixelId })} hint="Só os dígitos" />
        </div>
      </Group>

      <Group
        title="Rótulos da interface"
        description="Textos de botões e descrições para leitores de tela. Mudam raramente."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["expandProposal", "Botão de expandir proposta"],
              ["collapseProposal", "Botão de recolher proposta"],
              ["proposalSource", "Prefixo da fonte"],
              ["videoFallback", "Aviso de vídeo não suportado"],
              ["skipToContent", "Pular para o conteúdo"],
              ["openMenu", "Abrir menu"],
              ["closeMenu", "Fechar menu"],
              ["previousCredential", "Credencial anterior"],
              ["nextCredential", "Próxima credencial"],
              ["enlargePhoto", "Prefixo de ampliar foto"],
              ["lightboxClose", "Fechar imagem ampliada"],
            ] as const
          ).map(([key, label]) => (
            <Text
              key={key}
              label={label}
              value={v.ui[key]}
              onChange={(next) => set("ui", { ...v.ui, [key]: next })}
            />
          ))}
        </div>
      </Group>

      <SaveBar dirty={dirty} pending={pending} state={state} />
    </form>
  );
}
