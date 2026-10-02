# SPEC 02 — Home (landing page) de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-10-01
> **Objetivo:** Implementar en `/` la landing page de `references/templates/home-about/home.jsx` y mover la Biblioteca y las pantallas de juego bajo `/games`.

## Por qué existe esta spec

En SPEC 01 la Biblioteca ocupa `/`. La nueva plantilla `references/templates/home-about/` añade una landing page de marketing que pasa a ser la portada, así que la Biblioteca necesita su propia ruta.
Aprovechando el cambio, las rutas de juego pasan de `/juegos/...` a `/games/...` para que todo el catálogo cuelgue del mismo prefijo.

Hallazgos sobre la plantilla que condicionan el trabajo:

- Esta vez los nombres de archivo **sí** coinciden con su contenido (`home.jsx` → `Home`, `nav.jsx` → `Nav`, `about.jsx` → `About`).
- `styles.css` es un superconjunto del tema actual. Las secciones `HOME PAGE` (líneas 930–1070), `ACTIVITY` (1621–1671) y `PRICING` (1672–final) **no** están en `app/globals.css`.
- Las secciones `ABOUT PAGE`, `GAMEPAD` y `Theme variants` de `styles.css` no las usa el Home y no se portan.
- `arcade-vault-standalone.html` es un *bundle* empaquetado del prototipo. Solo sirve como referencia visual.
- `nav.jsx` añade los enlaces «Inicio» y «Acerca de» respecto a la barra de SPEC 01.

## Alcance

**Dentro:**

- Nuevo mapa de rutas:
  - `/` → Home (landing).
  - `/games` → Biblioteca (el hero con parpadeo y el componente `Library` actuales, sin cambios visuales).
  - `/games/[id]` → Detalle.
  - `/games/[id]/play` → Reproductor.
  - `/auth` y `/salon` se mantienen.
- Eliminar `app/juegos/` por completo, sin redirecciones. `/juegos/...` pasa a mostrar la 404 temática.
- El Home con sus siete bloques, fiel a la plantilla:
  1. **Hero:** siluetas pixel flotantes (8 SVG decorativos), «▸ INSERTA UNA MONEDA_» con parpadeo, el título en tres líneas «EL ARCADE / CLÁSICO ESTÁ / DE VUELTA», el subtítulo, los botones «▶ EXPLORAR JUEGOS» (→ `/games`) y «✦ CREAR CUENTA» (→ `/auth?tab=registro`) y el indicador «DESLIZA ▼».
  2. **// 01 ¿POR QUÉ ARCADE VAULT?:** cuatro `feature-card` (JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS, SIEMPRE CRECIENDO) con sus iconos pixel SVG y colores cian, amarillo, magenta y verde.
  3. **// 02 JUEGOS DISPONIBLES AHORA:** los 6 primeros juegos de `GAMES` como `mini-card`, cada una enlazada a `/games/[id]`, y el botón «VER TODOS LOS JUEGOS →» (→ `/games`).
  4. **Estadísticas:** «12+ JUEGOS · Y CONTANDO», «MILES DE PARTIDAS · JUGADAS CADA DÍA», «GLOBAL RANKING · COMPITE CON EL MUNDO». El «12+» es texto literal.
  5. **// 03 ACTIVIDAD EN VIVO:** la tarjeta «▸ ÚLTIMAS PUNTUACIONES» con 7 filas y la tarjeta «▸ TOP JUGADORES · HOY» con 5 filas, barras de progreso y el enlace «VER SALÓN →» (→ `/salon`).
  6. **// 04 PRECIOS:** la tarjeta «JUGADOR VAULT · $0 / SIEMPRE» con 6 ventajas, el botón «EMPEZAR GRATIS →» (→ `/auth?tab=registro`), el sello «FREE PLAY» y las 3 preguntas frecuentes.
  7. **CTA final:** «¿LISTO PARA JUGAR?» con el botón «INSERTAR MONEDA →» (→ `/games`) y la línea «Gratis. Sin registro obligatorio. Empieza en segundos.».
- Animación de entrada al hacer scroll: las secciones con `.reveal` reciben la clase `in` al entrar en pantalla (umbral `0.12`), una sola vez.
- Con `prefers-reduced-motion: reduce`:
  - Las secciones `.reveal` se ven de inmediato.
  - Se desactivan la flotación de las siluetas, el `pulse` de los botones y la animación de las filas del *ticker*.
- La barra de navegación con cuatro enlaces, en escritorio y en el panel móvil: «Inicio» (`/`), «Biblioteca» (`/games`), «Salón de la Fama» (`/salon`) y «Acerca de» (`/about`).
  - «Inicio» se marca activo solo en `/`.
  - «Biblioteca» se marca activo en `/games` y `/games/*`.
  - «Acerca de» se marca activo en `/about`. Esa ruta muestra la 404 temática hasta que exista su spec.
