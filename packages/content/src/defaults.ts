import type { MediaRef, SiteContent } from "./schema";
import { MEDIA, type MediaKey } from "./media-manifest";

/**
 * Monta um MediaRef a partir do manifesto gerado.
 *
 * `alt` e o ponto focal ficam aqui, e não no manifesto, porque são conteúdo:
 * a mesma foto pode ter descrição e enquadramento diferentes conforme o uso.
 */
function media(
  key: MediaKey,
  alt: string,
  focal?: MediaRef["focal"],
  focalLg?: MediaRef["focal"],
): MediaRef {
  return {
    mediaId: null,
    ...MEDIA[key],
    alt,
    ...(focal ? { focal } : {}),
    ...(focalLg ? { focalLg } : {}),
  };
}

/**
 * Retrato recortado da abertura, fora do manifesto de propósito.
 *
 * Não tem placeholder de blur: o fundo é transparente, e um blur achataria o
 * recorte num retângulo borrado sobre o amarelo até a imagem carregar — pior
 * do que simplesmente aparecer.
 */
const PORTRAIT: MediaRef = {
  mediaId: null,
  url: "/assets/matheus-foto-interno.webp",
  width: 1408,
  height: 3058,
  alt: "Matheus Biancardine, de camiseta verde Minas Gerais, sorrindo",
};

/**
 * Conteúdo padrão do site, versionado junto do código.
 *
 * Cumpre três papéis: é o que o seed grava no banco numa carga inicial, é a
 * rede de segurança do site — se o Turso estiver fora do ar, a página sobe com
 * este conteúdo em vez de quebrar — e é a fonte do script que importa os
 * textos do layout novo como rascunho. Precisa continuar completo e válido.
 *
 * Os campos que o layout atual não exibe (selo e subtítulo do hero, números
 * da bio, faixa de doação, marca em texto do rodapé) continuam aqui porque o
 * schema os mantém por compatibilidade com o conteúdo já publicado.
 */
