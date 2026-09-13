import { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadZone({ onFiles }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type));
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload images by clicking or dragging"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative flex flex-col items-center justify-center gap-4
        rounded-2xl border-2 border-dashed transition-all duration-300
        px-6 py-16 text-center cursor-pointer
        select-none
        ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        className={`
          flex items-center justify-center w-16 h-16 rounded-full
          transition-all duration-300
          ${
            dragActive
              ? 'bg-blue-500 text-white scale-110'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }
        `}
      >
        <Upload size={28} className={dragActive ? 'animate-bounce' : ''} />
      </div>

      <div>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {dragActive ? 'Drop images here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          or click to browse — JPG, PNG, WebP supported
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <ImageIcon size={14} />
        <span>Batch upload supported — all processing happens in your browser</span>
      </div>
    </div>
  );
}
