import type { ProcessSettings, ResizeMode, OutputFormat } from '@/types';
import {
  Settings,
  Maximize,
  Image as ImageIcon,
  Gauge,
  Target,
  Palette,
  Lock,
} from 'lucide-react';

interface SettingsPanelProps {
  settings: ProcessSettings;
  onChange: (settings: ProcessSettings) => void;
  onProcess: () => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
  hasImages: boolean;
  hasResults: boolean;
}

const resizeModes: { value: ResizeMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'width', label: 'Width' },
  { value: 'height', label: 'Height' },
  { value: 'fit', label: 'Fit (max W/H)' },
  { value: 'percentage', label: 'Percentage' },
];

const formats: { value: OutputFormat; label: string }[] = [
  { value: 'original', label: 'Keep original' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
];

export default function SettingsPanel({
  settings,
  onChange,
  onProcess,
  onDownloadAll,
  isProcessing,
  hasImages,
  hasResults,
}: SettingsPanelProps) {
  const update = (patch: Partial<ProcessSettings>) => onChange({ ...settings, ...patch });
  const updateResize = (patch: Partial<ProcessSettings['resize']>) =>
    onChange({ ...settings, resize: { ...settings.resize, ...patch } });

  const showQuality = settings.format !== 'image/png';
  const showBgColor = settings.format === 'image/jpeg' || settings.format === 'image/webp';
  const showTargetSize = settings.format === 'image/jpeg' || settings.format === 'image/webp';

  const needsWidth = settings.resize.mode === 'width' || settings.resize.mode === 'fit';
  const needsHeight = settings.resize.mode === 'height' || settings.resize.mode === 'fit';
  const needsPercentage = settings.resize.mode === 'percentage';

  return (
    <aside className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <Settings size={18} className="text-blue-500" />
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
      </div>

      <div className="p-5 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
        {/* Resize */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Maximize size={15} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Resize</h3>
          </div>

          <div className="space-y-3">
            <select
              value={settings.resize.mode}
              onChange={(e) => updateResize({ mode: e.target.value as ResizeMode })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              {resizeModes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {needsWidth && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min={1}
                  value={settings.resize.width}
                  onChange={(e) => updateResize({ width: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            {needsHeight && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min={1}
                  value={settings.resize.height}
                  onChange={(e) => updateResize({ height: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            {needsPercentage && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Percentage: {settings.resize.percentage}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={settings.resize.percentage}
                  onChange={(e) => updateResize({ percentage: Number(e.target.value) })}
                  className="w-full text-blue-500"
                />
              </div>
            )}

            {settings.resize.mode !== 'none' && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.resize.maintainAspect}
                    onChange={(e) => updateResize({ maintainAspect: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-blue-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Lock size={12} />
                  Maintain aspect ratio
                </span>
              </label>
            )}
          </div>
        </section>

        {/* Format */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={15} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Format</h3>
          </div>
          <select
            value={settings.format}
            onChange={(e) => update({ format: e.target.value as OutputFormat })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            {formats.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </section>

        {/* Quality */}
        {showQuality && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={15} className="text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality</h3>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>0.1</span>
                <span className="font-medium text-blue-500">{settings.quality.toFixed(1)}</span>
                <span>1.0</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={settings.quality}
                onChange={(e) => update({ quality: Number(e.target.value) })}
                className="w-full text-blue-500"
              />
            </div>
          </section>
        )}

        {/* Target Max Size */}
        {showTargetSize && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target size={15} className="text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Max File Size
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.useTargetMaxSize}
                  onChange={(e) => update({ useTargetMaxSize: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-blue-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Enable target size</span>
            </label>
            {settings.useTargetMaxSize && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Max size: {settings.targetMaxSizeKB} KB
                </label>
                <input
                  type="range"
                  min={10}
                  max={5000}
                  step={10}
                  value={settings.targetMaxSizeKB}
                  onChange={(e) => update({ targetMaxSizeKB: Number(e.target.value) })}
                  className="w-full text-blue-500"
                />
              </div>
            )}
          </section>
        )}

        {/* Background Color */}
        {showBgColor && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={15} className="text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Color
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-10 h-10 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {settings.bgColor}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Used when converting transparent images to JPG/WebP
            </p>
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <button
          onClick={onProcess}
          disabled={!hasImages || isProcessing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 transition-all shadow-sm hover:shadow-md"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Maximize size={16} />
              Process All
            </>
          )}
        </button>
        <button
          onClick={onDownloadAll}
          disabled={!hasResults || isProcessing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 transition-all"
        >
          <ImageIcon size={16} />
          Download All as ZIP
        </button>
      </div>
    </aside>
  );
}
