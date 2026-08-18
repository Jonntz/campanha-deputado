import type { SectionKey, Settings, SectionPayloads } from "@campanha/content";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Esquema do conteúdo e da operação do painel.
 *
 * `locale` já entra na chave primária de `sections` e `settings`, mesmo com um
 * idioma só: é o gancho mais barato possível para uma segunda língua depois —
 * vira um INSERT, e não uma migração.
 *
 * `schemaVersion` permite que uma mudança de formato de payload seja tratada
 * em código (`migratePayload`), sem migração de banco.
 */

const DEFAULT_LOCALE = "pt-BR";

export const sections = sqliteTable(
  "sections",
  {
    locale: text("locale").notNull().default(DEFAULT_LOCALE),
    key: text("key").$type<SectionKey>().notNull(),
    /** Ordem na página. */
    position: integer("position").notNull(),
    /** Se a seção é renderizada. `inicio` não pode ser ocultada. */
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    schemaVersion: integer("schema_version").notNull().default(1),
    draftJson: text("draft_json", { mode: "json" })
      .$type<SectionPayloads[SectionKey]>()
      .notNull(),
    /** Null enquanto a seção nunca foi publicada. */
    publishedJson: text("published_json", { mode: "json" }).$type<
      SectionPayloads[SectionKey]
    >(),
    draftUpdatedAt: integer("draft_updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    updatedBy: text("updated_by"),
  },
  (t) => [primaryKey({ columns: [t.locale, t.key] })],
);

/** O que vale para a página toda: identidade, SEO, navegação, rodapé, rótulos. */
export const settings = sqliteTable("settings", {
  locale: text("locale").primaryKey().default(DEFAULT_LOCALE),
  schemaVersion: integer("schema_version").notNull().default(1),
  draftJson: text("draft_json", { mode: "json" }).$type<Settings>().notNull(),
  publishedJson: text("published_json", { mode: "json" }).$type<Settings>(),
  draftUpdatedAt: integer("draft_updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  updatedBy: text("updated_by"),
});

/**
 * Biblioteca de mídia.
 *
 * É tabela de verdade, e não parte do payload, porque o mesmo arquivo é usado
 * por seções diferentes e precisa de uma tela própria. O `MediaRef` gravado no
 * payload continua carregando url e dimensões desnormalizadas: assim a leitura
 * do site é uma consulta só, sem join, e cada payload se basta.
 */
export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: ["image", "video"] }).notNull(),
    url: text("url").notNull(),
    /** Caminho no armazenamento — é o que permite apagar o arquivo depois. */
    pathname: text("pathname").notNull(),
    mimeType: text("mime_type").notNull(),
    bytes: integer("bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    blurDataUrl: text("blur_data_url"),
    /** O Next dimensiona o viewBox do blur como blurWidth * 40. */
    blurWidth: integer("blur_width"),
    blurHeight: integer("blur_height"),
    /** Vídeo: aponta para a imagem de poster. */
    posterMediaId: text("poster_media_id"),
    defaultAlt: text("default_alt").notNull().default(""),
    folder: text("folder").notNull().default(""),
    /** sha256 do original — evita subir o mesmo arquivo duas vezes. */
    checksum: text("checksum"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    createdBy: text("created_by"),
  },
  (t) => [index("ix_media_checksum").on(t.checksum)],
);

/** Histórico por seção: permite restaurar uma versão anterior para o rascunho. */
export const sectionRevisions = sqliteTable(
  "section_revisions",
  {
    id: text("id").primaryKey(),
    locale: text("locale").notNull().default(DEFAULT_LOCALE),
    /** Chave da seção, ou "__settings" para a linha de configurações. */
    sectionKey: text("section_key").notNull(),
    json: text("json", { mode: "json" }).notNull(),
    kind: text("kind", { enum: ["save", "publish"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    authorId: text("author_id"),
  },
  (t) => [index("ix_revisions").on(t.locale, t.sectionKey, t.createdAt)],
);

/** Uma linha por publicação, com o resultado da revalidação do site. */
export const publishEvents = sqliteTable("publish_events", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  authorId: text("author_id"),
  /** Seções incluídas nesta publicação. */
  sectionsJson: text("sections_json", { mode: "json" }).$type<string[]>().notNull(),
  revalidateOk: integer("revalidate_ok", { mode: "boolean" }),
  revalidateError: text("revalidate_error"),
});

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    beforeJson: text("before_json", { mode: "json" }),
    afterJson: text("after_json", { mode: "json" }),
  },
  (t) => [index("ix_audit").on(t.createdAt)],
);

/**
 * Recebe envios vindos do site — inscrições, presença em evento, voluntariado.
 *
 * Uma tabela genérica em vez de três: nenhum formulário existe ainda, e criar
 * o esquema definitivo agora seria adivinhar. `kind` separa as origens.
 */
export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    payloadJson: text("payload_json", { mode: "json" }).notNull(),
    status: text("status").notNull().default("new"),
    /** Hash, não o IP: serve para limitar abuso sem guardar dado pessoal. */
    ipHash: text("ip_hash"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("ix_submissions").on(t.kind, t.createdAt)],
);
