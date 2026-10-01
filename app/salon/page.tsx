import type { Metadata } from "next";
import HallOfFame from "@/components/HallOfFame";

export const metadata: Metadata = {
  title: "Salón de la Fama",
  description: "Las mejores puntuaciones de cada juego del vault.",
};

export default function SalonPage() {
  return <HallOfFame />;
}
