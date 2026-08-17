import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icons";
import {
  BriefcaseIcon,
  GraduationCapIcon,
  LandmarkIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SproutIcon,
  StoreIcon,
} from "@/components/ui/icons";

export type Proposal = {
  id: string;
  tag: string;
  title: string;
  body: string;
  source: string;
  Icon: ComponentType<IconProps>;
};

export const proposals: readonly Proposal[] = [
  {
    id: "juventude",
    tag: "Juventude",
    title: "Rota Nacional do Primeiro Trabalho",
    body: "A proposta consiste em criar uma rota nacional conectando escolas públicas, institutos federais, Sistema S, empresas e serviços locais de juventude. Uma plataforma única faria o diagnóstico de habilidades, ofereceria cursos curtos e gratuitos, reuniria vagas de aprendizagem, estágio e primeiro emprego e emitiria um portfólio digital de competências. Empresas participantes receberiam apoio para formar tutores e incentivos vinculados à permanência do jovem por pelo menos 12 meses. A prioridade seria atender quem está fora da escola e do trabalho, com metas públicas de inserção, formação e continuidade dos estudos.",
    source: "Planalto",
    Icon: BriefcaseIcon,
  },
  {
    id: "educacao",
    tag: "Educação",
    title: "Ensino Médio com Futuro",
    body: "A proposta consiste em ampliar a formação técnica integrada ao ensino médio sem reduzir o aprendizado de português, matemática, ciências e humanidades. Cada rede escolheria cursos ligados à economia regional, em parceria com institutos federais, Sistema S, universidades e empresas, utilizando laboratórios já existentes. A formação incluiria educação financeira, competências digitais, inteligência artificial, comunicação e orientação profissional. Os recursos federais seriam vinculados a metas de aprendizagem, redução do abandono, formação dos professores, conectividade adequada e divulgação transparente dos resultados de cada escola.",
    source: "Serviços e Informações do Brasil",
    Icon: GraduationCapIcon,
  },
  {
    id: "cultura",
    tag: "Cultura",
    title: "Rede de Economia Criativa",
    body: "A proposta consiste em criar polos regionais de economia criativa em bibliotecas, centros culturais, escolas técnicas e outros equipamentos públicos já existentes. Os espaços ofereceriam formação em gestão, direitos autorais, produção digital, vendas, exportação e acesso a crédito para música, audiovisual, design, games, artesanato, moda e atividades culturais. Um balcão único ajudaria na formalização e conectaria profissionais a empresas, plataformas, editais e compras públicas. O apoio teria seleção transparente e metas de faturamento, formalização e geração de trabalho, evitando dependência permanente de subsídios.",
    source: "Serviços e Informações do Brasil",
    Icon: PaletteIcon,
  },
  {
    id: "jovem-do-campo",
    tag: "Jovem do Campo",
    title: "Sucessão Rural 4.0",
    body: "A proposta consiste em transformar a Política Nacional de Juventude e Sucessão Rural em atendimento simples e acessível. Em um único canal, o jovem poderia obter o Cadastro da Agricultura Familiar, assistência técnica, capacitação, orientação para o Pronaf Jovem e apoio para elaborar seu plano produtivo. O programa apoiaria conectividade, irrigação eficiente, mecanização leve, energia renovável e tecnologias de gestão, priorizando atividades que agreguem valor à produção. Também incluiria orientação para sucessão familiar, cooperativismo e acesso a mercados, com acompanhamento técnico por três anos e indicadores de renda e permanência no campo.",
    source: "Planalto",
    Icon: SproutIcon,
  },
  {
    id: "seguranca",
    tag: "Segurança",
    title: "Estratégia Nacional contra Facções",
    body: "A proposta consiste em fortalecer a aplicação da Lei Antifacção por meio de uma estratégia permanente de asfixia financeira e desarticulação das lideranças criminosas. Polícia Federal, polícias estaduais, Receita, Coaf, Ministério Público e sistema prisional atuariam em forças-tarefa com metas e compartilhamento seguro de dados. A medida incluiria rastreamento e administração profissional de bens apreendidos, combate a empresas de fachada e controle das comunicações criminosas nos presídios. Penas e agravantes alcançariam especialmente líderes, financiadores, recrutadores de menores e agentes públicos envolvidos, preservando controle judicial e direito de defesa.",
    source: "Senado Federal",
    Icon: ShieldCheckIcon,
  },
  {
    id: "empreendedorismo",
    tag: "Empreendedorismo",
    title: "Empresa Pequena, Caminho Livre",
    body: "A proposta consiste em estabelecer um padrão nacional de simplificação para micro e pequenas empresas. Atividades de baixo risco teriam licenciamento automático, cadastro único e calendário integrado de obrigações, reduzindo formulários repetidos entre União, estados e municípios. Nos primeiros 12 meses, erros formais corrigíveis receberiam orientação antes da aplicação de multa, sem tolerância para fraude, risco sanitário, dano ambiental ou violação trabalhista. O programa ampliaria o acesso a compras públicas, capacitação e crédito com garantia de recebíveis, além de publicar o tempo, o custo e as etapas exigidas para manter cada negócio.",
    source: "Serviços e Informações do Brasil",
    Icon: StoreIcon,
  },
  {
    id: "projeto-nacional",
    tag: "Projeto Nacional",
    title: "Plano de Desenvolvimento da Juventude",
    body: "A proposta consiste em instituir um plano nacional de dez anos, com metas mensuráveis para educação, trabalho, segurança, cultura, empreendedorismo, saúde e participação social. Em vez de criar uma nova estrutura, o plano utilizaria o Sistema Nacional de Juventude para integrar ministérios, estados, municípios, conselhos e organizações locais. Os repasses federais seriam vinculados a diagnóstico territorial, metas e prestação de contas em painel público. Cada jovem teria uma porta de entrada digital e presencial para oportunidades e serviços, enquanto avaliações independentes identificariam iniciativas eficazes e encerrariam programas sem resultado comprovado.",
    source: "Serviços e Informações do Brasil",
    Icon: LandmarkIcon,
  },
];
