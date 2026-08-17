export type EventVideo = {
  id: string;
  src: string;
  poster: string;
  caption: string;
};

/** Ficam em public/: <video src> e poster precisam de URL direta. */
export const videos: readonly EventVideo[] = [
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
];
