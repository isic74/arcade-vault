# SPEC 03 — Acerca de y formulario de contacto con Resend

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-10-02
> **Objetivo:** Implementar en `/about` la página de `references/templates/home-about/about.jsx` y que su formulario de contacto envíe un correo real al equipo con Resend mediante una Server Action.

## Por qué existe esta spec

SPEC 02 dejó `app/about/page.tsx` como un *placeholder* que llama a `notFound()`, con el enlace «Acerca de» de la barra ya apuntando a `/about`.
Esta spec sustituye ese *placeholder* por la página real y convierte el formulario decorativo de la plantilla en un envío real.

Hallazgos sobre la plantilla que condicionan el trabajo:

- `about.jsx` contiene `About` y `HighlightIcon`. El resto de archivos de `home-about/` ya se portaron en SPEC 02.
- La sección `ABOUT PAGE` de `styles.css` (líneas 1071–1146) **no** está en `app/globals.css`.
- `.field input`, `.reveal`, `.fade-in`, `.kicker`, `@keyframes blink` y `@keyframes fadeIn` **ya** están en `app/globals.css`. `@keyframes pxblink` y `@keyframes shake` no.
- No hay estilos para `textarea` fuera del bloque `.contact-form textarea`, que viene en la sección a portar.
- La plantilla solo tiene dos estados (formulario y terminal de éxito). El envío real añade un estado de carga y uno de error que la plantilla no trae.
- Los `<label>` de la plantilla no están asociados a sus campos y los campos no tienen `name`. Ambos hacen falta para la accesibilidad y para `FormData`.
- `.gitignore` ignora `.env*`, lo que también ignoraría `.env.template`.
- `RevealOnScroll` (`components/home/RevealOnScroll.tsx`) hace exactamente lo mismo que el `useEffect` de `About`, así que se reutiliza.

## Alcance

**Dentro:**

- `/about` con la página de la plantilla, fiel en estructura, texto y clases:
  1. **Hero:** «▸ ACERCA DE» en amarillo, el título «ACERCA DE ARCADE VAULT», el párrafo de misión y la fila de 3 *highlights* (HEART magenta, BROWSER cian, PLANT verde) con sus iconos pixel SVG y el retraso escalonado de 80 ms.
  2. **Separador:** dos barras degradadas y 24 píxeles parpadeantes con retraso de 80 ms entre cada uno (`aria-hidden`, `.reveal`).
  3. **Contacto** (`.reveal`): la columna de introducción («▸ CONTACTO», «CONTÁCTANOS», el subtítulo y los 3 *tips* con su LED) y el formulario.
- El formulario con los campos NOMBRE, CORREO ELECTRÓNICO y MENSAJE, con los *placeholders* de la plantilla, y el botón «▶  ENVIAR MENSAJE».
- Cada `<label>` asociado a su campo con `htmlFor`/`id`. Cada campo con `name` (`name`, `email`, `msg`) y `maxLength` según los límites del modelo de datos.
- Cuatro estados del formulario:
  - **Edición:** como la plantilla.
  - **Enviando:** el botón muestra «▸ TRANSMITIENDO…» y queda deshabilitado, igual que los tres campos.
  - **Error:** una línea en magenta encima del botón con el mensaje del servidor, más el *shake*. Los datos escritos se conservan.
  - **Éxito:** la terminal «VAULT-OS // TERMINAL» de la plantilla, con el nombre en mayúsculas. «ENVIAR OTRO MENSAJE» vuelve al formulario vacío.
- Validación en el cliente igual que la plantilla: si algún campo está vacío tras `trim`, no se envía y el formulario hace *shake* sin mensaje.
- Validación en el servidor (la que manda): campos no vacíos tras `trim`, formato de correo y longitudes máximas.
- Campo *honeypot* `website` oculto a la vista y a lectores de pantalla (`tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`). Si llega relleno, la acción responde éxito sin enviar nada.
- Envío con el SDK `resend` desde una Server Action en `app/about/actions.ts`:
  - `from`: `CONTACT_FROM_EMAIL`, o `Arcade Vault <onboarding@resend.dev>` si no está definida.
  - `to`: `CONTACT_TO_EMAIL`.
  - `replyTo`: el correo que escribió el usuario.
  - `subject`: `[Arcade Vault] Nuevo mensaje de {nombre}`.
  - Cuerpo en texto plano y una versión HTML mínima con nombre, correo y mensaje, todos escapados.