- `AuthForm` acepta una pestaña inicial: `/auth?tab=registro` abre CREAR CUENTA. Cualquier otro valor (o ninguno) abre INICIAR SESIÓN.
- Actualizar todos los enlaces internos a las nuevas rutas (ver tabla en el plan).
- Portar a `app/globals.css` las secciones `HOME PAGE`, `ACTIVITY` y `PRICING` de `styles.css`, más el bloque de `prefers-reduced-motion`.
- Metadatos: `/` con el título `Arcade Vault · Portal Retro`, y `/games` con `Biblioteca · Arcade Vault`.
- Diseño adaptable hasta 400 px de ancho, con los *breakpoints* que trae `styles.css`.

**Fuera de alcance (para specs futuras):**

- La página Acerca de y su formulario de contacto (`about.jsx`). Va en su propia spec. Aquí solo se añade el enlace.
- Datos reales o en vivo en ACTIVIDAD EN VIVO. Las filas son constantes fijas.
- Que «12+» refleje el número real de juegos.
- Redirecciones desde `/juegos/...`.
- El mando virtual (`GAMEPAD`) y las variantes de tema de `styles.css`.
- Cambios visuales en la Biblioteca, el Detalle, el Reproductor, el Acceso o el Salón más allá de sus enlaces.
- Tests automatizados.

## Modelo de datos

El catálogo (`lib/games.ts`) y las puntuaciones (`lib/scores.ts`) de SPEC 01 no cambian.
El Home añade constantes mock tipadas, portadas tal cual desde `home.jsx`:

```ts
// lib/home.ts
import type { GameColor } from "@/lib/games";

export type Feature = {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;       // "JUEGOS CLÁSICOS"
  desc: string;
  color: GameColor;    // "cyan" | "yellow" | "magenta" | "green"
};

export type HomeStat = { n: string; u: string; s: string }; // { n: "12+", u: "JUEGOS", s: "Y CONTANDO" }

export type RecentScore = {
  player: string;      // "NEONFOX"
  game: string;        // "Caída" (texto, no id)
  score: number;       // 184220
  ago: string;         // "hace 2 min"
  color: GameColor;
};

export type TopPlayer = { rank: number; player: string; score: number };

export type Faq = { q: string; a: string };

export const FEATURES: Feature[];          // 4
export const HOME_STATS: HomeStat[];       // 3
export const RECENT_SCORES: RecentScore[]; // 7
export const TOP_PLAYERS: TopPlayer[];     // 5
export const PRICING_PERKS: string[];      // 6, sin el «✔» (lo pone el render)
export const FAQS: Faq[];                  // 3
```

Convenciones:

- Los números se formatean con `toLocaleString("es-ES")`, igual que en SPEC 01.
- Las puntuaciones recientes se muestran con prefijo `+`.
- El ancho de la barra del top es `100 - índice * 16` por ciento, como en la plantilla.
- Las clases `top1`, `top2` y `top3` se aplican a los tres primeros puestos.
- Los retrasos escalonados de la plantilla se mantienen: 80 ms en las features, 90 ms en las estadísticas y 60 ms en el *ticker*.
- El parámetro de la pestaña de registro es exactamente `tab=registro`.

## Plan de implementación

1. **Mover las rutas de juego.**
   - Mover `app/juegos/[id]/page.tsx` a `app/games/[id]/page.tsx` y `app/juegos/[id]/jugar/page.tsx` a `app/games/[id]/play/page.tsx`. Borrar `app/juegos/`.
   - Actualizar los tipos a `PageProps<"/games/[id]">` y `PageProps<"/games/[id]/play">`.
   - Actualizar los enlaces según esta tabla:

     | Archivo | Enlace | Antes | Después |
     | ------- | ------ | ----- | ------- |
     | `components/GameCard.tsx` | tarjeta y JUGAR | `/juegos/[id]` | `/games/[id]` |
     | `app/games/[id]/page.tsx` | JUGAR | `/juegos/[id]/jugar` | `/games/[id]/play` |
     | `app/games/[id]/page.tsx` | VOLVER | `/` | `/games` |
     | `components/GamePlayer.tsx` | SALIR | `/juegos/[id]` | `/games/[id]` |
     | `components/HallOfFame.tsx` | VOLVER A LA BIBLIOTECA | `/` | `/games` |

   - `GamePlayer` «VOLVER AL VAULT», `not-found` y la redirección tras login siguen apuntando a `/`.
   - Verificar: `/games/caida` y `/games/caida/play` funcionan, y `/juegos/caida` muestra la 404.
2. **Mover la Biblioteca.**
   - Crear `app/games/page.tsx` con el contenido actual de `app/page.tsx` (hero + `Library`) y su `metadata`.
   - Dejar `app/page.tsx` como un *placeholder* mínimo para que el build siga pasando.
   - Verificar: `/games` muestra las 8 tarjetas y el filtro sigue funcionando.