export const defaultContent = {
  identity: {
    name: "Matheus Biancardine",
    role: "Candidato a Deputado Federal",
    tagline: "Juventude e coragem. Por Minas.",
    state: "Minas Gerais",
    url: "https://www.matheusbiancardine.com.br",
    brand: { lead: "Minas", accent: "é o mundo" },
    whatsapp: { display: "(31) 99696-5298", e164: "5531996965298" },
    instagram: {
      handle: "@matheus.biancardine",
      url: "https://instagram.com/matheus.biancardine",
    },
    donation: { url: "https://queroapoiar.com.br/matheusbiancardine" },
    number: "3055",
  },

  seo: {
    description:
      "Juventude, preparo e coragem a serviço de Minas. Conheça Matheus Biancardine 3055, sua trajetória e suas propostas para deputado federal.",
    ogDescription:
      "Juventude e coragem. Por Minas. Conheça Matheus Biancardine 3055, candidato a deputado federal.",
    jsonLdDescription:
      "Matheus Biancardine é candidato a deputado federal por Minas Gerais, número 3055, com foco em segurança, liberdade e oportunidades para a juventude.",
    keywords: [
      "Matheus Biancardine",
      "3055",
      "Deputado Federal",
      "Minas Gerais",
      "Juventude",
      "Segurança Pública",
    ],
    themeColor: "#f7f4ea",
    ogImage: { url: "/og-image.jpg", width: 1200, height: 630 },
  },

  nav: {
    ariaLabel: "Navegação principal",
    items: [
      // A marca no cabeçalho já leva ao início; o item fica oculto no menu.
      { sectionKey: "inicio", label: "Início", visible: false },
      { sectionKey: "bio", label: "Quem sou", visible: true },
      { sectionKey: "propostas", label: "Propostas", visible: true },
      { sectionKey: "galeria", label: "Por Minas", visible: true },
      { sectionKey: "contato", label: "Contato", visible: true },
    ],
    ctaLabel: "Quero apoiar",
    ribbon: { text: "Considere fazer uma doação!", linkLabel: "Doar" },
  },

  hero: {
    badge: "Minas Gerais · 2026",
    title: { lines: ["Juventude e", "coragem."], accent: "Por Minas." },
    subtitle: "Candidato a Deputado Federal por Minas Gerais",
    body: "Sou Matheus Biancardine. Com fé, preparo e coragem, quero levar a força de Minas para Brasília.",
    ctas: [
      {
        id: "whatsapp",
        label: "Vamos juntos",
        target: "contato",
        link: "whatsapp",
        icon: "whatsapp",
        variant: "primary",
      },
      {
        id: "propostas",
        label: "Minhas propostas",
        target: "propostas",
        icon: "arrow-down",
        variant: "ghost",
      },
    ],
    image: PORTRAIT,
  },

  credentials: {
    ariaLabel: "Trajetória e credenciais",
    items: [
      {
        id: "assessor",
        image: media("simoes", "Matheus Biancardine ao lado do governador Mateus Simões", { x: 50, y: 30 }),
        title: "Assessor do Governador Mateus Simões",
        text: "Atuação no Governo de Minas Gerais. Articulação com prefeituras e Assembleia Legislativa.",
      },
      {
        id: "juventude-novo",
        image: media("cred-partido-novo", "Matheus Biancardine discursando em evento do Partido NOVO", { x: 58, y: 22 }),
        title: "Fundador da Juventude do Partido Novo",
        text: "Criou e liderou o movimento que formou a nova geração liberal de Minas Gerais.",
      },
      {
        id: "diretor-juventude",
        image: media("cred-diretor-juventude", "Matheus Biancardine ao lado do governador Romeu Zema", { x: 45, y: 20 }),
        title: "Diretor de Políticas para Juventude",
        text: "Na gestão Romeu Zema. Responsável por programas que impactam 4,2 milhões de jovens mineiros.",
      },
      {
        id: "medalha-jk",
        image: media("cred-medalha-jk", "Matheus Biancardine na cerimônia da Medalha Juscelino Kubitschek", { x: 28, y: 32 }),
        title: "Medalha Juscelino Kubitschek",
        text: "Maior honraria do Estado de Minas Gerais. Reconhecimento por serviços prestados a MG.",
      },
    ],
  },

  bio: {
    header: {
      eyebrow: "Quem sou",
      title: { lead: "Minas é a minha casa.", accent: "E o meu propósito." },
    },
    image: media("quem-matheus", "Matheus conversando com o público em um encontro", { x: 50, y: 10 }),
    paragraphs: [
      {
        id: "origem",
        text: "Vim para Minas com a minha família em busca de segurança e oportunidades. Aqui, construí minha história e encontrei o que me move: **trabalhar pela nossa gente.**",
      },
      {
        id: "trajetoria",
        text: "Sou católico, estudante de Direito e Ciência Política. Fundei a Juventude do NOVO, presidi o Conselho Estadual da Juventude e trabalhei com políticas públicas no Governo de Minas.",
      },
      {
        id: "objetivo",
        text: "Agora, como candidato a deputado federal, quero levar essa experiência para Brasília. **Mais segurança, liberdade e oportunidades para quem está começando.**",
      },
    ],
    stats: [
      { id: "jovens", value: "4,2 mi", label: "jovens mineiros impactados" },
      { id: "presidencia", value: "1º", label: "presidente da Juventude NOVO" },
      { id: "medalha", value: "JK", label: "Medalha Juscelino Kubitschek" },
    ],
  },

  proposals: {
    header: {
      eyebrow: "Propostas",
      title: { lead: "O futuro de Minas", accent: "se faz agora." },
      lead: "Sete propostas para abrir caminhos e cuidar do que importa. Toque em cada uma para conhecer melhor.",
    },
    items: [
      {
        id: "juventude",
        tag: "Juventude",
        title: "Rota Nacional do Primeiro Trabalho",
        summary: "Uma ponte entre aprender uma profissão e conseguir a primeira oportunidade.",
        body: "Quero conectar escolas, cursos técnicos, Sistema S e empresas para facilitar o acesso a cursos gratuitos, estágios, aprendizagem e ao primeiro emprego. A proposta reúne orientação profissional, formação digital e acompanhamento de quem entra no mercado, com prioridade para jovens que estão fora da escola e do trabalho.",
        source: "Planalto",
        icon: "briefcase",
      },
      {
        id: "educacao",
        tag: "Educação",
        title: "Ensino Médio com Futuro",
        summary: "Formação técnica, escola de qualidade e mais caminhos para escolher.",
        body: "Defendo ampliar o ensino técnico integrado ao ensino médio, sem abrir mão das matérias básicas. Com laboratórios, professores preparados, educação financeira e competências digitais, a escola pode se aproximar das oportunidades de cada região e ajudar o estudante a construir seu futuro.",
        source: "Serviços e Informações do Brasil",
        icon: "graduation-cap",
      },
      {
        id: "cultura",
        tag: "Cultura",
        title: "Rede de Economia Criativa",
        summary: "Transformar talento em renda, negócio e oportunidade perto de casa.",
        body: "A ideia é usar espaços que já existem, como bibliotecas, centros culturais e escolas técnicas, para apoiar quem vive de arte, música, audiovisual, design, games, moda e artesanato. Formação em gestão, acesso a crédito e menos dificuldade para formalizar e vender, com seleção transparente e resultados acompanhados.",
        source: "Serviços e Informações do Brasil",
        icon: "palette",
      },
      {
        id: "jovem-do-campo",
        tag: "Jovem do Campo",
        title: "Sucessão Rural 4.0",
        summary: "Tecnologia e apoio para quem quer construir seu futuro no campo.",
        body: "Quero simplificar o caminho para o jovem acessar assistência técnica, capacitação e crédito rural, incluindo o Pronaf Jovem. Conectividade, pequenas máquinas e tecnologia de gestão ajudam a produzir melhor. A proposta também apoia a sucessão familiar, o cooperativismo e o acesso a mercados.",
        source: "Planalto",
        icon: "sprout",
      },
      {
        id: "seguranca",
        tag: "Segurança",
        title: "Estratégia Nacional contra Facções",
        summary: "Combater o crime organizado, atingir seu dinheiro e proteger as famílias.",
        body: "Defendo integrar as forças de segurança e os órgãos de investigação para desarticular lideranças, rastrear o dinheiro do crime e combater empresas de fachada. Também quero controle das comunicações nos presídios e penas mais duras para chefes, financiadores e recrutadores de menores, com investigação e controle judicial.",
        source: "Senado Federal",
        icon: "shield-check",
      },
      {
        id: "empreendedorismo",
        tag: "Empreendedorismo",
        title: "Empresa Pequena, Caminho Livre",
        summary: "Menos burocracia para abrir, manter e fazer um pequeno negócio crescer.",
        body: "Minha proposta é simplificar licenças de atividades de baixo risco, reunir cadastros e acabar com exigências repetidas. Nos primeiros 12 meses, erros formais que podem ser corrigidos devem receber orientação antes da multa, sem tolerância a fraude ou riscos. Crédito, capacitação e acesso às compras públicas completam esse caminho.",
        source: "Serviços e Informações do Brasil",
        icon: "store",
      },
      {
        id: "projeto-nacional",
        tag: "Projeto Nacional",
        title: "Plano de Desenvolvimento da Juventude",
        summary: "Metas claras para a juventude, com resultado que dá para acompanhar.",
        body: "Um plano de dez anos para conectar educação, trabalho, segurança, cultura, saúde e participação. Usando a estrutura que já existe, quero facilitar o acesso aos serviços e vincular recursos a metas públicas, prestação de contas e avaliação independente. Política para a juventude precisa chegar à vida real.",
        source: "Serviços e Informações do Brasil",
        icon: "users-round",
      },
    ],
  },

  gallery: {
    header: {
      eyebrow: "Por Minas",
      title: { lead: "É junto da gente", accent: "que tudo começa." },
      lead: "Conversas, encontros e histórias que fazem parte da minha caminhada por Minas.",
    },
    photos: [
      {
        id: "evento-01",
        image: media("evento-01", "Matheus e Mateus Simões juntos em um encontro do NOVO"),
        caption: "Encontro com Mateus Simões",
      },
      {
        id: "evento-02",
        image: media("evento-02", "Matheus e Mateus Simões conversando com uma entrevistadora"),
        caption: "Conversa com a imprensa",
      },
      {
        id: "evento-03",
        image: media("evento-03", "Matheus sendo entrevistado durante um encontro"),
        caption: "Ideias em conversa",
      },
      {
        id: "evento-04",
        image: media("evento-04", "Matheus escrevendo seu nome em um mapa de Minas Gerais"),
        caption: "Uma caminhada por Minas",
      },
      {
        id: "evento-05",
        image: media("evento-05", "Matheus ouvindo dois jovens durante um encontro"),
        caption: "Ouvindo a juventude",
      },
      {
        id: "evento-06",
        image: media("evento-06", "Matheus abraçando e conversando com um participante de um encontro"),
        caption: "Perto da nossa gente",
      },
    ],
    videosTitle: "Um pouco desses encontros",
    videos: [
      {
        id: "video-1",
        src: "/videos/evento-video-1.mp4",
        poster: "/videos/evento-video-1.jpg",
        caption: "Conversa com Mateus Simões",
      },
      {
        id: "video-2",
        src: "/videos/evento-video-2.mp4",
        poster: "/videos/evento-video-2.jpg",
        caption: "Vozes dos nossos encontros",
      },
      {
        id: "video-3",
        src: "/videos/evento-video-3.mp4",
        poster: "/videos/evento-video-3.jpg",
        caption: "Ideias para Minas",
      },
      {
        id: "video-4",
        src: "/videos/evento-video-4.mp4",
        poster: "/videos/evento-video-4.jpg",
        caption: "Quem caminha com a gente",
      },
    ],
  },

  contact: {
    header: {
      eyebrow: "Contato",
      title: { lead: "Bora", accent: "conversar?" },
      lead: "Tem uma ideia, uma pergunta ou quer caminhar com a gente? Me chama. Quero ouvir você.",
    },
    whatsappLabel: "WhatsApp",
    instagramLabel: "Instagram",
    instagramActionLabel: "Acompanhe no Instagram",
    whatsappActionLabel: "Fale comigo no WhatsApp",
  },

  footer: {
    brand: { lead: "Matheus", accent: "Biancardine" },
    tagline: "Juntos por Minas.",
    legal: "Propaganda eleitoral",
    cnpj: "68.306.593/0001-52",
  },

  analytics: {
    googleTagId: "G-JXEBVJVR0M",
    metaPixelId: "",
  },

  ui: {
    skipToContent: "Pular para o conteúdo principal",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    previousCredential: "Credencial anterior",
    nextCredential: "Próxima credencial",
    credentialDots: "Credenciais",
    goToCredential: "Ir para",
    expandProposal: "Ver mais",
    collapseProposal: "Esconder",
    proposalSource: "Fonte:",
    enlargePhoto: "Ampliar foto:",
    videoFallback: "Seu navegador não reproduz este vídeo.",
    lightboxLabel: "Visualização da imagem",
    lightboxClose: "Fechar",
    carouselRoleDescription: "carrossel",
    menuTitle: "Vamos por Minas.",
    menuWhatsapp: "Fale comigo",
    menuDonate: "Quero apoiar o projeto",
    backToTop: "Voltar ao início",
    videosKicker: "Em vídeo",
  },
} satisfies SiteContent;