- Si faltan `RESEND_API_KEY` o `CONTACT_TO_EMAIL`, o si Resend devuelve error o lanza, la acción hace `console.error` en el servidor y devuelve el error genérico.
- `.env.template` versionado con las tres variables y `!.env.template` en `.gitignore`.
- Portar a `app/globals.css` la sección `ABOUT PAGE` de `styles.css` (líneas 1071–1146), más:
  - `.contact-error` para la línea de error.
  - El estilo de `.contact-form .btn:disabled`.
  - Las reglas del honeypot (`.hp-field`).
  - `.div-pixels span`, `.term-body .caret` y `.contact-form.shake` dentro del bloque `prefers-reduced-motion` existente.
- Metadatos: `/about` con el título `Acerca de · Arcade Vault`.
- Diseño adaptable hasta 400 px de ancho, con los *breakpoints* de `styles.css` (820 px y 900 px).

**Fuera de alcance (para specs futuras):**

- Correo de confirmación al usuario que escribe.
- *Rate limiting* o CAPTCHA.
- Guardar los mensajes en una base de datos o en un panel de administración.
- Plantillas de correo con React Email.
- Verificar un dominio propio en Resend. Esta spec funciona con `onboarding@resend.dev`.
- Cambios en la barra de navegación: el enlace «Acerca de» ya existe y ya se marca activo en `/about` desde SPEC 02.
- Tests automatizados.

## Modelo de datos

```ts
// lib/about.ts — contenido estático de la página
import type { GameColor } from "@/lib/games";

export type Highlight = {
  icon: "HEART" | "BROWSER" | "PLANT";
  text: string;     // "HECHO CON ❤️ PARA JUGADORES"
  color: Extract<GameColor, "magenta" | "cyan" | "green">;
};

export const HIGHLIGHTS: Highlight[]; // 3, en el orden de la plantilla
```

```ts
// lib/contact.ts — validación compartida (sin "use server", sin dependencias)
export const CONTACT_LIMITS = { name: 60, email: 120, msg: 2000 } as const;

export type ContactInput = { name: string; email: string; msg: string };

export type ContactState =
  | { status: "idle" }
  | { status: "ok"; name: string }       // name ya recortado
  | { status: "error"; message: string };

// Devuelve el mensaje de error o null si es válido. Recibe los valores ya recortados.
export function validateContact(input: ContactInput): string | null;
```

```ts
// app/about/actions.ts
"use server";
export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState>;
```

Variables de entorno (en `.env.local`, nunca versionado):

| Variable | Obligatoria | Ejemplo |
| -------- | ----------- | ------- |
| `RESEND_API_KEY` | Sí | `re_xxxxxxxx` |
| `CONTACT_TO_EMAIL` | Sí | `equipo@ejemplo.com` |
| `CONTACT_FROM_EMAIL` | No | `Arcade Vault <onboarding@resend.dev>` |

Mensajes de error, exactos:

| Caso | Mensaje |
| ---- | ------- |
| Algún campo vacío (en el servidor) | `✖ COMPLETA TODOS LOS CAMPOS.` |
| Correo con formato inválido | `✖ CORREO ELECTRÓNICO NO VÁLIDO.` |
| Campo demasiado largo | `✖ EL MENSAJE ES DEMASIADO LARGO.` (o `EL NOMBRE` / `EL CORREO`) |
| Falta configuración, Resend falla o lanza | `✖ ERROR: NO SE PUDO ENVIAR. INTÉNTALO DE NUEVO.` |

Convenciones:

- Nombres de campo del formulario: `name`, `email`, `msg` y `website` (honeypot).
- La regex de correo es deliberadamente simple: `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- En el asunto, el nombre se usa sin saltos de línea (se sustituyen por espacios).
- El HTML escapa `& < > " '` en los tres campos. Los saltos de línea del mensaje pasan a `<br>`.
- El cliente de Resend se crea **dentro** de la acción, nunca a nivel de módulo, para que el build no falle sin `RESEND_API_KEY`.
- Ni la clave ni los correos de configuración llegan nunca al cliente (sin prefijo `NEXT_PUBLIC_`).

## Plan de implementación

1. **Dependencia y entorno.**
   - `npm install resend`.
   - Crear `.env.template` con las tres variables vacías y un comentario sobre `onboarding@resend.dev`.
   - Añadir `!.env.template` a `.gitignore` debajo de `.env*`.
   - Consultar `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`.
   - Verificar: `git status` muestra `.env.template` y `npm run build` pasa.
