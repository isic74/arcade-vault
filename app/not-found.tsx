import Link from "next/link";

export default function NotFound() {
  return (
    <section className="av-hero fade-in pb-20">
      <h1 className="flicker">404</h1>
      <div className="sub">
        NIVEL NO ENCONTRADO <span className="blink">_</span>
      </div>
      <p className="mx-auto mt-6 mb-10 max-w-md text-ink-dim">
        Este cartucho no está en el vault. Revisa la dirección o vuelve a la biblioteca para elegir
        otro juego.
      </p>
      <Link href="/" className="btn magenta lg">
        VOLVER A LA BIBLIOTECA
      </Link>
    </section>
  );
}
