"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { projects } from "@/lib/project-data";

export function PortfolioTabs() {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const selectedProject = selectedProjectIndex === null ? null : projects[selectedProjectIndex];
  const selectedPhoto = selectedProject?.photos[selectedPhotoIndex];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selectedProject === null) return;
      if (event.key === "Escape") setSelectedProjectIndex(null);
      if (event.key === "ArrowRight") {
        setSelectedPhotoIndex((index) => (index + 1) % selectedProject.photos.length);
      }
      if (event.key === "ArrowLeft") {
        setSelectedPhotoIndex((index) => (index - 1 + selectedProject.photos.length) % selectedProject.photos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject]);

  const openProject = (projectIndex: number) => {
    setSelectedProjectIndex(projectIndex);
    setSelectedPhotoIndex(0);
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slateBlue/90">Selected Electrical Work</p>
      <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold md:text-4xl">Electrical Projects Across Toronto &amp; the GTA</h2>
      <p className="mt-4 max-w-3xl leading-relaxed text-sand/75">
        Explore a selection of residential and building electrical work, from lighting installations and fixture replacements to receptacle troubleshooting and dedicated circuits.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, projectIndex) => (
          <article key={`${project.title}-${project.location}-${projectIndex}`} className="overflow-hidden rounded-2xl border border-white/15 bg-black/20">
            <button
              type="button"
              onClick={() => openProject(projectIndex)}
              aria-label={`View photos: ${project.title} in ${project.location}`}
              className="group relative block w-full overflow-hidden"
            >
              <div className="relative h-[210px]">
                <Image
                  src={project.photos[0].src}
                  alt={project.photos[0].alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              {project.photos.length > 1 ? (
                <span className="absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                  View {project.photos.length} photos
                </span>
              ) : null}
            </button>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">{project.location}</p>
              <h3 className="mt-2 text-lg font-bold text-sand">{project.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sand/70">{project.description}</p>
            </div>
          </article>
        ))}
      </div>

      {selectedProject && selectedPhoto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} in ${selectedProject.location}`}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProjectIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedProjectIndex(null)}
            aria-label="Close project photos"
            className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/50 p-2 text-white"
          >
            <X size={20} />
          </button>
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/20 bg-black">
              <Image src={selectedPhoto.src} alt={selectedPhoto.alt} fill sizes="90vw" className="object-contain" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-sand">
              <span>{selectedProject.title} · {selectedProject.location}</span>
              <span>{selectedPhotoIndex + 1} / {selectedProject.photos.length}</span>
            </div>
          </div>
          {selectedProject.photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedPhotoIndex((index) => (index - 1 + selectedProject.photos.length) % selectedProject.photos.length);
                }}
                aria-label="Previous photo"
                className="absolute left-4 rounded-full border border-white/30 bg-black/50 p-2 text-white md:left-8"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedPhotoIndex((index) => (index + 1) % selectedProject.photos.length);
                }}
                aria-label="Next photo"
                className="absolute right-4 rounded-full border border-white/30 bg-black/50 p-2 text-white md:right-8"
              >
                <ChevronRight size={24} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
