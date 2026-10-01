# SPEC 01 — MVP visual de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-09-28
> **Objetivo:** Implementar en Next.js las cinco pantallas de `references/templates/` (Biblioteca, Detalle, Reproductor, Acceso y Salón de la Fama) como interfaz navegable con datos mock, sin ningún juego real.

## Por qué existe esta spec

Las plantillas son un prototipo en React 18 con Babel en el navegador y un router en el hash de la URL.
Esta spec las porta a la arquitectura real del proyecto (App Router, TypeScript, Tailwind v4) para tener la base visual sobre la que se construirán los juegos.

Hallazgos sobre las plantillas que condicionan el trabajo:

- **Los nombres de archivo están cruzados.** El contenido real de cada archivo es este:

  | Archivo              | Contiene realmente                          |
  | -------------------- | ------------------------------------------- |
  | `Arcade Vault.html`  | `biblioteca.jsx` (`Library`, `GameCard`)    |
  | `app.jsx`            | El HTML de arranque                         |
  | `auth.jsx`           | `nav.jsx` (`Nav`)                           |
  | `biblioteca.jsx`     | `data.jsx` (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) |
  | `data.jsx`           | El CSS del tema                             |
  | `detalle.jsx`        | `auth.jsx` (`Auth`)                         |
  | `nav.jsx`            | `app.jsx` (`App`, router y footer)          |
  | `salon.jsx`          | `reproductor.jsx` (`GamePlayer`)            |
  | `styles.css`         | `salon.jsx` (`HallOfFame`)                  |

- **No existe el JSX de `GameDetail`.** Solo están sus estilos (`.av-detail`, `.detail-cover`, `.detail-info`, `.detail-tags`, `.stat-strip`, `.detail-actions`, `.leaderboard`, `.lb-row`). La pantalla de Detalle se diseña a partir de esas clases.
- El CSS del tema ya está en `app/globals.css` y las fuentes ya están en `app/layout.tsx`. Ese trabajo quedó hecho en un commit anterior (`c707759`).

## Alcance

**Dentro:**

- Rutas reales de App Router:
  - `/` → Biblioteca.
  - `/juegos/[id]` → Detalle.
  - `/juegos/[id]/jugar` → Reproductor.
  - `/auth` → Acceso.
  - `/salon` → Salón de la Fama.
- Una barra de navegación compartida con el logo, los enlaces, el contador de créditos, el botón de sesión y el menú hamburguesa móvil con su panel lateral.
- El footer `© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0`.
- La Biblioteca: el hero con parpadeo, la búsqueda por nombre, los chips de categoría, la grilla de tarjetas con efecto *tilt* 3D al mover el mouse y el estado vacío «NO HAY RESULTADOS».
- El Detalle, construido desde el CSS existente:
  - La portada 16:10 con la clase `cover-*` del juego.
  - El título, las etiquetas (categoría y partidas) y la descripción larga (`long`).
  - El `stat-strip` con MEJOR PUNTUACIÓN, PARTIDAS y CATEGORÍA.
  - Los botones JUGAR (lleva a `/juegos/[id]/jugar`) y VOLVER (lleva a `/`).
  - El `leaderboard` «TOP 10» con `seededScores`, con los tres primeros puestos en oro, plata y bronce.
- El Reproductor con simulación visual idéntica a la plantilla:
  - El HUD muestra jugador, puntuación, vidas y nivel.
  - La puntuación falsa sube cada 220 ms y el nivel sube cada 2 500 puntos (`nivel = 1 + floor(puntuación / 2500)`). A diferencia de la plantilla, cuya regla `score % 2500 < 100` subía de nivel al arrancar y a veces saltaba dos niveles de golpe.
  - PAUSA/REANUDAR muestra y oculta la capa «EN PAUSA».
  - FIN abre el modal «FIN DEL JUEGO».
  - SALIR vuelve al Detalle.
  - La arena CSS animada se muestra dentro del marco CRT.
  - El modal permite editar las iniciales. GUARDAR PUNTUACIÓN muestra el toast «▸ PUNTUACIÓN GUARDADA_». JUGAR DE NUEVO reinicia el estado y VOLVER AL VAULT lleva a `/`.
