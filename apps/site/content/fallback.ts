import credDiretorJuventude from "@/assets/images/cred-diretor-juventude.jpeg";
import credMedalhaJk from "@/assets/images/cred-medalha-jk.jpeg";
import credPartidoNovo from "@/assets/images/cred-partido-novo.jpeg";
import credSimoes from "@/assets/images/simoes.jpeg";
import evento01 from "@/assets/images/evento-01.jpeg";
import evento02 from "@/assets/images/evento-02.jpeg";
import evento03 from "@/assets/images/evento-03.jpeg";
import evento04 from "@/assets/images/evento-04.jpeg";
import evento05 from "@/assets/images/evento-05.jpeg";
import evento06 from "@/assets/images/evento-06.jpeg";
import heroPortrait from "@/assets/images/hero-matheus.jpg";
import quemMatheus from "@/assets/images/quem-matheus.jpeg";
import type { SiteContent } from "@campanha/content";
import { fromStatic } from "@/lib/media";

/**
 * Conteúdo padrão do site, versionado junto do código.
 *
 * Hoje é a única fonte. A partir da Fase 3 a versão publicada vem do banco e
 * este arquivo passa a ser a rede de segurança: se o Turso estiver fora do ar,
 * o site continua subindo com este conteúdo em vez de quebrar. Por isso ele
 * precisa continuar completo e válido, e não virar um esqueleto vazio.
 */
