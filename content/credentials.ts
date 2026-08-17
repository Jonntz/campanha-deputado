import type { StaticImageData } from "next/image";
import diretorJuventude from "@/assets/images/cred-diretor-juventude.jpeg";
import medalhaJk from "@/assets/images/cred-medalha-jk.jpeg";
import partidoNovo from "@/assets/images/cred-partido-novo.jpeg";
import simoes from "@/assets/images/simoes.jpeg";

export type Credential = {
  id: string;
  image: StaticImageData;
  alt: string;
  /** Recorte circular: mantém o rosto centralizado no avatar. */
  objectPosition: string;
  title: string;
  text: string;
};

export const credentials: readonly Credential[] = [
  {
    id: "assessor",
    image: simoes,
    alt: "Matheus Biancardine ao lado do governador Mateus Simões",
    objectPosition: "50% 30%",
    title: "Assessor do Governador Mateus Simões",
    text: "Atuação no Governo de Minas Gerais. Articulação com prefeituras e Assembleia Legislativa.",
  },
  {
    id: "juventude-novo",
    image: partidoNovo,
    alt: "Matheus Biancardine discursando em evento do Partido NOVO",
    objectPosition: "58% 22%",
    title: "Fundador da Juventude do Partido Novo",
    text: "Criou e liderou o movimento que formou a nova geração liberal de Minas Gerais.",
  },
  {
    id: "diretor-juventude",
    image: diretorJuventude,
    alt: "Matheus Biancardine ao lado do governador Romeu Zema",
    objectPosition: "45% 20%",
    title: "Diretor de Políticas para Juventude",
    text: "Na gestão Romeu Zema. Responsável por programas que impactam 4,2 milhões de jovens mineiros.",
  },
  {
    id: "medalha-jk",
    image: medalhaJk,
    alt: "Matheus Biancardine na cerimônia da Medalha Juscelino Kubitschek",
    objectPosition: "28% 32%",
    title: "Medalha Juscelino Kubitschek",
    text: "Maior honraria do Estado de Minas Gerais. Reconhecimento por serviços prestados a MG.",
  },
];
