"use client";

import { useSyncExternalStore } from "react";

// Sesión falsa en el cliente, persistida en localStorage.

export type User = { name: string }; // name en mayúsculas, máximo 10 caracteres

export const SESSION_KEY = "av_user";
const SESSION_EVENT = "av-session-change";

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

// useSyncExternalStore exige un snapshot estable: se reutiliza el objeto
// mientras el valor crudo de localStorage no cambie.
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

function getSnapshot(): User | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cachedUser =
      parsed && typeof parsed === "object" && typeof (parsed as User).name === "string"
        ? { name: (parsed as User).name }
        : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function getServerSnapshot(): User | null {
  return null;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === SESSION_KEY) onChange();
  };
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function useUser(): User | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function signIn(user: User): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // localStorage bloqueado: se sigue como invitado.
  }
  notify();
}

export function signOut(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // localStorage bloqueado: no hay nada que borrar.
  }
  notify();
}