export const fallbackContent = {
  identity: {
    name: "Matheus Biancardine",
    role: "Pré-candidato a Deputado Federal",
    tagline: "Tolerância zero por Minas",
    state: "Minas Gerais",
    url: "https://www.matheusbiancardine.com.br",
    brand: { lead: "Minas", accent: "é o mundo" },
    whatsapp: { display: "(31) 99696-5298", e164: "5531996965298" },
    instagram: {
      handle: "@matheus.biancardine",
      url: "https://instagram.com/matheus.biancardine",
    },
    donation: { url: "https://queroapoiar.com.br/matheusbiancardine" },
  },

  seo: {
    description:
      "Pré-candidato a Deputado Federal por Minas Gerais. Fim da saidinha, leis mais rígidas e cadeia para quem recruta jovens para o tráfico.",
    ogDescription:
      "Pré-candidato a Deputado Federal por Minas Gerais. Enquanto a velha política passa pano pro crime, eu defendo Minas.",
    jsonLdDescription:
      "Matheus Biancardine é pré-candidato a Deputado Federal por Minas Gerais, com foco em segurança pública, oportunidades para a juventude e menos impostos.",
    keywords: [
      "Matheus Biancardine",
      "Deputado Federal",
      "Minas Gerais",
      "Segurança Pública",
      "Tolerância Zero",
      "MG 2026",
    ],
    themeColor: "#12303c",
    ogImage: { url: "/og-image.jpg", width: 1200, height: 630 },
  },

  nav: {
    ariaLabel: "Navegação principal",
    items: [
      { sectionKey: "inicio", label: "Início", visible: true },
      { sectionKey: "bio", label: "Biografia", visible: true },
      { sectionKey: "propostas", label: "Propostas", visible: true },
      { sectionKey: "galeria", label: "Galeria", visible: true },
      { sectionKey: "contato", label: "Contato", visible: true },
    ],
    ctaLabel: "Faça parte do projeto",
    ribbon: { text: "Considere fazer uma doação!", linkLabel: "Doar" },
  },

  hero: {
    badge: "Minas Gerais · 2026",
    title: { lines: ["Tolerância zero", "por"], accent: "Minas." },
    subtitle: "Pré-candidato a Deputado Federal por Minas Gerais",
    body: "Enquanto a velha política passa pano pro crime, eu defendo o fim da saidinha, leis mais rígidas e cadeia para quem recruta jovens para o tráfico. Minas sempre foi terra de gente trabalhadora e de bem. Vai continuar sendo.",
    ctas: [
      {
        id: "apoio",
        label: "Apoio essa luta",
        target: "contato",
        icon: "heart",
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
    image: fromStatic(heroPortrait, "Matheus Biancardine, pré-candidato a Deputado Federal por Minas Gerais", { x: 50, y: 30 }, { x: 50, y: 32 }),
  },

  credentials: {
    ariaLabel: "Trajetória e credenciais",
    items: [
      {
        id: "assessor",
        image: fromStatic(credSimoes, "Matheus Biancardine ao lado do governador Mateus Simões", { x: 50, y: 30 }),
        title: "Assessor do Governador Mateus Simões",
        text: "Atuação no Governo de Minas Gerais. Articulação com prefeituras e Assembleia Legislativa.",
      },
      {
        id: "juventude-novo",
        image: fromStatic(credPartidoNovo, "Matheus Biancardine discursando em evento do Partido NOVO", { x: 58, y: 22 }),
        title: "Fundador da Juventude do Partido Novo",
        text: "Criou e liderou o movimento que formou a nova geração liberal de Minas Gerais.",
      },
      {
        id: "diretor-juventude",
        image: fromStatic(credDiretorJuventude, "Matheus Biancardine ao lado do governador Romeu Zema", { x: 45, y: 20 }),
        title: "Diretor de Políticas para Juventude",
        text: "Na gestão Romeu Zema. Responsável por programas que impactam 4,2 milhões de jovens mineiros.",
      },
      {
        id: "medalha-jk",
        image: fromStatic(credMedalhaJk, "Matheus Biancardine na cerimônia da Medalha Juscelino Kubitschek", { x: 28, y: 32 }),
        title: "Medalha Juscelino Kubitschek",
        text: "Maior honraria do Estado de Minas Gerais. Reconhecimento por serviços prestados a MG.",
      },
    ],
  },

  bio: {
    header: {
      eyebrow: "Biografia",
      title: { lead: "Quem é", accent: "Matheus Biancardine?" },
    },
    image: fromStatic(quemMatheus, "Matheus Biancardine discursando ao microfone", { x: 50, y: 20 }),
    paragraphs: [
      {
        id: "origem",
        text: "**Matheus Biancardine** encontrou em Minas Gerais sua casa e seu propósito. Mudou-se para o estado com a família em busca de segurança e oportunidades, e desde então construiu uma relação de amor incondicional com Minas, sua gente, sua história, seus valores e sua juventude.",
      },
      {
        id: "trajetoria",
        text: "Católico, estudante de Direito e de Ciências Políticas, iniciou sua trajetória pública na juventude, fundando a Juventude do Partido NOVO e atuando como presidente estadual e nacional do movimento. Também presidiu o Conselho Estadual da Juventude de Minas Gerais, foi conselheiro estadual, delegado nacional de juventude e Diretor Estadual de Políticas para as Juventudes no Governo de Minas, pela Sedese.",
      },
      {
        id: "atuacao",
        text: "Atualmente, atua como assessor do Governo de Minas, levando sua experiência na gestão pública, na articulação política e na defesa da juventude para uma missão maior: representar uma nova geração na política.",
      },
      {
        id: "objetivo",
        text: "Em 2026, seu objetivo é chegar à Câmara dos Deputados como uma voz jovem, liberal e corajosa a serviço de Minas Gerais, defendendo segurança, liberdade, menos impostos, oportunidades para a juventude e uma política feita com propósito, responsabilidade e coragem.",
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
      title: { lead: "Nossas", accent: "Propostas" },
      lead: "Foco no que Minas precisa para crescer.",
    },
    items: [
      {
        id: "juventude",
        tag: "Juventude",
        title: "Rota Nacional do Primeiro Trabalho",
        body: "A proposta consiste em criar uma rota nacional conectando escolas públicas, institutos federais, Sistema S, empresas e serviços locais de juventude. Uma plataforma única faria o diagnóstico de habilidades, ofereceria cursos curtos e gratuitos, reuniria vagas de aprendizagem, estágio e primeiro emprego e emitiria um portfólio digital de competências. Empresas participantes receberiam apoio para formar tutores e incentivos vinculados à permanência do jovem por pelo menos 12 meses. A prioridade seria atender quem está fora da escola e do trabalho, com metas públicas de inserção, formação e continuidade dos estudos.",
        source: "Planalto",
        icon: "briefcase",
      },
      {
        id: "educacao",
        tag: "Educação",
        title: "Ensino Médio com Futuro",
        body: "A proposta consiste em ampliar a formação técnica integrada ao ensino médio sem reduzir o aprendizado de português, matemática, ciências e humanidades. Cada rede escolheria cursos ligados à economia regional, em parceria com institutos federais, Sistema S, universidades e empresas, utilizando laboratórios já existentes. A formação incluiria educação financeira, competências digitais, inteligência artificial, comunicação e orientação profissional. Os recursos federais seriam vinculados a metas de aprendizagem, redução do abandono, formação dos professores, conectividade adequada e divulgação transparente dos resultados de cada escola.",
        source: "Serviços e Informações do Brasil",
        icon: "graduation-cap",
      },
      {
        id: "cultura",
        tag: "Cultura",
        title: "Rede de Economia Criativa",
        body: "A proposta consiste em criar polos regionais de economia criativa em bibliotecas, centros culturais, escolas técnicas e outros equipamentos públicos já existentes. Os espaços ofereceriam formação em gestão, direitos autorais, produção digital, vendas, exportação e acesso a crédito para música, audiovisual, design, games, artesanato, moda e atividades culturais. Um balcão único ajudaria na formalização e conectaria profissionais a empresas, plataformas, editais e compras públicas. O apoio teria seleção transparente e metas de faturamento, formalização e geração de trabalho, evitando dependência permanente de subsídios.",
        source: "Serviços e Informações do Brasil",
        icon: "palette",
      },
      {
        id: "jovem-do-campo",
        tag: "Jovem do Campo",
        title: "Sucessão Rural 4.0",
        body: "A proposta consiste em transformar a Política Nacional de Juventude e Sucessão Rural em atendimento simples e acessível. Em um único canal, o jovem poderia obter o Cadastro da Agricultura Familiar, assistência técnica, capacitação, orientação para o Pronaf Jovem e apoio para elaborar seu plano produtivo. O programa apoiaria conectividade, irrigação eficiente, mecanização leve, energia renovável e tecnologias de gestão, priorizando atividades que agreguem valor à produção. Também incluiria orientação para sucessão familiar, cooperativismo e acesso a mercados, com acompanhamento técnico por três anos e indicadores de renda e permanência no campo.",
        source: "Planalto",
        icon: "sprout",
      },
      {
        id: "seguranca",
        tag: "Segurança",
        title: "Estratégia Nacional contra Facções",
        body: "A proposta consiste em fortalecer a aplicação da Lei Antifacção por meio de uma estratégia permanente de asfixia financeira e desarticulação das lideranças criminosas. Polícia Federal, polícias estaduais, Receita, Coaf, Ministério Público e sistema prisional atuariam em forças-tarefa com metas e compartilhamento seguro de dados. A medida incluiria rastreamento e administração profissional de bens apreendidos, combate a empresas de fachada e controle das comunicações criminosas nos presídios. Penas e agravantes alcançariam especialmente líderes, financiadores, recrutadores de menores e agentes públicos envolvidos, preservando controle judicial e direito de defesa.",
        source: "Senado Federal",
        icon: "shield-check",
      },
      {
        id: "empreendedorismo",
        tag: "Empreendedorismo",
        title: "Empresa Pequena, Caminho Livre",
        body: "A proposta consiste em estabelecer um padrão nacional de simplificação para micro e pequenas empresas. Atividades de baixo risco teriam licenciamento automático, cadastro único e calendário integrado de obrigações, reduzindo formulários repetidos entre União, estados e municípios. Nos primeiros 12 meses, erros formais corrigíveis receberiam orientação antes da aplicação de multa, sem tolerância para fraude, risco sanitário, dano ambiental ou violação trabalhista. O programa ampliaria o acesso a compras públicas, capacitação e crédito com garantia de recebíveis, além de publicar o tempo, o custo e as etapas exigidas para manter cada negócio.",
        source: "Serviços e Informações do Brasil",
        icon: "store",
      },
      {
        id: "projeto-nacional",
        tag: "Projeto Nacional",
        title: "Plano de Desenvolvimento da Juventude",
        body: "A proposta consiste em instituir um plano nacional de dez anos, com metas mensuráveis para educação, trabalho, segurança, cultura, empreendedorismo, saúde e participação social. Em vez de criar uma nova estrutura, o plano utilizaria o Sistema Nacional de Juventude para integrar ministérios, estados, municípios, conselhos e organizações locais. Os repasses federais seriam vinculados a diagnóstico territorial, metas e prestação de contas em painel público. Cada jovem teria uma porta de entrada digital e presencial para oportunidades e serviços, enquanto avaliações independentes identificariam iniciativas eficazes e encerrariam programas sem resultado comprovado.",
        source: "Serviços e Informações do Brasil",
        icon: "landmark",
      },
    ],
  },

  gallery: {
    header: {
      eyebrow: "Galeria",
      title: { lead: "Galeria de", accent: "Fotos" },
      lead: "Momentos do lançamento da pré-candidatura e das agendas por Minas.",
    },
    photos: [
      {
        id: "evento-01",
        image: fromStatic(evento01, "Matheus Biancardine ao lado de uma liderança do Partido NOVO durante o lançamento da pré-candidatura"),
        caption:
          "Ao lado de lideranças do Partido NOVO no lançamento da pré-candidatura.",
      },
      {
        id: "evento-02",
        image: fromStatic(evento02, "Matheus Biancardine concedendo entrevista com bandeiras da campanha ao fundo"),
        caption: "Entrevista à imprensa durante o encontro Juntos por Minas.",
      },
      {
        id: "evento-03",
        image: fromStatic(evento03, "Matheus Biancardine conversando com uma repórter na chegada ao evento"),
        caption: "Conversa com a imprensa na chegada ao evento de lançamento.",
      },
      {
        id: "evento-04",
        image: fromStatic(evento04, "Matheus Biancardine assinando o mapa de Minas Gerais em um painel da campanha"),
        caption:
          "Assinatura no mapa de Minas: compromisso com todas as regiões do estado.",
      },
      {
        id: "evento-05",
        image: fromStatic(evento05, "Matheus Biancardine conversando com jovens durante o evento"),
        caption:
          "Ouvindo a juventude mineira e as pautas de quem quer mudar o estado.",
      },
      {
        id: "evento-06",
        image: fromStatic(evento06, "Matheus Biancardine abraçado a um apoiador com camiseta do NOVO"),
        caption: "O abraço dos apoiadores e da militância no dia do lançamento.",
      },
    ],
    videosTitle: "Vídeos do evento",
    videos: [
      {
        id: "video-1",
        src: "/videos/evento-video-1.mp4",
        poster: "/videos/evento-video-1.jpg",
        caption: "Lideranças falam sobre a mobilização por Minas Gerais.",
      },
      {
        id: "video-2",
        src: "/videos/evento-video-2.mp4",
        poster: "/videos/evento-video-2.jpg",
        caption: "Apoiadoras dão seu depoimento durante o encontro.",
      },
      {
        id: "video-3",
        src: "/videos/evento-video-3.mp4",
        poster: "/videos/evento-video-3.jpg",
        caption: "A nova geração que caminha junto com o projeto por Minas.",
      },
      {
        id: "video-4",
        src: "/videos/evento-video-4.mp4",
        poster: "/videos/evento-video-4.jpg",
        caption: "Quem esteve presente conta o que espera da nova política.",
      },
    ],
  },

  contact: {
    header: {
      eyebrow: "Contato",
      title: { lead: "Fale", accent: "Conosco" },
      lead: "Sua voz é fundamental para construirmos uma Minas melhor. Entre em contato e acompanhe nossas redes sociais.",
    },
    whatsappLabel: "WhatsApp",
    instagramLabel: "Instagram",
    instagramActionLabel: "Seguir no Instagram",
    whatsappActionLabel: "Conversar no WhatsApp",
  },

  footer: {
    brand: { lead: "Matheus", accent: "Biancardine" },
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
    videoFallback: "Seu navegador não suporta vídeo em HTML5.",
    lightboxLabel: "Visualização da imagem",
    lightboxClose: "Fechar",
    carouselRoleDescription: "carrossel",
  },
} satisfies SiteContent;
