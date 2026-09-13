# ImageForge — Client-Side Image Processing Tool

A modern, fully client-side image processing web app. Resize, compress, convert, and batch-download images — all in your browser. No uploads, no server, no tracking.

## Features

- **Batch Upload** — Drag-and-drop or file picker. Supports JPG, PNG, and WebP.
- **Resize Options** — None, fixed width, fixed height, fit within max dimensions, or percentage scale. Aspect ratio lock with toggle.
- **Format Conversion** — Keep original, or convert to JPG, PNG, or WebP.
- **Quality Control** — Quality slider (0.1–1.0) for JPG/WebP output. PNG uses lossless.
- **Target File Size** — Optional max file size in KB using `browser-image-compression` for JPEG/WebP.
- **Background Color** — Fill transparent areas with a chosen color when converting to JPG/WebP.
- **Batch Processing** — Process all images at once with a live progress bar.
- **Per-Image Download** — Download individual results, or download everything as a ZIP.
- **Before/After Preview** — Modal comparison of original vs processed images with stats.
- **Dark Mode** — System-aware with manual toggle, persisted to localStorage.
- **Toast Notifications** — Success and error feedback for all actions.
- **Accessible** — Keyboard-friendly controls, ARIA labels, and focus states.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 (with dark mode)
- lucide-react (icons)
- browser-image-compression (target file size compression)
- jszip + file-saver (ZIP download)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Type check
npm run typecheck
```

## How It Works

All image processing happens entirely in the browser using the HTML Canvas API:

1. Images are loaded into `HTMLImageElement` objects
2. A canvas is created at the target dimensions
3. The image is drawn onto the canvas (with optional background fill for transparency)
4. `canvas.toBlob()` converts the canvas to the output format with the specified quality
5. For target file size mode, `browser-image-compression` iteratively compresses to hit the target
6. Results are displayed with size reduction stats and made available for download

No image data ever leaves your device. Object URLs are cleaned up properly to prevent memory leaks.

## Project Structure

```
src/
├── App.tsx                    # Main app: state, processing orchestration
├── types.ts                   # TypeScript types and interfaces
├── lib/
│   └── imageProcessing.ts     # Canvas-based image processing logic
├── components/
│   ├── UploadZone.tsx         # Drag-and-drop file upload
│   ├── SettingsPanel.tsx      # Global processing settings
│   ├── ImageList.tsx          # Grid of uploaded images
│   ├── ImageCard.tsx          # Individual image card with stats
│   ├── ProgressBar.tsx        # Batch processing progress
│   ├── PreviewModal.tsx       # Before/after comparison modal
│   └── ToastContainer.tsx     # Toast notification system
└── index.css                  # Tailwind + custom styles
```

## Privacy

ImageForge processes everything locally. Your images are never uploaded to any server. The app has no backend, no analytics, and no network calls.
