import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES, getGame, playButtonClass } from "@/lib/games";
import { seededScores } from "@/lib/scores";

const TOP_CLASS = ["top1", "top2", "top3"];

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();
  return { title: game.title, description: game.short };
}

export default async function GameDetailPage({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  // Semilla distinta a la del Salón (id.length * 23 + 7) para que las tablas no coincidan.
  const rows = seededScores(id.length * 31 + 3, 10);

  return (
    <div className="av-detail fade-in">
      <div className="detail-cover self-start">
        <div className={"cover-bg " + game.cover} />
      </div>

      <div className="detail-info">
        <h2>{game.title}</h2>
        <div className="detail-tags">
          <span>{game.cat}</span>
          <span>{game.plays} PARTIDAS</span>
        </div>
        <p>{game.long}</p>

        <div className="stat-strip">
          <div>
            <div className="l">Mejor puntuación</div>
            <div className="v">{game.best.toLocaleString("es-ES")}</div>
          </div>
          <div>
            <div className="l">Partidas</div>
            <div className="v">{game.plays}</div>
          </div>
          <div>
            <div className="l">Categoría</div>
            <div className="v">{game.cat}</div>
          </div>
        </div>

        <div className="detail-actions">
          <Link href={`/games/${game.id}/play`} className={playButtonClass(game.color) + " lg"}>
            JUGAR
          </Link>
          <Link href="/games" className="btn ghost lg">
            VOLVER
          </Link>
        </div>

        <div className="leaderboard mt-4">
          <h3>TOP 10</h3>
          {rows.map((r, i) => (
            <div key={r.name} className={"lb-row " + (TOP_CLASS[i] ?? "")}>
              <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
              <div className="pl">{r.name}</div>
              <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
