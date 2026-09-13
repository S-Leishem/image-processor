export type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

export type ResizeMode = 'none' | 'width' | 'height' | 'fit' | 'percentage';

export interface ResizeSettings {
  mode: ResizeMode;
  width: number;
  height: number;
  percentage: number;
  maintainAspect: boolean;
}

export interface ProcessSettings {
  resize: ResizeSettings;
  format: OutputFormat;
  quality: number;
  targetMaxSizeKB: number;
  useTargetMaxSize: boolean;
  bgColor: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  originalType: string;
}

export type ProcessStatus = 'pending' | 'processing' | 'done' | 'error';

export interface ProcessedResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

export interface ImageItem extends UploadedImage {
  status: ProcessStatus;
  result?: ProcessedResult;
  error?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
