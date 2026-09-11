/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Lock,
  LockOpen,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Button from "@/components/ui/Button";

const TOOLS = [
  { id: "compress", label: "Compress" },
  { id: "resize", label: "Resize" },
  { id: "convert", label: "Convert" },
  { id: "crop", label: "Crop" },
  { id: "rotate", label: "Rotate & Flip" },
  { id: "favicon", label: "Favicon" },
];

const HERO_COPY = {
  compress: ["Shrink your images without shrinking their quality", "Upload JPG, PNG or WebP images and choose the balance between quality and file size."],
  resize: ["Resize images to exactly the dimensions you need", "Set pixel dimensions or scale a batch by percentage while preserving its aspect ratio."],
  convert: ["Convert images between JPG, PNG and WebP", "Choose the best format for photos, transparency or lightweight web delivery."],
  crop: ["Crop an image to the perfect frame", "Drag and resize the selection, or lock it to a common aspect ratio."],
  rotate: ["Fix image orientation or create a mirror image", "Rotate left or right and flip horizontally or vertically, with a live preview."],
  favicon: ["Create a complete favicon set from one image", "Generate seven standard PNG icon sizes for browser tabs, home screens and app manifests."],
};

const FAVICON_SIZES = [16, 32, 48, 96, 180, 192, 512];
const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const chipClass =
  "rounded-full border px-3 py-1.5 text-sm font-medium transition focus-ring";
const activeChipClass = "border-fg bg-fg text-surface hover:text-surface";
const inactiveChipClass = "border-border bg-surface text-muted hover:text-fg";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function baseName(name) {
  return name.replace(/\.[^.]+$/, "");
}

function extensionFor(mime) {
  return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
}

function safeOutputMime(mime) {
  return ["image/jpeg", "image/png", "image/webp"].includes(mime) ? mime : "image/png";
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The browser could not create this image."))), mime, quality);
  });
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ -1) >>> 0;
}

function write16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function write32(view, offset, value) {
  view.setUint32(offset, value, true);
}

async function makeZip(outputs) {
  const encoder = new TextEncoder();
  const entries = await Promise.all(
    outputs.map(async (output) => ({
      name: encoder.encode(output.name),
      data: new Uint8Array(await output.blob.arrayBuffer()),
    })),
  );
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach((entry) => {
    const checksum = crc32(entry.data);
    const local = new Uint8Array(30 + entry.name.length + entry.data.length);
    const localView = new DataView(local.buffer);
    write32(localView, 0, 0x04034b50);
    write16(localView, 4, 20);
    write16(localView, 6, 0x0800);
    write16(localView, 8, 0);
    write32(localView, 14, checksum);
    write32(localView, 18, entry.data.length);
    write32(localView, 22, entry.data.length);
    write16(localView, 26, entry.name.length);
    local.set(entry.name, 30);
    local.set(entry.data, 30 + entry.name.length);
    localParts.push(local);

    const central = new Uint8Array(46 + entry.name.length);
    const centralView = new DataView(central.buffer);
    write32(centralView, 0, 0x02014b50);
    write16(centralView, 4, 20);
    write16(centralView, 6, 20);
    write16(centralView, 8, 0x0800);
    write16(centralView, 10, 0);
    write32(centralView, 16, checksum);
    write32(centralView, 20, entry.data.length);
    write32(centralView, 24, entry.data.length);
    write16(centralView, 28, entry.name.length);
    write32(centralView, 42, offset);
    central.set(entry.name, 46);
    centralParts.push(central);
    offset += local.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  write32(endView, 0, 0x06054b50);
  write16(endView, 8, entries.length);
  write16(endView, 10, entries.length);
  write32(endView, 12, centralSize);
  write32(endView, 16, offset);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}

async function loadImageFile(file, index) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error(`Could not open ${file.name}.`));
  });
  return {
    id: `${file.name}-${file.lastModified}-${index}`,
    file,
    image,
    url,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm italic text-muted">
      {children}
    </div>
  );
}