3. **Barra de navegación.**
   - En `components/Nav.tsx`, ampliar `Section` a `"inicio" | "biblioteca" | "salon" | "about" | "auth"` y reescribir `sectionOf` según el alcance.
   - Añadir «Inicio» y «Acerca de» en la barra y en el panel móvil, en el orden de la plantilla.
   - Verificar: el enlace activo es correcto en `/`, `/games`, `/games/caida` y `/salon`. A 400 px el panel muestra los 5 enlaces.
4. **Pestaña inicial del Acceso.**
   - `app/auth/page.tsx` lee `searchParams` (asíncrono en esta versión de Next; consultar `node_modules/next/dist/docs/` antes) y pasa `initialTab` a `AuthForm`.
   - `AuthForm` usa `initialTab` como valor inicial del estado `tab` (`"up"` si `tab=registro`, si no `"in"`).
   - Verificar: `/auth?tab=registro` muestra el campo de correo y `/auth` no.
5. **CSS del Home.** Portar a `app/globals.css` las secciones `HOME PAGE`, `ACTIVITY` y `PRICING` de `styles.css`, más un bloque `@media (prefers-reduced-motion: reduce)` para `.reveal`, `.silo`, `.pulse` y `.tick-row`. Verificar: `npm run build` pasa.
6. **Datos del Home.** Crear `lib/home.ts` con los tipos y constantes del modelo de datos. Verificar: `npx tsc --noEmit` pasa.
7. **Componentes decorativos.** Crear `components/home/FloatingSilhouettes.tsx` y `components/home/FeatureIcon.tsx` como componentes de servidor con los SVG de la plantilla (`aria-hidden`).
8. **Animación de scroll.** Crear `components/home/RevealOnScroll.tsx` (cliente). Observa los `.reveal` del documento con `IntersectionObserver`, añade `in` una vez y desconecta en el *cleanup*. Si `prefers-reduced-motion` está activo, añade `in` a todos de inmediato.
9. **Home: hero, por qué y juegos.**
   - Reescribir `app/page.tsx` como componente de servidor con el hero, la sección `// 01` y la sección `// 02`.
   - Crear `components/home/MiniCard.tsx` como `Link` a `/games/[id]`.
   - Montar `RevealOnScroll`.
   - Verificar: los CTA navegan a `/games` y a `/auth?tab=registro`, y las mini cards al Detalle.
10. **Home: estadísticas, actividad, precios y CTA final.** Completar `app/page.tsx` con las cuatro secciones restantes usando `lib/home.ts`. Añadir la `metadata` de `/`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] `/` muestra el Home con sus 7 bloques en el orden de la plantilla.
- [ ] El hero muestra 8 siluetas, el título en 3 líneas y los botones EXPLORAR JUEGOS y CREAR CUENTA.
- [ ] EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA navegan a `/games`.
- [ ] CREAR CUENTA y EMPEZAR GRATIS navegan a `/auth?tab=registro`, que abre la pestaña CREAR CUENTA con el campo de correo visible.
- [ ] `/auth` sin parámetros abre INICIAR SESIÓN.
- [ ] La sección `// 02` muestra exactamente 6 mini cards (BLOQUE BUSTER, CAÍDA, SERPENTINA, GLOTÓN, INVASORES, ROCAS).
- [ ] Clicar la mini card CAÍDA navega a `/games/caida`.
- [ ] ÚLTIMAS PUNTUACIONES muestra 7 filas y la primera es `NEONFOX ▸ Caída +184.220 hace 2 min`.
- [ ] TOP JUGADORES muestra 5 filas y la primera es `#01 NEONFOX 312.840`.
- [ ] VER SALÓN → navega a `/salon`.
- [ ] La sección PRECIOS muestra `$0`, las 6 ventajas, el sello FREE PLAY y las 3 preguntas.
- [ ] Al hacer scroll, cada sección `.reveal` aparece con su animación una sola vez.
- [ ] Con «reducir movimiento» activado en el sistema, todas las secciones son visibles sin hacer scroll y las siluetas no se mueven.
- [ ] `/games` muestra la Biblioteca con las 8 tarjetas, y clicar una tarjeta navega a `/games/[id]`.
- [ ] En el Detalle, JUGAR navega a `/games/[id]/play` y VOLVER a `/games`.
- [ ] En el Reproductor, SALIR navega a `/games/[id]`.
- [ ] En el Salón, VOLVER A LA BIBLIOTECA navega a `/games`.
- [ ] `/juegos/caida`, `/juegos/caida/jugar` y `/games/no-existe` muestran la 404 temática.
- [ ] La barra muestra Inicio, Biblioteca, Salón de la Fama y Acerca de, y el panel móvil además Iniciar Sesión o Cuenta.
- [ ] «Inicio» está activo solo en `/`, y «Biblioteca» en `/games` y `/games/caida/play`.
- [ ] «Acerca de» navega a `/about`, que muestra la 404 temática.
- [ ] El título de la pestaña en `/` es `Arcade Vault · Portal Retro` y en `/games` es `Biblioteca · Arcade Vault`.
- [ ] A 400 px de ancho no hay scroll horizontal en `/`.
- [ ] No aparecen errores de hidratación en la consola en `/` ni en `/games`.
- [ ] No queda ninguna referencia a `/juegos` en `app/`, `components/` ni `lib/`.
- [ ] No se añadieron dependencias nuevas a `package.json`.

