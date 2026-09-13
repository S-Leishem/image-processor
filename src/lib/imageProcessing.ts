import type { ProcessSettings, ProcessedResult } from '@/types';
import imageCompression from 'browser-image-compression';

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function calcDimensions(
  origW: number,
  origH: number,
  settings: ProcessSettings
): { width: number; height: number } {
  const { resize } = settings;
  if (resize.mode === 'none') return { width: origW, height: origH };

  const aspect = origW / origH;

  switch (resize.mode) {
    case 'width': {
      const w = Math.round(resize.width);
      const h = resize.maintainAspect ? Math.round(w / aspect) : origH;
      return { width: w, height: h };
    }
    case 'height': {
      const h = Math.round(resize.height);
      const w = resize.maintainAspect ? Math.round(h * aspect) : origW;
      return { width: w, height: h };
    }
    case 'fit': {
      const maxW = resize.width;
      const maxH = resize.height;
      if (resize.maintainAspect) {
        const ratio = Math.min(maxW / origW, maxH / origH);
        return { width: Math.round(origW * ratio), height: Math.round(origH * ratio) };
      }
      return { width: Math.round(maxW), height: Math.round(maxH) };
    }
    case 'percentage': {
      const pct = resize.percentage / 100;
      return { width: Math.round(origW * pct), height: Math.round(origH * pct) };
    }
    default:
      return { width: origW, height: origH };
  }
}

function getOutputType(originalType: string, format: string): string {
  if (format === 'original') return originalType || 'image/png';
  return format;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert image'));
      },
      type,
      quality
    );
  });
}

export async function processImage(
  file: File,
  origWidth: number,
  origHeight: number,
  settings: ProcessSettings
): Promise<ProcessedResult> {
  const img = await loadImage(file);
  const { width, height } = calcDimensions(origWidth, origHeight, settings);
  const outputType = getOutputType(file.type, settings.format);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  if (outputType === 'image/jpeg' || outputType === 'image/webp') {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  let blob: Blob;

  const useCompression =
    settings.useTargetMaxSize &&
    (outputType === 'image/jpeg' || outputType === 'image/webp');

  if (useCompression) {
    const initialBlob = await canvasToBlob(canvas, outputType, settings.quality);
    const targetSize = settings.targetMaxSizeKB * 1024;

    if (initialBlob.size <= targetSize) {
      blob = initialBlob;
    } else {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: settings.targetMaxSizeKB / 1024,
          maxWidthOrHeight: Math.max(width, height),
          useWebWorker: true,
          fileType: outputType,
          initialQuality: settings.quality,
        });
        blob = compressedFile;
      } catch {
        blob = initialBlob;
      }
    }
  } else {
    blob = await canvasToBlob(canvas, outputType, settings.quality);
  }

  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    size: blob.size,
    type: blob.type,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sizeReductionPercent(original: number, processed: number): string {
  if (original === 0) return '0%';
  const pct = ((original - processed) / original) * 100;
  const sign = pct >= 0 ? '-' : '+';
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}