- El Acceso:
  - Las pestañas INICIAR SESIÓN y CREAR CUENTA. El campo de correo aparece solo en CREAR CUENTA.
  - Login falso: cualquier usuario y contraseña entran.
  - JUGAR COMO INVITADO.
  - Los botones de Google y GitHub son decorativos.
- El Salón de la Fama:
  - Las pestañas por juego y el podio 02 / 01 / 03.
  - La tabla de 12 filas con animación escalonada y el botón VOLVER A LA BIBLIOTECA.
  - La fila «TU MEJOR MARCA» solo aparece si hay sesión.
- Sesión falsa persistida en `localStorage` con la clave `av_user`:
  - Con sesión, la barra muestra `NOMBRE ▾`. Al pulsarlo se cierra la sesión.
  - Sin sesión, la barra muestra «Iniciar Sesión».
- Un `app/not-found.tsx` con estética arcade para ids de juego inexistentes.
- Un diseño adaptable hasta 400 px de ancho, con los *breakpoints* que ya están en `globals.css`.

**Fuera de alcance (para specs futuras):**

- Cualquier juego real o lógica de juego (canvas, colisiones, controles).
- La persistencia de puntuaciones. GUARDAR PUNTUACIÓN no escribe `av_scores` ni ningún otro dato.
- Autenticación real, backend, API o base de datos.
- El login social real con Google o GitHub.
- Un menú de cuenta desplegable. El botón `NOMBRE ▾` solo cierra la sesión.
- La lógica de los créditos. El contador muestra siempre `CRÉDITOS · 03`.
- Tests automatizados (unitarios o E2E con Playwright).
- El panel de *tweaks* (las clases `.tw-*` existen pero no se usan).

## Modelo de datos

Los datos mock se portan tal cual desde la plantilla (el archivo que en realidad contiene `data.jsx`), ahora tipados.

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export type Game = {
  id: string;          // slug, se usa en la URL: "bloque-buster"
  title: string;       // "BLOQUE BUSTER"
  short: string;       // descripción corta de la tarjeta
  long: string;        // descripción larga del Detalle
  cat: GameCategory;
  cover: `cover-${string}`; // clase CSS de portada: "cover-bricks"
  color: GameColor;    // color del botón JUGAR
  best: number;        // mejor puntuación mostrada
  plays: string;       // "12.4K"
};

export const GAMES: Game[];                             // los 8 juegos de la plantilla
export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;
export function getGame(id: string): Game | undefined;
```

```ts
// lib/scores.ts
export type ScoreRow = { rank: number; name: string; score: number; date: string }; // date "DD/MM/2026"