2. **CSS.** Portar a `app/globals.css` la sección `ABOUT PAGE` de `styles.css` y añadir `.contact-error`, `.contact-form .btn:disabled`, `.hp-field` y las reglas de `prefers-reduced-motion` del alcance. Antes de pegar, buscar cada selector nuevo en `globals.css` para evitar choques. Verificar: `npm run build` pasa.
3. **Datos y validación.** Crear `lib/about.ts` y `lib/contact.ts` según el modelo de datos. Verificar: `npx tsc --noEmit` pasa.
4. **Server Action.**
   - Consultar `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` y `forms.md` antes de escribirla.
   - Crear `app/about/actions.ts`: lee y recorta los campos, aplica el honeypot, llama a `validateContact`, comprueba las variables de entorno y envía con `resend.emails.send`.
   - Trata como fallo tanto un `error` en la respuesta como una excepción.
5. **Icono.** Crear `components/about/HighlightIcon.tsx` (servidor) con los 3 SVG de la plantilla y `aria-hidden`.
6. **Página sin formulario.**
   - Reescribir `app/about/page.tsx` como componente de servidor con `metadata`, la raíz `.about fade-in`, el hero, el separador y la columna de introducción del contacto.
   - Montar `RevealOnScroll`.
   - Dejar el hueco del formulario vacío.
   - Verificar: `/about` ya no muestra la 404, los 3 *highlights* se ven y el separador aparece al hacer scroll.
7. **Formulario.**
   - Crear `components/about/ContactForm.tsx` (cliente) con `useActionState(sendContact, { status: "idle" })`.
   - Los campos son controlados, así los datos se conservan cuando hay error.
   - `onSubmit` hace `preventDefault` y *shake* si algún campo está vacío. Si no, deja que siga la acción.
   - El *shake* también se dispara cuando llega un estado `error` nuevo.
   - «ENVIAR OTRO MENSAJE» vuelve al estado inicial remontando el formulario con una `key` nueva y vaciando los campos.
   - Montarlo en `app/about/page.tsx`.
8. **Prueba real.** Rellenar `.env.local` con la API key de Resend y `CONTACT_TO_EMAIL`, y enviar un mensaje desde `/about`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores, también sin `.env.local`.
- [ ] `npm run lint` termina sin errores.
- [ ] `/about` muestra la página (no la 404) con el hero, el separador y la sección de contacto, en ese orden.
- [ ] El hero muestra «▸ ACERCA DE», «ACERCA DE ARCADE VAULT», el párrafo de misión y 3 *highlights* (magenta, cian y verde) con su icono.
- [ ] El separador muestra 24 píxeles parpadeantes.
- [ ] La columna de contacto muestra «CONTÁCTANOS» y los 3 *tips*: RESPUESTA EN 24-48H, SUGERENCIAS BIENVENIDAS y SIN SPAM, JAMÁS.
- [ ] Clicar la etiqueta NOMBRE enfoca el campo de nombre (igual para CORREO ELECTRÓNICO y MENSAJE).
- [ ] Enviar con algún campo vacío hace *shake* y no hace ninguna petición al servidor.
- [ ] Mientras se envía, el botón muestra «▸ TRANSMITIENDO…» y está deshabilitado.
- [ ] Con un correo `a@b` (desactivando la validación del navegador) aparece `✖ CORREO ELECTRÓNICO NO VÁLIDO.` y los campos conservan lo escrito.
- [ ] Sin `RESEND_API_KEY` aparece `✖ ERROR: NO SE PUDO ENVIAR. INTÉNTALO DE NUEVO.` y el servidor registra el motivo en la consola.
- [ ] Con `.env.local` configurado, enviar `NEONFOX` / correo propio / un mensaje muestra la terminal con `GRACIAS, NEONFOX.`.
- [ ] Ese envío llega a `CONTACT_TO_EMAIL` con el asunto `[Arcade Vault] Nuevo mensaje de NEONFOX`.
- [ ] El correo recibido tiene como «responder a» el correo escrito en el formulario.
- [ ] Un mensaje con `<b>hola</b>` llega mostrando el texto literal, sin negrita.
- [ ] «ENVIAR OTRO MENSAJE» vuelve al formulario con los tres campos vacíos.
- [ ] Rellenar el campo `website` desde las herramientas de desarrollo muestra la terminal de éxito y no llega ningún correo.
- [ ] El campo `website` no es visible ni alcanzable con Tab.
- [ ] Ni `RESEND_API_KEY` ni `CONTACT_TO_EMAIL` aparecen en el JS servido al navegador (buscar en `.next/static`).
- [ ] `.env.template` está versionado y `.env.local` no.
- [ ] El título de la pestaña en `/about` es `Acerca de · Arcade Vault`.
- [ ] «Acerca de» aparece activo en la barra en `/about`.
- [ ] Con «reducir movimiento» activado, todo se ve sin hacer scroll y los píxeles del separador no parpadean.
- [ ] A 400 px de ancho no hay scroll horizontal en `/about` y los *highlights* y el contacto se apilan en una columna.
- [ ] No aparecen errores de hidratación en la consola en `/about`.
- [ ] La única dependencia nueva en `package.json` es `resend`.

