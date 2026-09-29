"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useUser } from "@/lib/session";

type Section = "biblioteca" | "salon" | "auth";

function sectionOf(pathname: string): Section | null {
  if (pathname === "/" || pathname.startsWith("/juegos/")) return "biblioteca";
  if (pathname === "/salon") return "salon";
  if (pathname === "/auth") return "auth";
  return null;
}

export default function Nav() {
  const pathname = usePathname();
  const user = useUser();
  const [open, setOpen] = useState(false);

  const active = sectionOf(pathname);
  const cls = (s: Section) => (active === s ? "active" : undefined);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("biblioteca")}>
            Biblioteca
          </Link>
          <Link href="/salon" className={cls("salon")}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button type="button" className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
          aria-expanded={open}
          aria-controls="av-mobile-panel"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        id="av-mobile-panel"
        className={"av-mobile-panel" + (open ? " open" : "")}
        inert={!open}
      >
        <div className="pixel neon-cyan mb-4 text-[11px]">MENÚ</div>
        <Link href="/" className={cls("biblioteca")} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={cls("salon")} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/auth" className={cls("auth")} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div className="flex-1" />
        <div className="pixel text-[9px] tracking-[0.16em] text-ink-faint">CRÉDITOS · 03</div>
      </aside>
    </>
  );
}
