import { Barlow } from "next/font/google";

/** Mesma fonte do site: o painel é a mesma casa, ainda que outro cômodo. */
export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-barlow",
});
