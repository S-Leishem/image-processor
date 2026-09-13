import type { ImageItem } from '@/types';
import { formatBytes, sizeReductionPercent } from '@/lib/imageProcessing';
import { Download, Trash2, Eye, AlertCircle, Loader2, Check } from 'lucide-react';

interface ImageCardProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onPreview: (item: ImageItem) => void;
  onDownload: (item: ImageItem) => void;
}

export default function ImageCard({ item, onRemove, onPreview, onDownload }: ImageCardProps) {
  const reduction =
    item.result && item.status === 'done'
      ? sizeReductionPercent(item.originalSize, item.result.size)
      : null;

  const isLarger =
    item.result && item.originalSize > 0 && item.result.size > item.originalSize;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
        {item.status === 'processing' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse-soft" />
            <Loader2 size={28} className="text-blue-500 animate-spin" />
          </div>
        ) : item.status === 'error' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-400">
            <AlertCircle size={32} />
            <span className="text-xs px-2 text-center text-red-500 dark:text-red-400">
              {item.error || 'Failed to process'}
            </span>
          </div>
        ) : (
          <img
            src={item.result?.url || item.url}
            alt={item.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Status badge */}
        {item.status === 'done' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
            <Check size={12} strokeWidth={3} />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            {item.status === 'done' && (
              <button
                onClick={() => onPreview(item)}
                className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md transition-all hover:scale-110"
                title="Preview before/after"
                aria-label="Preview comparison"
              >
                <Eye size={16} />
              </button>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 rounded-full shadow-md transition-all hover:scale-110"
              title="Remove image"
              aria-label="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={item.name}>
          {item.name}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {item.originalWidth}×{item.originalHeight}
          </span>
          <span>{formatBytes(item.originalSize)}</span>
        </div>

        {item.status === 'done' && item.result && (
          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {item.result.width}×{item.result.height}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatBytes(item.result.size)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  isLarger
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {reduction}
              </span>
              <button
                onClick={() => onDownload(item)}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                aria-label={`Download ${item.name}`}
              >
                <Download size={13} />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
