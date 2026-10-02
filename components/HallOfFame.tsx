"use client";

import { useState } from "react";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import { seededScores } from "@/lib/scores";
import { useUser } from "@/lib/session";

const TOP_CLASS = ["top1", "top2", "top3"];
const fmt = (n: number) => n.toLocaleString("es-ES");
const rank = (n: number) => `#${String(n).padStart(2, "0")}`;

export default function HallOfFame() {
  const user = useUser();
  const [tab, setTab] = useState(GAMES[0].id);
  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];
  const rows = seededScores(tab.length * 23 + 7, 12);
  // Marca propia simulada, igual que en la plantilla.
  const youRank = 8 + (tab.length % 4);
  const youScore = rows[5].score - 2400;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel text-[10px]">LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA</p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            aria-pressed={tab === g.id}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{fmt(rows[1].score)}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel text-[9px] tracking-[0.18em] text-gold">CAMPEÓN</div>
          <div className="rank-num mt-1 text-[36px]">01</div>
          <div className="name">{rows[0].name}</div>
          <div className="score text-[20px]">{fmt(rows[0].score)}</div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{fmt(rows[2].score)}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          // La key incluye la pestaña para que la animación escalonada se repita al cambiar de juego.
          <div
            key={`${tab}-${r.name}`}
            className={"tr " + (TOP_CLASS[i] ?? "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">{rank(r.rank)}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{fmt(r.score)}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div
              key={`${tab}-you`}
              className="tr you"
              style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
            >
              <div className="rk text-yellow">{rank(youRank)}</div>
              <div className="pl text-yellow">{user.name}</div>
              <div className="sc text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)]">
                {fmt(youScore || 9999)}
              </div>
              <div className="dt">11/05/2026</div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/games" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
