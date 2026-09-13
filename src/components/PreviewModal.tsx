import { useEffect, useState } from 'react';
import type { ImageItem } from '@/types';
import { formatBytes, sizeReductionPercent } from '@/lib/imageProcessing';
import { X, ArrowLeftRight } from 'lucide-react';

interface PreviewModalProps {
  item: ImageItem | null;
  onClose: () => void;
}

export default function PreviewModal({ item, onClose }: PreviewModalProps) {
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (item) setShowOriginal(true);
  }, [item]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item || !item.result) return null;

  const reduction = sizeReductionPercent(item.originalSize, item.result.size);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate pr-4">
            {item.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toggle */}
        <div className="flex justify-center px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <ArrowLeftRight size={14} />
            {showOriginal ? 'Show Processed' : 'Show Original'}
          </button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-950/50 p-4 min-h-[300px] max-h-[50vh] overflow-auto">
          <img
            src={showOriginal ? item.url : item.result.url}
            alt={showOriginal ? 'Original' : 'Processed'}
            className="max-w-full max-h-[45vh] object-contain rounded-lg"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-5 border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Original
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dimensions</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.originalWidth}×{item.originalHeight}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Size</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {formatBytes(item.originalSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium uppercase text-xs">
                  {item.originalType.split('/')[1]}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Processed
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dimensions</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.result.width}×{item.result.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Size</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {formatBytes(item.result.size)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Change</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {reduction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
