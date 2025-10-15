"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export type LightboxSlide = {
  src: string;
  width?: number;
  height?: number;
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
    />
  );
}
