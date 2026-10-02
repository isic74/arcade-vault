import type { GameColor } from "@/lib/games";

// Contenido estático de /about, portado tal cual desde references/templates/home-about/about.jsx.

export type Highlight = {
  icon: "HEART" | "BROWSER" | "PLANT";
  text: string; // "HECHO CON ❤️ PARA JUGADORES"
  color: Extract<GameColor, "magenta" | "cyan" | "green">;
};

export const HIGHLIGHTS: Highlight[] = [
  { icon: "HEART", text: "HECHO CON ❤️ PARA JUGADORES", color: "magenta" },
  { icon: "BROWSER", text: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", color: "cyan" },
  { icon: "PLANT", text: "PROYECTO EN CONSTANTE CRECIMIENTO", color: "green" },
];
