"use client";

import { useActionState, useState, type AnimationEvent, type FormEvent } from "react";
import { sendContact } from "@/app/about/actions";
import { CONTACT_LIMITS, type ContactState } from "@/lib/contact";

const INITIAL_STATE: ContactState = { status: "idle" };
const EMPTY_FORM = { name: "", email: "", msg: "" };

// «ENVIAR OTRO MENSAJE» cambia la key: el formulario se remonta con el estado de la acción en idle
// y los campos vacíos.
export default function ContactForm() {
  const [formKey, setFormKey] = useState(0);
  return <ContactFormInner key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendContact, INITIAL_STATE);
  // Campos controlados: React reinicia el <form> tras la acción, pero el valor vive aquí y no se pierde.
  const [form, setForm] = useState(EMPTY_FORM);
  const [shake, setShake] = useState(false);

  // Cada respuesta de la acción es un objeto nuevo: un error nuevo (aunque repita mensaje) vuelve a hacer shake.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setShake(true);
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      e.preventDefault(); // no se llama a la acción
      setShake(true);
    }
  };

  const onAnimationEnd = (e: AnimationEvent<HTMLFormElement>) => {
    if (e.target === e.currentTarget) setShake(false);
  };

  return (
    <form
      className={"contact-form" + (shake ? " shake" : "")}
      action={formAction}
      onSubmit={onSubmit}
      onAnimationEnd={onAnimationEnd}
    >
      {state.status !== "ok" ? (
        <>
          <div className="field">
            <label htmlFor="cf-name">NOMBRE</label>
            <input
              id="cf-name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="px_kai"
              maxLength={CONTACT_LIMITS.name}
              disabled={pending}
            />
          </div>
          <div className="field">
            <label htmlFor="cf-email">CORREO ELECTRÓNICO</label>
            <input
              id="cf-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jugador@vault.gg"
              maxLength={CONTACT_LIMITS.email}
              disabled={pending}
            />
          </div>
          <div className="field">
            <label htmlFor="cf-msg">MENSAJE</label>
            <textarea
              id="cf-msg"
              name="msg"
              rows={5}
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })}
              placeholder="Cuéntanos qué tienes en mente…"
              maxLength={CONTACT_LIMITS.msg}
              disabled={pending}
            ></textarea>
          </div>

          {/* Honeypot: invisible y fuera del Tab; si llega relleno, la acción responde éxito sin enviar. */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="cf-website">WEBSITE</label>
            <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {state.status === "error" && !pending && (
            <p className="contact-error" role="alert">
              {state.message}
            </p>
          )}

          <button className="btn xl press" type="submit" style={{ width: "100%" }} disabled={pending}>
            {pending ? "▸ TRANSMITIENDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      ) : (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r"></span>
            <span className="dot y"></span>
            <span className="dot g"></span>
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {state.name.toUpperCase()}.
              <span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={onReset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