export const PLAYERS: string[];                        // los 18 alias de la plantilla
export function seededScores(seed: number, count?: number): ScoreRow[]; // determinista, count = 12
```

```ts
// lib/session.ts — sesión falsa en el cliente
export type User = { name: string };                   // name en mayúsculas, máximo 10 caracteres
export const SESSION_KEY = "av_user";
export function useUser(): User | null;                // lee localStorage y reacciona a los cambios
export function signIn(user: User): void;
export function signOut(): void;
```

Convenciones:

- Los números se formatean con `toLocaleString("es-ES")`, igual que en la plantilla.
- La semilla del Salón es `id.length * 23 + 7`, igual que en la plantilla.
- La semilla del leaderboard del Detalle es `id.length * 31 + 3`, para que no coincida con el Salón.
- `seededScores` es determinista, así que el servidor y el cliente producen las mismas filas y no hay errores de hidratación.

## Plan de implementación

1. **Datos.** Crear `lib/games.ts` y `lib/scores.ts` con los tipos y los datos portados. Verificar: `npx tsc --noEmit` pasa.
2. **Sesión.** Crear `lib/session.ts`, un módulo de cliente que implementa `useUser` con `useSyncExternalStore` sobre `localStorage` y un evento propio. `signIn` y `signOut` notifican a los suscriptores. El *snapshot* del servidor es `null`.
3. **Shell.**
   - Crear `components/Nav.tsx` (cliente). Usa `usePathname` para marcar el enlace activo. Biblioteca queda activa en `/` y en `/juegos/*`.
   - Crear `components/Footer.tsx`.
   - Montar ambos en `app/layout.tsx` alrededor de `<main className="av-main">`.
   - Verificar: `/` muestra la barra y el footer, y el menú hamburguesa abre y cierra en 400 px.
4. **Biblioteca.**
   - Reemplazar `app/page.tsx` por el hero y un componente cliente `components/Library.tsx` con la búsqueda, los chips y la grilla.
   - Crear `components/GameCard.tsx` (cliente, con el *tilt* y un `Link` a `/juegos/[id]`).
   - Verificar: filtrar por «caí» deja solo CAÍDA, y el chip VERSUS deja solo DUELO PIXEL.
5. **Página 404.** Crear `app/not-found.tsx` con estética arcade y un botón hacia `/`.
6. **Detalle.**
   - Crear `app/juegos/[id]/page.tsx` (servidor).
   - `params` es asíncrono en esta versión de Next, así que hay que consultar `node_modules/next/dist/docs/` antes de escribirlo.
   - Implementar `generateStaticParams` con los 8 ids y llamar a `notFound()` si el id no existe.
   - Maquetar portada, info, `stat-strip`, acciones y `leaderboard`.
   - Verificar: `/juegos/caida` se ve completa y `/juegos/xyz` muestra la 404.
7. **Reproductor.**
   - Crear `app/juegos/[id]/jugar/page.tsx` (servidor, valida el id) y `components/GamePlayer.tsx` (cliente).
   - Portar el HUD, el CRT, la arena, la pausa y el modal de fin. El nombre inicial es `user.name` o `INVITADO`.
   - Verificar: la puntuación sube, la pausa la detiene, FIN abre el modal y GUARDAR muestra el toast.
8. **Acceso.**
   - Crear `app/auth/page.tsx` con `components/AuthForm.tsx` (cliente).
   - Al enviar el formulario se llama `signIn({ name })` con el usuario en mayúsculas (máximo 10 caracteres, `PLAYER1` si está vacío) y se hace `router.push("/")`.
   - INVITADO llama `signOut()` y lleva a `/`.
   - Verificar: tras entrar, la barra muestra el nombre, y al recargar se mantiene.
9. **Salón.**
   - Crear `app/salon/page.tsx` con `components/HallOfFame.tsx` (cliente).
   - Incluir las pestañas por juego, el podio, la tabla y la fila «TU MEJOR MARCA» si `useUser()` devuelve un usuario.
   - Verificar: al cambiar de pestaña cambian las filas, y la fila propia solo aparece con sesión.
10. **Metadatos.** Añadir `metadata` o `generateMetadata` por ruta con títulos del estilo `CAÍDA · Arcade Vault`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Las rutas `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth` y `/salon` existen y renderizan.
- [ ] `/` muestra las 8 tarjetas de juego.
- [ ] Escribir «caí» en la búsqueda deja solo la tarjeta CAÍDA.
- [ ] Seleccionar el chip SHOOTER deja exactamente INVASORES y ROCAS.
- [ ] Una búsqueda sin coincidencias muestra «NO HAY RESULTADOS».
- [ ] Clicar una tarjeta o su botón JUGAR navega a `/juegos/[id]`.
- [ ] El Detalle muestra la portada, el título, la descripción larga, las 3 estadísticas, los botones JUGAR y VOLVER y un leaderboard de 10 filas.
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` muestran la 404 temática con un enlace a `/`.
- [ ] En el Reproductor la puntuación aumenta sola, y PAUSA la congela y muestra «EN PAUSA».
- [ ] FIN abre el modal con la puntuación final.
- [ ] GUARDAR PUNTUACIÓN reemplaza la fila del input por el toast.
- [ ] JUGAR DE NUEVO deja la puntuación en 0, las vidas en 3 y el nivel en 01.
- [ ] SALIR lleva al Detalle del mismo juego.
- [ ] Entrar con el usuario `neonfox` deja `av_user` en `localStorage` y la barra muestra `NEONFOX ▾`.
- [ ] Tras entrar, recargar la página conserva la sesión.
- [ ] Pulsar `NEONFOX ▾` borra `av_user` y la barra vuelve a mostrar «Iniciar Sesión».
- [ ] La pestaña CREAR CUENTA muestra el campo de correo, y INICIAR SESIÓN lo oculta.
- [ ] En `/salon` cambiar de pestaña cambia el podio y la tabla.
- [ ] La fila «TU MEJOR MARCA» solo aparece con sesión iniciada.
- [ ] El enlace activo de la barra se resalta en cian: Biblioteca en `/` y `/juegos/*`, Salón en `/salon`.
- [ ] A 400 px de ancho no hay scroll horizontal en ninguna pantalla.
- [ ] A 400 px el menú hamburguesa abre y cierra el panel lateral.
- [ ] No aparecen errores de hidratación en la consola del navegador en ninguna ruta.
- [ ] No se añadieron dependencias nuevas a `package.json`.

## Decisiones

- **Sí:** rutas reales de App Router. Dan URLs compartibles, el botón atrás funciona y es lo propio de Next.
- **No:** el router en el hash de la plantilla. Desaprovecha Next y rompe el SSR.
- **Sí:** reusar las clases de `app/globals.css` (`card`, `btn magenta`, `crt`…). Es fiel al diseño y requiere poca reescritura.
- **Sí:** los estilos *inline* de la plantilla pasan a utilidades Tailwind del tema (`text-ink-faint`, `font-pixel`…).
- **No:** reescribir todo en Tailwind puro. Supone más trabajo y más riesgo de desviarse del diseño.
- **Sí:** construir el Detalle desde su CSS existente, porque su JSX no está en las plantillas.
- **Sí:** simular el Reproductor igual que la plantilla, con puntaje falso, pausa y modal. Así se muestran todos los estados visuales sin implementar ningún juego.
- **Sí:** login falso con `localStorage` bajo la clave `av_user`, compatible con la plantilla.
- **No:** persistir las puntuaciones (`av_scores`). Nada las leería todavía, así que queda para la spec de puntuaciones.
- **Sí:** datos tipados en `lib/games.ts` y `lib/scores.ts`. Así se pueden sustituir por una API en otra spec sin tocar la UI.
- **Sí:** componentes de servidor por defecto, y `"use client"` solo donde hay estado o eventos (barra, biblioteca, tarjeta, reproductor, acceso y salón).
- **Sí:** verificar con build, lint y un checklist manual.
- **No:** Playwright en esta spec. Añade una dependencia y configuración que merecen su propia spec.
- **Sí:** los botones de Google y GitHub y el contador de créditos son solo decorativos.

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| Errores de hidratación por leer `localStorage` en el render | `useUser` usa `useSyncExternalStore` con *snapshot* de servidor `null`. El nombre del usuario solo aparece después de hidratar. |
| Las APIs de Next 16 difieren de las conocidas (`params` asíncrono, tipos `PageProps`) | Consultar `node_modules/next/dist/docs/` antes de cada archivo de ruta y usar los helpers globales `PageProps<"/juegos/[id]">`. |
| `setInterval` del Reproductor sigue corriendo al salir de la página | Limpiarlo en el *cleanup* del `useEffect`, igual que la plantilla. |
| Portar desde archivos con nombres cruzados lleva a tomar el contenido equivocado | Usar la tabla de «Por qué existe esta spec» como referencia. |
| `localStorage` bloqueado (modo privado) | Envolver los accesos en `try/catch`. La app funciona como invitado. |

## Qué **no** incluye esta spec

- Juegos reales o cualquier lógica de juego.
- La persistencia de puntuaciones y el Salón con datos reales.
- Autenticación real y login social.
- Menú de cuenta, créditos funcionales y panel de *tweaks*.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
