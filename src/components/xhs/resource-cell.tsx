"use client";

import { useMemo, useState } from "react";
import { ImageLightbox, type LightboxSlide } from "@/components/xhs/image-lightbox";

interface ResourceCellProps {
  images?: Array<{ url: string }>;
  videos?: Array<{ master_url: string; cover_image?: string }>;
  livePhotos?: Array<{ url: string }>;
  label: string;
}

export function ResourceCell({ images = [], videos = [], livePhotos = [], label }: ResourceCellProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = useMemo<LightboxSlide[]>(() => {
    const imgSlides = images.map((i) => ({ src: i.url, type: 'image' as const }));
    const liveSlides = livePhotos.map((i) => ({ src: i.url, type: 'image' as const }));
    const videoSlides = videos.map((v) => ({ src: v.master_url, poster: v.cover_image, type: 'video' as const }));
    return [...imgSlides, ...liveSlides, ...videoSlides];
  }, [images, videos, livePhotos]);

  const total = slides.length;
  if (total === 0) return <span className="text-xs text-muted-foreground">-</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => { setIndex(0); setOpen(true); }}
        className="inline-flex items-center gap-2 rounded border px-2 py-1 text-xs hover:bg-muted"
        aria-label={label}
      >
        <span>{label}</span>
        <span className="rounded bg-muted px-1">{total}</span>
      </button>
      <ImageLightbox slides={slides} open={open} index={index} onClose={() => setOpen(false)} />
    </>
  );
}