function ResultList({ results, pendingText, onDownloadAll }) {
  if (!results.length) return <EmptyState>{pendingText}</EmptyState>;
  return (
    <div className="space-y-3">
      {results.length > 1 && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onDownloadAll}>
            <Archive size={15} /> Download all (.zip)
          </Button>
        </div>
      )}
      {results.map((result) => {
        const reduction = result.originalSize
          ? Math.round((1 - result.blob.size / result.originalSize) * 100)
          : null;
        return (
          <div key={result.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft">
            {result.previewUrl && (
              <img src={result.previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{result.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {result.dimensions && `${result.dimensions} · `}
                {result.originalSize ? `${formatBytes(result.originalSize)} → ` : ""}
                {formatBytes(result.blob.size)}
                {reduction !== null && (
                  <span className={reduction >= 0 ? "ml-1 font-semibold text-success" : "ml-1 font-semibold text-muted"}>
                    {reduction >= 0 ? `−${reduction}%` : `+${Math.abs(reduction)}%`}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.name)}
              className="rounded-lg border border-border p-2 text-muted transition hover:text-fg focus-ring"
              aria-label={`Download ${result.name}`}
            >
              <Download size={17} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function PixlyImageTools() {
  const [activeTool, setActiveTool] = useState("compress");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [results, setResults] = useState([]);
  const [quality, setQuality] = useState(75);
  const [compressFormat, setCompressFormat] = useState("original");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [aspectLocked, setAspectLocked] = useState(true);
  const [convertFormat, setConvertFormat] = useState("image/jpeg");
  const [convertQuality, setConvertQuality] = useState(85);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);
  const [cropRatio, setCropRatio] = useState(0);
  const [selection, setSelection] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const inputRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => () => files.forEach((item) => URL.revokeObjectURL(item.url)), [files]);
  useEffect(() => () => results.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl)), [results]);

  function replaceResults(next) {
    setResults((current) => {
      current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
      return next;
    });
  }

  async function receiveFiles(fileList) {
    const accepted = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!accepted.length) {
      setError("Choose at least one valid image file.");
      return;
    }
    setError("");
    try {
      const loaded = await Promise.all(accepted.map(loadImageFile));
      setFiles((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return loaded;
      });
      replaceResults([]);
      setWidth(String(loaded[0].width));
      setHeight(String(loaded[0].height));
      setRotation(0);
      setFlipX(1);
      setFlipY(1);
      setSelection({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  function switchTool(id) {
    setActiveTool(id);
    replaceResults([]);
  }

  function changeWidth(value) {
    setWidth(value);
    if (aspectLocked && files[0] && value) setHeight(String(Math.max(1, Math.round(Number(value) * files[0].height / files[0].width))));
  }

  function changeHeight(value) {
    setHeight(value);
    if (aspectLocked && files[0] && value) setWidth(String(Math.max(1, Math.round(Number(value) * files[0].width / files[0].height))));
  }

  function scaleBy(percent) {
    if (!files[0]) return;
    setWidth(String(Math.max(1, Math.round(files[0].width * percent))));
    setHeight(String(Math.max(1, Math.round(files[0].height * percent))));
  }

  async function runBatch(mode) {
    if (!files.length) return setError("Upload one or more images first.");
    setBusy(true);
    setError("");
    try {
      const generated = [];
      for (const item of files) {
        let outputWidth = item.width;
        let outputHeight = item.height;
        let mime = safeOutputMime(item.file.type);
        let outputQuality = 0.92;
        let suffix = "";

        if (mode === "compress") {
          mime = compressFormat === "original" ? safeOutputMime(item.file.type) : compressFormat;
          outputQuality = quality / 100;
          suffix = "-compressed";
        } else if (mode === "resize") {
          const requestedWidth = Number.parseInt(width, 10);
          const requestedHeight = Number.parseInt(height, 10);
          if (!requestedWidth && !requestedHeight) throw new Error("Enter a width or height.");
          if (aspectLocked || !requestedHeight) {
            outputWidth = requestedWidth || Math.round(requestedHeight * item.width / item.height);
            outputHeight = Math.round(outputWidth * item.height / item.width);
          } else if (!requestedWidth) {
            outputHeight = requestedHeight;
            outputWidth = Math.round(outputHeight * item.width / item.height);
          } else {
            outputWidth = requestedWidth;
            outputHeight = requestedHeight;
          }
          suffix = `-${outputWidth}x${outputHeight}`;
        } else if (mode === "convert") {
          mime = convertFormat;
          outputQuality = convertQuality / 100;
        } else if (mode === "rotate") {
          const normalized = ((rotation % 360) + 360) % 360;
          if (normalized === 90 || normalized === 270) {
            outputWidth = item.height;
            outputHeight = item.width;
          }
          suffix = "-edited";
        }

        if (outputWidth < 1 || outputHeight < 1 || outputWidth > 32767 || outputHeight > 32767) {
          throw new Error("The requested image dimensions are outside the browser's supported range.");
        }
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const context = canvas.getContext("2d");
        if (mime === "image/jpeg") {
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (mode === "rotate") {
          const normalized = ((rotation % 360) + 360) % 360;
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate(normalized * Math.PI / 180);
          context.scale(flipX, flipY);
          context.drawImage(item.image, -item.width / 2, -item.height / 2);
        } else {
          context.drawImage(item.image, 0, 0, outputWidth, outputHeight);
        }
        const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : outputQuality);
        generated.push({
          name: `${baseName(item.file.name)}${suffix}.${extensionFor(mime)}`,
          blob,
          originalSize: item.file.size,
          dimensions: mode === "resize" ? `${outputWidth}×${outputHeight}` : "",
          previewUrl: URL.createObjectURL(blob),
        });
      }
      replaceResults(generated);
    } catch (runError) {
      setError(runError.message || "The images could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  async function generateFavicons() {
    if (!files[0]) return setError("Upload an image first.");
    setBusy(true);
    setError("");
    try {
      const item = files[0];
      const side = Math.min(item.width, item.height);
      const sourceX = (item.width - side) / 2;
      const sourceY = (item.height - side) / 2;
      const generated = [];
      for (const size of FAVICON_SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        canvas.getContext("2d").drawImage(item.image, sourceX, sourceY, side, side, 0, 0, size, size);
        const blob = await canvasToBlob(canvas, "image/png");
        generated.push({ name: `favicon-${size}x${size}.png`, blob, dimensions: `${size}×${size}`, previewUrl: URL.createObjectURL(blob) });
      }
      replaceResults(generated);
    } catch (runError) {
      setError(runError.message || "The favicon set could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  function selectCropRatio(ratio) {
    setCropRatio(ratio);
    if (!ratio) return;
    const imageRatio = files[0] ? files[0].width / files[0].height : 1;
    const displayedRatio = ratio / imageRatio;
    let w = 0.8;
    let h = w / displayedRatio;
    if (h > 0.8) {
      h = 0.8;
      w = h * displayedRatio;
    }
    setSelection({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  }

  function startCropDrag(event, type) {
    event.preventDefault();
    dragRef.current = { type, x: event.clientX, y: event.clientY, selection: { ...selection } };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveCrop(event) {
    if (!dragRef.current || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    const dx = (event.clientX - dragRef.current.x) / bounds.width;
    const dy = (event.clientY - dragRef.current.y) / bounds.height;
    const original = dragRef.current.selection;
    let next = { ...original };
    if (dragRef.current.type === "move") {
      next.x = Math.max(0, Math.min(1 - next.w, original.x + dx));
      next.y = Math.max(0, Math.min(1 - next.h, original.y + dy));
    } else {
      const type = dragRef.current.type;
      if (type.includes("e")) next.w = original.w + dx;
      if (type.includes("s")) next.h = original.h + dy;
      if (type.includes("w")) { next.x = original.x + dx; next.w = original.w - dx; }
      if (type.includes("n")) { next.y = original.y + dy; next.h = original.h - dy; }
      next.w = Math.max(0.05, Math.min(next.w, 1 - next.x));
      next.h = Math.max(0.05, Math.min(next.h, 1 - next.y));
      next.x = Math.max(0, Math.min(next.x, 1 - next.w));
      next.y = Math.max(0, Math.min(next.y, 1 - next.h));
      if (cropRatio && files[0]) {
        const displayedRatio = cropRatio / (files[0].width / files[0].height);
        next.h = Math.min(1 - next.y, next.w / displayedRatio);
        next.w = Math.min(1 - next.x, next.h * displayedRatio);
      }
    }
    setSelection(next);
  }

  async function cropAndDownload() {
    if (!files[0]) return setError("Upload an image first.");
    setBusy(true);
    setError("");
    try {
      const item = files[0];
      const sx = Math.round(selection.x * item.width);
      const sy = Math.round(selection.y * item.height);
      const sw = Math.max(1, Math.round(selection.w * item.width));
      const sh = Math.max(1, Math.round(selection.h * item.height));
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      canvas.getContext("2d").drawImage(item.image, sx, sy, sw, sh, 0, 0, sw, sh);
      const mime = safeOutputMime(item.file.type);
      const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : 0.92);
      downloadBlob(blob, `${baseName(item.file.name)}-crop.${extensionFor(mime)}`);
    } catch (runError) {
      setError(runError.message || "The image could not be cropped.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll(name) {
    const zip = await makeZip(results);
    downloadBlob(zip, name);
  }

  const firstFile = files[0];
  const [heroTitle, heroDescription] = HERO_COPY[activeTool];
  const cropDimensions = firstFile
    ? `${Math.max(1, Math.round(selection.w * firstFile.width))} × ${Math.max(1, Math.round(selection.h * firstFile.height))} px`
    : "Select an image to begin.";

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => switchTool(tool.id)}
            className={`${chipClass} shrink-0 ${activeTool === tool.id ? activeChipClass : inactiveChipClass}`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">{heroTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{heroDescription}</p>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && inputRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); receiveFiles(event.dataTransfer.files); }}
          className={`mt-5 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition focus-ring ${dragging ? "border-fg bg-surface" : "border-border bg-surface hover:border-muted"}`}
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-card text-fg shadow-soft">
            {files.length ? <ImagePlus size={23} /> : <Upload size={23} />}
          </span>
          <h3 className="mt-3 font-semibold text-fg">
            {files.length === 1 ? `${files[0].file.name} is ready` : files.length > 1 ? `${files.length} images are ready` : "Drag and drop images here"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {files.length ? "Click to choose different images" : "or browse from your device · JPG, PNG, WebP, GIF or BMP"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={activeTool !== "crop" && activeTool !== "favicon"}
            className="hidden"
            onChange={(event) => receiveFiles(event.target.files)}
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <ShieldCheck size={16} className="shrink-0 text-success" />
          Everything happens on your device — your images are never uploaded.
        </p>
        {error && <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg">{error}</p>}
      </section>

      {activeTool === "compress" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <h3 className="font-display text-xl font-semibold text-fg">Compression settings</h3>
            <label className="mt-5 block text-sm font-medium text-fg">Quality <span className="text-muted">{quality}</span></label>
            <input className="mt-2 w-full accent-current" type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            <label className="mt-5 block text-sm font-medium text-fg" htmlFor="compress-format">Output format</label>
            <select id="compress-format" className={`${inputClass} mt-2`} value={compressFormat} onChange={(e) => setCompressFormat(e.target.value)}>
              <option value="original">Keep original format</option>
              <option value="image/jpeg">Force JPG (smallest for photos)</option>
              <option value="image/webp">Force WebP (best compression)</option>
              <option value="image/png">Force PNG (lossless)</option>
            </select>
            <Button type="button" className="mt-5" disabled={busy || !files.length} onClick={() => runBatch("compress")}>
              {busy ? "Compressing…" : "Compress images"}
            </Button>
          </section>
          <section>
            <h3 className="mb-3 font-display text-xl font-semibold text-fg">Results</h3>
            <ResultList results={results} pendingText="Upload one or more images, then press Compress." onDownloadAll={() => downloadAll("pixly-compressed.zip")} />
          </section>
        </div>
      )}

      {activeTool === "resize" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <h3 className="font-display text-xl font-semibold text-fg">New dimensions</h3>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <label className="text-sm font-medium text-fg">Width (px)<input className={`${inputClass} mt-2`} type="number" min="1" value={width} onChange={(e) => changeWidth(e.target.value)} /></label>
              <button type="button" onClick={() => setAspectLocked((value) => !value)} className="mb-0.5 rounded-lg border border-border bg-surface p-2.5 text-fg focus-ring" aria-label="Toggle aspect ratio lock">
                {aspectLocked ? <Lock size={17} /> : <LockOpen size={17} />}
              </button>
              <label className="text-sm font-medium text-fg">Height (px)<input className={`${inputClass} mt-2`} type="number" min="1" value={height} onChange={(e) => changeHeight(e.target.value)} /></label>
            </div>
            <p className="mt-5 text-sm font-medium text-fg">Or scale by percentage</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[0.25, 0.5, 0.75, 1].map((scale) => <button key={scale} type="button" className={`${chipClass} ${inactiveChipClass}`} onClick={() => scaleBy(scale)}>{scale * 100}%</button>)}
            </div>
            <Button type="button" className="mt-5" disabled={busy || !files.length} onClick={() => runBatch("resize")}>
              {busy ? "Resizing…" : "Resize images"}
            </Button>
          </section>
          <section>
            <h3 className="mb-3 font-display text-xl font-semibold text-fg">Results</h3>
            <ResultList results={results} pendingText="Upload images, set new dimensions, then press Resize." onDownloadAll={() => downloadAll("pixly-resized.zip")} />
          </section>
        </div>
      )}

      {activeTool === "convert" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <h3 className="font-display text-xl font-semibold text-fg">Convert to</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {[["image/jpeg", "JPG"], ["image/png", "PNG"], ["image/webp", "WebP"]].map(([mime, label]) => (
                <button key={mime} type="button" onClick={() => setConvertFormat(mime)} className={`${chipClass} ${convertFormat === mime ? activeChipClass : inactiveChipClass}`}>{label}</button>
              ))}
            </div>
            {convertFormat !== "image/png" && <><label className="mt-5 block text-sm font-medium text-fg">Quality <span className="text-muted">{convertQuality}</span></label><input className="mt-2 w-full accent-current" type="range" min="1" max="100" value={convertQuality} onChange={(e) => setConvertQuality(Number(e.target.value))} /></>}
            <Button type="button" className="mt-5" disabled={busy || !files.length} onClick={() => runBatch("convert")}>
              {busy ? "Converting…" : "Convert images"}
            </Button>
          </section>
          <section>
            <h3 className="mb-3 font-display text-xl font-semibold text-fg">Results</h3>
            <ResultList results={results} pendingText="Upload images, choose a format, then press Convert." onDownloadAll={() => downloadAll("pixly-converted.zip")} />
          </section>
        </div>
      )}

      {activeTool === "crop" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-[0.7fr_1.3fr]">
          <section className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-xl font-semibold text-fg">Aspect ratio</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {[[0, "Freeform"], [1, "1:1"], [4 / 3, "4:3"], [16 / 9, "16:9"], [9 / 16, "9:16"]].map(([ratio, label]) => (
                  <button key={label} type="button" onClick={() => selectCropRatio(ratio)} className={`${chipClass} ${cropRatio === ratio ? activeChipClass : inactiveChipClass}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-xl font-semibold text-fg">Output</h3>
              <p className="mt-2 text-sm text-muted">Selection: {cropDimensions}</p>
              <Button type="button" className="mt-4" disabled={busy || !firstFile} onClick={cropAndDownload}>{busy ? "Cropping…" : "Apply crop & download"}</Button>
            </div>
          </section>
          <section>
            {!firstFile ? <EmptyState>Upload a single image above to crop it.</EmptyState> : (
              <div
                ref={stageRef}
                onPointerMove={moveCrop}
                onPointerUp={() => { dragRef.current = null; }}
                onPointerCancel={() => { dragRef.current = null; }}
                className="relative mx-auto w-fit max-w-full touch-none overflow-hidden rounded-xl border border-border bg-fg shadow-soft"
              >
                <img src={firstFile.url} alt="Crop preview" className="block max-h-[520px] max-w-full select-none" draggable="false" />
                <div className="pointer-events-none absolute inset-0 bg-black/40" />
                <div
                  className="absolute cursor-move border-2 border-white shadow-lg"
                  style={{ left: `${selection.x * 100}%`, top: `${selection.y * 100}%`, width: `${selection.w * 100}%`, height: `${selection.h * 100}%`, backgroundImage: `url(${firstFile.url})`, backgroundSize: `${100 / selection.w}% ${100 / selection.h}%`, backgroundPosition: `${selection.w < 1 ? selection.x / (1 - selection.w) * 100 : 0}% ${selection.h < 1 ? selection.y / (1 - selection.h) * 100 : 0}%` }}
                  onPointerDown={(event) => startCropDrag(event, "move")}
                >
                  {["nw", "ne", "sw", "se"].map((corner) => <span key={corner} onPointerDown={(event) => { event.stopPropagation(); startCropDrag(event, corner); }} className={`absolute h-4 w-4 rounded-full border-2 border-white bg-fg ${corner.includes("n") ? "-top-2" : "-bottom-2"} ${corner.includes("w") ? "-left-2" : "-right-2"}`} />)}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTool === "rotate" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <h3 className="font-display text-xl font-semibold text-fg">Transform</h3>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRotation((value) => value - 90)}><RotateCcw size={16} /> Rotate left</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setRotation((value) => value + 90)}><RotateCw size={16} /> Rotate right</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setFlipX((value) => value * -1)}><FlipHorizontal2 size={16} /> Flip horizontal</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setFlipY((value) => value * -1)}><FlipVertical2 size={16} /> Flip vertical</Button>
            </div>
            <Button type="button" className="mt-5" disabled={busy || !files.length} onClick={() => runBatch("rotate")}>{busy ? "Processing…" : "Apply to all & get results"}</Button>
          </section>
          <section>
            <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-soft">
              {firstFile ? <img src={firstFile.url} alt="Transform preview" className="max-h-72 max-w-full object-contain transition-transform duration-200" style={{ transform: `rotate(${rotation}deg) scale(${flipX}, ${flipY})` }} /> : <p className="text-sm italic text-muted">Upload an image to preview rotation and flipping.</p>}
            </div>
            <div className="mt-4"><ResultList results={results} pendingText="Your transformed results will appear here." onDownloadAll={() => downloadAll("pixly-edited.zip")} /></div>
          </section>
        </div>
      )}

      {activeTool === "favicon" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <h3 className="font-display text-xl font-semibold text-fg">Favicon generator</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">Upload a square or near-square logo. Pixly center-crops it and generates every standard PNG size you need.</p>
            <Button type="button" className="mt-5" disabled={busy || !firstFile} onClick={generateFavicons}>{busy ? "Generating…" : "Generate favicon set"}</Button>
          </section>
          <section>
            <h3 className="mb-3 font-display text-xl font-semibold text-fg">Generated sizes</h3>
            <ResultList results={results} pendingText="Upload a single image to generate a favicon set." onDownloadAll={() => downloadAll("pixly-favicons.zip")} />
          </section>
        </div>
      )}
    </div>
  );
}
