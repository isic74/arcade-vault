"use server";

import { Resend } from "resend";
import { validateContact, type ContactState } from "@/lib/contact";

const GENERIC_ERROR = "✖ ERROR: NO SE PUDO ENVIAR. INTÉNTALO DE NUEVO.";
const DEFAULT_FROM = "Arcade Vault <onboarding@resend.dev>";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const msg = field(formData, "msg");

  // Honeypot: un bot lo rellena; respondemos éxito sin enviar nada.
  if (field(formData, "website")) return { status: "ok", name };

  const invalid = validateContact({ name, email, msg });
  if (invalid) return { status: "error", message: invalid };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] Falta configuración:", {
      RESEND_API_KEY: Boolean(apiKey),
      CONTACT_TO_EMAIL: Boolean(to),
    });
    return { status: "error", message: GENERIC_ERROR };
  }

  const subjectName = name.replace(/\r\n|\r|\n/g, " ");
  const text = `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}\n`;
  const html =
    `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>` +
    `<p><strong>Correo:</strong> ${escapeHtml(email)}</p>` +
    `<p><strong>Mensaje:</strong><br>${escapeHtml(msg).replace(/\r\n|\r|\n/g, "<br>")}</p>`;

  try {
    // El cliente se crea aquí para que el build no dependa de RESEND_API_KEY.
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Nuevo mensaje de ${subjectName}`,
      text,
      html,
    });

    if (error) {
      console.error("[contact] Resend devolvió error:", error);
      return { status: "error", message: GENERIC_ERROR };
    }
  } catch (err) {
    console.error("[contact] Resend lanzó una excepción:", err);
    return { status: "error", message: GENERIC_ERROR };
  }

  return { status: "ok", name };
}