## Decisiones

- **Sí:** Server Action con `useActionState`. Es lo idiomático en Next 16, no expone un endpoint público y da los estados pendiente y error sin código extra.
- **No:** Route Handler en `/api/contact`. Más código y un endpoint público más que proteger, sin un segundo consumidor que lo justifique.
- **Sí:** remitente, destinatario y clave en variables de entorno, con `onboarding@resend.dev` como remitente por defecto. Funciona sin dominio verificado.
- **Sí:** `replyTo` con el correo del usuario. El equipo responde directamente desde su bandeja.
- **No:** usar el correo del usuario como `from`. Resend lo rechazaría por no estar verificado.
- **Sí:** texto plano más HTML mínimo escapado. Sin dependencias y legible en cualquier cliente de correo.
- **No:** React Email. Añade dependencias para un correo interno de cuatro líneas.
- **No:** correo de confirmación al usuario. Sin dominio verificado no llegaría, y permitiría usar el formulario para enviar correos a terceros.
- **Sí:** validación en cliente (como la plantilla) y en servidor (la que manda). El cliente da la respuesta inmediata y el servidor no confía en nadie.
- **No:** Zod. La validación son cuatro reglas y no justifica una dependencia directa.
- **Sí:** el error se muestra encima del botón y se conservan los datos. El usuario reintenta sin volver a escribir.
- **No:** una terminal de error. Ocultaría el formulario y obligaría a un paso extra para reintentar.
- **Sí:** honeypot que responde éxito en silencio. Frena bots básicos sin dar pistas y sin coste.
- **No:** *rate limiting* en memoria. No es fiable en *serverless* porque cada instancia tiene su propia memoria.
- **Sí:** si falta la configuración se devuelve el error genérico y se registra en el servidor. Una configuración rota se ve enseguida.
- **No:** un modo simulado en desarrollo. Podría ocultar que la configuración está rota.
- **Sí:** crear el cliente de Resend dentro de la acción. El build no depende de tener la clave.
- **Sí:** reutilizar `RevealOnScroll` de SPEC 02. Es el mismo observador que el `useEffect` de la plantilla.
- **Sí:** asociar las etiquetas a sus campos y añadir `name`. Se desvía de la plantilla, pero es necesario para la accesibilidad y para `FormData`.
- **Sí:** portar el CSS a `app/globals.css`, igual que SPEC 01 y SPEC 02. Un solo lugar para el tema.
- **Sí:** la página es de servidor y solo `ContactForm` es cliente. Casi todo el HTML llega renderizado.

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| Con `onboarding@resend.dev`, Resend solo entrega al correo de la cuenta de Resend | Usar ese correo como `CONTACT_TO_EMAIL` hasta verificar un dominio. Documentarlo en `.env.template`. |
| La API key se filtra al cliente o al repositorio | Solo se lee en la Server Action, sin prefijo `NEXT_PUBLIC_`. `.env.local` está ignorado y hay un criterio de aceptación que busca la clave en `.next/static`. |
| Inyección de HTML en el correo con el contenido del mensaje | Escapar los tres campos antes de construir el HTML. Hay un criterio de aceptación con `<b>`. |
| Inyección de cabeceras con saltos de línea en el nombre | El asunto sustituye los saltos de línea por espacios. |
| Abuso del formulario para llenar la bandeja del equipo | Honeypot y límites de longitud. El *rate limiting* queda para otra spec si hace falta. |
| React reinicia los formularios tras una acción y se pierden los datos ante un error | Los campos son controlados, así que su valor vive en el estado del componente y no se pierde. |
| La API de `useActionState` o de las Server Actions difiere en Next 16 | Consultar `node_modules/next/dist/docs/` (pasos 1 y 4) antes de escribir código. |
| El CSS portado choca con clases existentes (`.highlight`, `.field`, `.tip`) | Buscar cada selector en `globals.css` antes de pegar. |

## Qué **no** incluye esta spec

- Correo de confirmación al usuario.
- *Rate limiting* o CAPTCHA.
- Guardar los mensajes o un panel para leerlos.
- React Email o plantillas de correo elaboradas.
- Un dominio verificado en Resend.
- Cambios en la barra de navegación.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
