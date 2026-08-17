import type { StaticImageData } from "next/image";
import evento01 from "@/assets/images/evento-01.jpeg";
import evento02 from "@/assets/images/evento-02.jpeg";
import evento03 from "@/assets/images/evento-03.jpeg";
import evento04 from "@/assets/images/evento-04.jpeg";
import evento05 from "@/assets/images/evento-05.jpeg";
import evento06 from "@/assets/images/evento-06.jpeg";

export type Photo = {
  id: string;
  image: StaticImageData;
  alt: string;
  caption: string;
};

export const photos: readonly Photo[] = [
  {
    id: "evento-01",
    image: evento01,
    alt: "Matheus Biancardine ao lado de uma liderança do Partido NOVO durante o lançamento da pré-candidatura",
    caption:
      "Ao lado de lideranças do Partido NOVO no lançamento da pré-candidatura.",
  },
  {
    id: "evento-02",
    image: evento02,
    alt: "Matheus Biancardine concedendo entrevista com bandeiras da campanha ao fundo",
    caption: "Entrevista à imprensa durante o encontro Juntos por Minas.",
  },
  {
    id: "evento-03",
    image: evento03,
    alt: "Matheus Biancardine conversando com uma repórter na chegada ao evento",
    caption: "Conversa com a imprensa na chegada ao evento de lançamento.",
  },
  {
    id: "evento-04",
    image: evento04,
    alt: "Matheus Biancardine assinando o mapa de Minas Gerais em um painel da campanha",
    caption:
      "Assinatura no mapa de Minas: compromisso com todas as regiões do estado.",
  },
  {
    id: "evento-05",
    image: evento05,
    alt: "Matheus Biancardine conversando com jovens durante o evento",
    caption:
      "Ouvindo a juventude mineira e as pautas de quem quer mudar o estado.",
  },
  {
    id: "evento-06",
    image: evento06,
    alt: "Matheus Biancardine abraçado a um apoiador com camiseta do NOVO",
    caption: "O abraço dos apoiadores e da militância no dia do lançamento.",
  },
];