## Decisiones

- **Sí:** el Home ocupa `/` como landing y la Biblioteca pasa a `/games`. Es lo que pide la plantilla, que separa portada y catálogo.
- **Sí:** mover Detalle y Reproductor a `/games/[id]` y `/games/[id]/play`. Todo el catálogo cuelga del mismo prefijo.
- **No:** mantener `/juegos/[id]`. Dejaría URLs mezcladas (`/games` y `/juegos`) para la misma sección.
- **No:** redirecciones desde `/juegos/...`. El proyecto no está publicado, así que no hay enlaces externos que preservar.
- **Sí:** el enlace «Acerca de» apunta ya a `/about`, aunque muestre la 404 hasta su spec. Así la barra queda igual que la plantilla desde ahora.
- **No:** implementar Acerca de en esta spec. Tiene formulario y validación propios y merece su propia spec.
- **Sí:** constantes fijas tipadas en `lib/home.ts` para ACTIVIDAD EN VIVO, precios y preguntas. Es fiel al texto de la plantilla y se puede sustituir por una API sin tocar la UI.
- **No:** derivar la actividad de `seededScores`. Se alejaría del texto exacto de la plantilla sin aportar nada mientras no haya puntuaciones reales.
- **Sí:** «12+» como texto literal. Es copy de marketing, no un contador.
- **Sí:** portar el CSS del Home a `app/globals.css`, igual que en SPEC 01. Un solo lugar para el tema.
- **No:** un `app/home.css` aparte. Partiría el tema en dos sitios sin necesidad.
- **Sí:** respetar `prefers-reduced-motion` mostrando todo sin animar. Evita contenido invisible y es más accesible.
- **Sí:** `/auth?tab=registro` abre CREAR CUENTA. Coincide con lo que promete el botón.
- **Sí:** la pestaña inicial se lee en `app/auth/page.tsx` desde `searchParams` y llega a `AuthForm` como prop.
- **No:** `useSearchParams` dentro de `AuthForm`. Obliga a envolverlo en `<Suspense>` y complica el componente.
- **Sí:** el Home es un componente de servidor. Solo `RevealOnScroll` es cliente, así que casi todo el HTML llega renderizado.
- **Sí:** `RevealOnScroll` funciona como un único observador para toda la página, igual que el `useReveal` de la plantilla.
- **No:** un componente envoltorio por sección. Sería más código para el mismo efecto.

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| Las secciones `.reveal` empiezan invisibles (`opacity: 0`) y, si el JS falla o tarda, el contenido no se ve | `RevealOnScroll` añade `in` a lo que ya está en pantalla al montarse, y con `prefers-reduced-motion` a todo. Probar que el primer bloque bajo el hero aparece sin hacer scroll en una pantalla alta. |
| Enlaces olvidados a `/juegos` tras el movimiento | El criterio de aceptación exige que no quede ninguna referencia. Buscar `/juegos` con grep antes de cerrar. |
| Los tipos `PageProps<"/games/...">` no existen hasta regenerar `.next/types` | Ejecutar `next dev` o `next build` tras mover las rutas, antes de `tsc`. |
| `searchParams` asíncrono vuelve dinámica la ruta `/auth` | Es aceptable: `/auth` es un formulario de cliente. Consultar `node_modules/next/dist/docs/` para la firma correcta. |
| El CSS portado choca con clases existentes (`.kicker`, `.lb-link`, `.stat-block`) | Antes de pegar, buscar cada selector nuevo en `globals.css`. Ninguno de los comprobados existe hoy. |
| Las siluetas flotantes o el sello `FREE PLAY` provocan scroll horizontal en móvil | El hero usa `overflow: hidden` como en la plantilla. Hay un criterio de aceptación a 400 px. |

## Qué **no** incluye esta spec

- La página Acerca de y su formulario de contacto.
- Datos reales en ACTIVIDAD EN VIVO o en las estadísticas.
- Redirecciones desde las rutas `/juegos/...`.
- El mando virtual y las variantes de tema.
- Cambios visuales en las pantallas de SPEC 01.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
