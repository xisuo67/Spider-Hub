"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import React from "react";

export type LightboxSlide = {
  src: string;
  width?: number;
  height?: number;
  type?: 'image' | 'video';
  poster?: string;
};

interface ImageLightboxProps {
  slides: LightboxSlide[];
  open: boolean;
  index?: number;
  onClose: () => void;
}

export function ImageLightbox({ slides, open, index = 0, onClose }: ImageLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      carousel={{ finite: true }}
      render={{
        slide: ({ slide }) => {
          const s = slide as LightboxSlide;
          if (s.type === 'video') {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <video
                  controls
                  poster={s.poster}
                  className="max-h-[80vh] max-w-[90vw]"
                  src={s.src}
                />
              </div>
            );
          }
          return null; // use default renderer for images
        },
      }}
    />
  );
}
