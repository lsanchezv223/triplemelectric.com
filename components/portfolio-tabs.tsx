"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useMemo, useState } from "react";

type PortfolioCategory = "residential" | "commercial" | "industrial";

type PortfolioImage = {
  src: string;
  alt: string;
  category: PortfolioCategory;
};

const images: PortfolioImage[] = [
  { src: "/2023/11/IMG-20231030-WA0127.jpg", alt: "Outdoor lighting solutions", category: "residential" },
  { src: "/2023/11/IMG-20231030-WA0126-1.jpg", alt: "Residential electrician work", category: "residential" },
  { src: "/2023/11/IMG-20231030-WA0085.jpg", alt: "Residential lighting project", category: "residential" },
  { src: "/2023/11/IMG-20231030-WA0084.jpg", alt: "Residential electrical setup", category: "residential" },
  { src: "/2023/11/IMG-20231030-WA0080.jpg", alt: "Home electrical installation", category: "residential" },
  { src: "/2023/11/IMG-20231030-WA0077.jpg", alt: "Residential lighting details", category: "residential" },

  { src: "/2023/11/IMG-20231030-WA0122-1.jpg", alt: "Commercial electrical project", category: "commercial" },
  { src: "/2023/11/IMG-20231030-WA0119.jpg", alt: "Commercial installation", category: "commercial" },
  { src: "/2023/11/IMG-20231030-WA0098-1.jpg", alt: "Commercial lighting", category: "commercial" },
  { src: "/2023/11/IMG-20231030-WA0108-2.jpg", alt: "Commercial service panel", category: "commercial" },
  { src: "/2023/11/IMG-20231030-WA0105.jpg", alt: "Commercial electrical upgrades", category: "commercial" },

  { src: "/2023/11/IMG-20231030-WA0094-1.jpg", alt: "Industrial electrical installation", category: "industrial" },
  { src: "/2023/11/IMG-20231030-WA0096-1.jpg", alt: "Industrial equipment wiring", category: "industrial" },
  { src: "/2023/11/IMG-20231030-WA0097-3.jpg", alt: "Industrial electrical systems", category: "industrial" },
  { src: "/2023/11/IMG-20231030-WA0099.jpg", alt: "Industrial maintenance work", category: "industrial" },
  { src: "/2023/11/IMG-20231030-WA0110-2.jpg", alt: "Electrician working on site", category: "industrial" }
];

const tabMeta: Record<PortfolioCategory, { label: string }> = {
  residential: { label: "Residential" },
  commercial: { label: "Commercial" },
  industrial: { label: "Industrial" }
};

export function PortfolioTabs() {
  const [active, setActive] = useState<PortfolioCategory>("residential");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => images.filter((img) => img.category === active), [active]);
  const selected = selectedIndex !== null ? filtered[selectedIndex] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") setSelectedIndex((prev) => (prev === null ? prev : (prev + 1) % filtered.length));
      if (e.key === "ArrowLeft")
        setSelectedIndex((prev) => (prev === null ? prev : (prev - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered.length, selectedIndex]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slateBlue/90">Our Awesome Work</p>
      <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold md:text-4xl">Our Portfolio</h2>

      <div className="mt-7 flex flex-wrap gap-2.5">
        {(Object.keys(tabMeta) as PortfolioCategory[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.06em] transition ${
              active === key
                ? "bg-[#ff2a5f] text-white shadow-[0_10px_24px_-12px_rgba(255,42,95,0.9)]"
                : "border border-white/25 bg-white/5 text-sand/80 hover:border-white/45 hover:text-sand"
            }`}
          >
            {tabMeta[key].label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((img, idx) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/20"
          >
            <div className="relative h-[180px] md:h-[220px]">
              <Image src={img.src} alt={img.alt} fill className="object-cover transition duration-500 group-hover:scale-[1.05]" />
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <button type="button" onClick={() => setSelectedIndex(null)} className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/40 p-2 text-white">
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={() => setSelectedIndex((prev) => (prev === null ? prev : (prev - 1 + filtered.length) % filtered.length))}
            className="absolute left-4 rounded-full border border-white/30 bg-black/40 p-2 text-white md:left-8"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black">
            <div className="relative aspect-[16/10]">
              <Image src={selected.src} alt={selected.alt} fill className="object-contain" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedIndex((prev) => (prev === null ? prev : (prev + 1) % filtered.length))}
            className="absolute right-4 rounded-full border border-white/30 bg-black/40 p-2 text-white md:right-8"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
