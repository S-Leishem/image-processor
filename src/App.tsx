import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun, Images, Github } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ImageItem, ProcessSettings, Toast, UploadedImage } from '@/types';
import { processImage, formatBytes } from '@/lib/imageProcessing';
import UploadZone from '@/components/UploadZone';
import SettingsPanel from '@/components/SettingsPanel';
import ImageList from '@/components/ImageList';
import ProgressBar from '@/components/ProgressBar';
import PreviewModal from '@/components/PreviewModal';
import ToastContainer from '@/components/ToastContainer';

const DEFAULT_SETTINGS: ProcessSettings = {
  resize: {
    mode: 'none',
    width: 1920,
    height: 1080,
    percentage: 50,
    maintainAspect: true,
  },
  format: 'original',
  quality: 0.8,
  targetMaxSizeKB: 500,
  useTargetMaxSize: false,
  bgColor: '#ffffff',
};

function getDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

function getExtension(type: string): string {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'img';
}

function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<ProcessSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const urlsRef = useRef<string[]>([]);

  // Dark mode
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'true' : prefersDark;
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const trackUrl = useCallback((url: string) => {
    urlsRef.current.push(url);
    return url;
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const newItems: ImageItem[] = [];
      let skipped = 0;

      for (const file of files) {
        try {
          const { width, height } = await getDimensions(file);
          const url = trackUrl(URL.createObjectURL(file));
          newItems.push({
            id: crypto.randomUUID(),
            file,
            url,
            name: file.name,
            originalWidth: width,
            originalHeight: height,
            originalSize: file.size,
            originalType: file.type,
            status: 'pending',
          });
        } catch {
          skipped++;
        }
      }

      if (skipped > 0) {
        addToast(`${skipped} image${skipped > 1 ? 's' : ''} could not be loaded`, 'error');
      }
      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        addToast(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}`, 'success');
      }
    },
    [trackUrl, addToast]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) {
          URL.revokeObjectURL(item.url);
          if (item.result) URL.revokeObjectURL(item.result.url);
        }
        return prev.filter((i) => i.id !== id);
      });
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => {
        URL.revokeObjectURL(item.url);
        if (item.result) URL.revokeObjectURL(item.result.url);
      });
      return [];
    });
    addToast('All images cleared', 'info');
  }, [addToast]);

  const handleProcess = useCallback(async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: items.length });

    let successCount = 0;
    let errorCount = 0;

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (item.status === 'done' && item.result) {
        URL.revokeObjectURL(item.result.url);
      }
      updated[i] = { ...item, status: 'processing', error: undefined, result: undefined };
      setItems([...updated]);
      setProgress({ current: i, total: items.length });

      try {
        const result = await processImage(item.file, item.originalWidth, item.originalHeight, settings);
        result.url = trackUrl(result.url);
        updated[i] = { ...updated[i], status: 'done', result };
        successCount++;
      } catch (err) {
        updated[i] = {
          ...updated[i],
          status: 'error',
          error: err instanceof Error ? err.message : 'Processing failed',
        };
        errorCount++;
      }
      setItems([...updated]);
    }

    setProgress({ current: items.length, total: items.length });
    setIsProcessing(false);

    if (successCount > 0) {
      addToast(
        `Processed ${successCount} image${successCount > 1 ? 's' : ''} successfully`,
        'success'
      );
    }
    if (errorCount > 0) {
      addToast(`${errorCount} image${errorCount > 1 ? 's' : ''} failed to process`, 'error');
    }
  }, [items, settings, trackUrl, addToast]);

  const handleDownloadOne = useCallback((item: ImageItem) => {
    if (!item.result) return;
    const ext = getExtension(item.result.type);
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    saveAs(item.result.blob, `${baseName}.${ext}`);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    const done = items.filter((i) => i.status === 'done' && i.result);
    if (done.length === 0) return;

    const zip = new JSZip();
    const usedNames = new Set<string>();

    for (const item of done) {
      const ext = getExtension(item.result!.type);
      let baseName = item.name.replace(/\.[^/.]+$/, '');
      let name = `${baseName}.${ext}`;
      let counter = 1;
      while (usedNames.has(name)) {
        name = `${baseName}_${counter}.${ext}`;
        counter++;
      }
      usedNames.add(name);
      zip.file(name, item.result!.blob);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `processed-images-${Date.now()}.zip`);
    addToast(`Downloaded ${done.length} images as ZIP`, 'success');
  }, [items, addToast]);

  const totalOriginal = items.reduce((sum, i) => sum + i.originalSize, 0);
  const totalProcessed = items
    .filter((i) => i.result)
    .reduce((sum, i) => sum + i.result!.size, 0);
  const hasResults = items.some((i) => i.status === 'done' && i.result);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <Images size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                ImageForge
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Client-side image processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="View source"
            >
              <Github size={18} />
            </a>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {items.length === 0 ? (
          <div className="max-w-2xl mx-auto pt-8">
            <UploadZone onFiles={handleFiles} />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🔒', title: '100% Private', desc: 'Images never leave your browser' },
                { icon: '⚡', title: 'Batch Process', desc: 'Resize, compress, convert all at once' },
                { icon: '📦', title: 'ZIP Export', desc: 'Download all results in one click' },
              ].map((f) => (
                <div
                  key={f.title}
                  className="text-center p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                >
                  <div className="text-2xl mb-1.5">{f.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className="lg:sticky lg:top-20 lg:self-start">
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                onProcess={handleProcess}
                onDownloadAll={handleDownloadAll}
                isProcessing={isProcessing}
                hasImages={items.length > 0}
                hasResults={hasResults}
              />
            </div>

            <div className="space-y-4 min-w-0">
              {isProcessing && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <ProgressBar current={progress.current} total={progress.total} />
                </div>
              )}

              {hasResults && (
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Original:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {formatBytes(totalOriginal)}
                    </span>
                  </div>
                  <div className="text-gray-300 dark:text-gray-600">→</div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Processed:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatBytes(totalProcessed)}
                    </span>
                  </div>
                  {totalOriginal > 0 && (
                    <div className="ml-auto">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {((totalOriginal - totalProcessed) / totalOriginal * 100).toFixed(1)}% saved
                      </span>
                    </div>
                  )}
                </div>
              )}

              <ImageList
                items={items}
                onRemove={handleRemove}
                onClearAll={handleClearAll}
                onPreview={setPreviewItem}
                onDownload={handleDownloadOne}
              />

              <div className="pt-4">
                <UploadZone onFiles={handleFiles} />
              </div>
            </div>
          </div>
        )}
      </main>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
