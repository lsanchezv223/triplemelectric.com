"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Download, FileImage, FileText, Paperclip, X } from "lucide-react";

export type EntryAttachmentItem = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  url: string;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

function getFileIcon(mimeType: string) {
  if (isImage(mimeType)) {
    return <FileImage size={18} />;
  }

  return <FileText size={18} />;
}

export function EntryAttachmentsModal({
  title,
  subtitle,
  attachments,
  onClose
}: {
  title: string;
  subtitle?: string;
  attachments: EntryAttachmentItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
      <div className="my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Attachments</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm text-sand/65">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close attachments modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70dvh] overflow-y-auto px-6 py-6 md:px-8">
          {attachments.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {attachments.map((attachment) => (
                <article key={attachment.id} className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
                  {isImage(attachment.mimeType) ? (
                    <a href={attachment.url} target="_blank" rel="noreferrer" className="block">
                      <Image
                        src={attachment.url}
                        alt={attachment.fileName}
                        width={1200}
                        height={560}
                        unoptimized
                        className="h-56 w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-white/[0.03] text-sand/55">
                      <div className="text-center">
                        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                          {getFileIcon(attachment.mimeType)}
                        </div>
                        <p className="mt-4 text-sm font-semibold text-white">Preview unavailable</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{attachment.fileName}</p>
                        <p className="mt-1 text-xs text-sand/55">
                          {formatFileSize(attachment.sizeBytes)} · {attachment.mimeType}
                        </p>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/30"
                        aria-label={`Open ${attachment.fileName}`}
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-sand/65">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                  <Paperclip size={18} />
                </div>
                <p>No attachments were found for this entry.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
