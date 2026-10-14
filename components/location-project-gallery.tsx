"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { projects } from "@/lib/project-data";

type LocationProjectGalleryProps = {
  areaSlug: string;
  areaName: string;
};

export function LocationProjectGallery({ areaSlug, areaName }: LocationProjectGalleryProps) {
  const locationProjects = projects.filter((project) => project.areaSlug === areaSlug);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const selectedProject = selectedProjectIndex === null ? null : locationProjects[selectedProjectIndex];
  const selectedPhoto = selectedProject?.photos[selectedPhotoIndex];

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProjectIndex(null);
      if (event.key === "ArrowRight") {
        setSelectedPhotoIndex((index) => (index + 1) % selectedProject.photos.length);
      }
      if (event.key === "ArrowLeft") {
        setSelectedPhotoIndex((index) => (index - 1 + selectedProject.photos.length) % selectedProject.photos.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject]);

  if (!locationProjects.length) return null;

  const openPhoto = (projectIndex: number, photoIndex: number) => {
    setSelectedProjectIndex(projectIndex);
    setSelectedPhotoIndex(photoIndex);
  };

  return (
    <>
      <section className="mt-16" aria-labelledby="projects-heading">
        <h2 id="projects-heading" className="font-[var(--font-display)] text-2xl font-bold md:text-3xl">
          Electrical Projects in {areaName}
        </h2>
        <p className="mt-3 max-w-3xl text-sand/75">
          A selection of electrical work completed in {areaName} and its neighbourhoods. Select a photo to view it larger.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {locationProjects.map((project, projectIndex) => (
            <article key={`${project.title}-${project.location}-${projectIndex}`} className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04]">
              {project.photos.slice(0, 1).map((photo) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => openPhoto(projectIndex, 0)}
                  aria-label={`Enlarge photo 1 of ${project.title} in ${project.location}`}
                  className="group relative block h-[210px] w-full overflow-hidden"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                    View larger
                  </span>
                </button>
              ))}
              {project.photos.length > 1 ? (
                <div className="mt-3 flex gap-2 px-4">
                  {project.photos.slice(1).map((photo, photoIndex) => (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => openPhoto(projectIndex, photoIndex + 1)}
                      aria-label={`Enlarge photo ${photoIndex + 2} of ${project.title} in ${project.location}`}
                      className="group relative h-20 min-w-0 flex-1 overflow-hidden rounded-lg"
                    >
                      <Image src={photo.src} alt={photo.alt} fill sizes="120px" className="object-cover transition duration-300 group-hover:scale-[1.04]" />
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="p-5 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">{project.location}</p>
                <h3 className="mt-2 text-lg font-bold">{project.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand/70">{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedProject && selectedPhoto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} in ${selectedProject.location}`}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProjectIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedProjectIndex(null)}
            aria-label="Close enlarged photo"
            className="absolute right-5 top-5 z-10 rounded-full border border-white/30 bg-black/60 p-3 text-white"
          >
            <X size={22} />
          </button>
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative h-[75vh] min-h-[280px] w-full">
              <Image src={selectedPhoto.src} alt={selectedPhoto.alt} fill sizes="95vw" className="object-contain" />
            </div>
            <p className="mt-3 text-center text-sm text-sand/85">
              {selectedProject.title} · {selectedProject.location} · {selectedPhotoIndex + 1} / {selectedProject.photos.length}
            </p>
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
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/60 p-3 text-white md:left-8"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/60 p-3 text-white md:right-8"
              >
                <ChevronRight size={24} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
