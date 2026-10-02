"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/lib/session";

type Tab = "in" | "up";

export default function AuthForm({ initialTab = "in" }: { initialTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");

  // Login falso: cualquier usuario y contraseña entran.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn({ name: (user || "PLAYER1").toUpperCase().slice(0, 10) });
    router.push("/");
  };

  const playAsGuest = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="av-auth-wrap fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="mark" />
          <h2 className="neon-cyan">ARCADE VAULT</h2>
          <div className="mono mt-1.5 text-[11px] tracking-[0.16em] text-ink-faint">
            ACCESO AL SISTEMA · v2.6
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === "in" ? "on" : undefined}
            aria-pressed={tab === "in"}
            onClick={() => setTab("in")}
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            className={tab === "up" ? "on" : undefined}
            aria-pressed={tab === "up"}
            onClick={() => setTab("up")}
          >
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="auth-user">Usuario</label>
            <input
              id="auth-user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="px_kai"
              autoComplete="username"
            />
          </div>
          {tab === "up" && (
            <div className="field slide-in">
              <label htmlFor="auth-email">Correo electrónico</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jugador@vault.gg"
                autoComplete="email"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-pass">Contraseña</label>
            <input
              id="auth-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === "in" ? "current-password" : "new-password"}
            />
          </div>

          <button className="btn lg mt-2 w-full" type="submit">
            {tab === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
          </button>
        </form>

        <button type="button" className="btn ghost mt-2.5 w-full" onClick={playAsGuest}>
          JUGAR COMO INVITADO
        </button>

        <div className="auth-divider">O CONTINÚA CON</div>
        {/* Decorativos: el login social real queda fuera de esta spec. */}
        <div className="social">
          <button className="btn ghost" type="button">
            ◆  GOOGLE
          </button>
          <button className="btn ghost" type="button">
            ▣  GITHUB
          </button>
        </div>

        <div className="mt-[18px] text-center text-[11px] tracking-[0.1em] text-ink-faint">
          AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
        </div>
      </div>
    </div>
  );
}
