// Validación del formulario de contacto, compartida entre cliente y Server Action.
// Sin "use server" ni dependencias.

export const CONTACT_LIMITS = { name: 60, email: 120, msg: 2000 } as const;

export type ContactInput = { name: string; email: string; msg: string };

export type ContactState =
  | { status: "idle" }
  | { status: "ok"; name: string } // name ya recortado
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el mensaje de error o null si es válido. Recibe los valores ya recortados.
export function validateContact(input: ContactInput): string | null {
  const { name, email, msg } = input;

  if (!name || !email || !msg) return "✖ COMPLETA TODOS LOS CAMPOS.";
  if (!EMAIL_RE.test(email)) return "✖ CORREO ELECTRÓNICO NO VÁLIDO.";
  if (name.length > CONTACT_LIMITS.name) return "✖ EL NOMBRE ES DEMASIADO LARGO.";
  if (email.length > CONTACT_LIMITS.email) return "✖ EL CORREO ES DEMASIADO LARGO.";
  if (msg.length > CONTACT_LIMITS.msg) return "✖ EL MENSAJE ES DEMASIADO LARGO.";

  return null;
}
