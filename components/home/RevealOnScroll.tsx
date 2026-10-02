"use client";

import { useEffect } from "react";

// Un único observador para toda la página: añade "in" a cada .reveal la primera vez que entra en pantalla.
// IntersectionObserver notifica al observar, así que lo que ya está visible al montar aparece sin hacer scroll.
export default function RevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
