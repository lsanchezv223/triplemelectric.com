"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      smoothWheel: true
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
