import type { ImageItem } from '@/types';
import ImageCard from './ImageCard';
import { Trash2, Images } from 'lucide-react';

interface ImageListProps {
  items: ImageItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onPreview: (item: ImageItem) => void;
  onDownload: (item: ImageItem) => void;
}

export default function ImageList({
  items,
  onRemove,
  onClearAll,
  onPreview,
  onDownload,
}: ImageListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images size={18} className="text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            {items.length} {items.length === 1 ? 'Image' : 'Images'}
          </h2>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 size={15} />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <ImageCard
            key={item.id}
            item={item}
            onRemove={onRemove}
            onPreview={onPreview}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
