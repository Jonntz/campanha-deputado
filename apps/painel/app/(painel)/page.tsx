import { redirect } from "next/navigation";

/** O painel existe para editar conteúdo; não há o que mostrar antes disso. */
export default function Home() {
  redirect("/conteudo");
}
