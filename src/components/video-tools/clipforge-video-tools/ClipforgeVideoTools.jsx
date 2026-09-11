/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Film, Info, ShieldCheck, Upload } from "lucide-react";
import Button from "@/components/ui/Button";

const TOOL_TABS = [
  ["metadata", "Metadata Viewer"],
  ["compress", "Compressor"],
  ["convert", "Format Converter"],
  ["fps", "Change FPS"],
  ["crop", "Crop Video"],
  ["enhance", "Enhance Quality"],
  ["extract", "Extract Audio"],
  ["resize", "Resize Dimensions"],
  ["rotate", "Rotate Video"],
];

const TOOL_COPY = {
  metadata: ["Video Metadata Viewer", "See file details, duration, resolution, aspect ratio, orientation and estimated bitrate."],
  compress: ["Video Compressor", "Shrink a video's file size for easier sharing while keeping it widely playable as an MP4."],
  convert: ["Video Format Converter", "Convert a video into a different container and codec for a device, editor or platform."],
  fps: ["Change Video FPS", "Re-encode a video at 15, 24, 25, 30, 50 or 60 frames per second."],
  crop: ["Crop Video", "Trim black bars, focus on a subject or reframe for square, portrait or landscape output."],
  enhance: ["Enhance Video Quality", "Apply classic sharpening, noise reduction and color correction filters."],
  extract: ["Extract Audio from Video", "Save a video's soundtrack as MP3, WAV, M4A/AAC or OGG Vorbis."],
  resize: ["Resize Video Dimensions", "Scale down for faster uploads or match a resolution required by a platform."],
  rotate: ["Rotate Video", "Fix a sideways or upside-down clip, or flip it horizontally or vertically."],
};

const inputClass = "rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg focus-ring";
const chipClass = "rounded-full border px-3 py-1.5 text-sm font-medium transition focus-ring";
const activeChipClass = "border-fg bg-fg text-surface hover:text-surface";
const inactiveChipClass = "border-border bg-surface text-muted hover:text-fg";

let ffmpegInstance = null;
let ffmpegLoadingPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.FFmpeg) resolve();
      else existing.addEventListener("load", resolve, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("The video engine could not be downloaded."));
    document.head.appendChild(script);
  });
}

async function loadFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  if (!ffmpegLoadingPromise) {
    ffmpegLoadingPromise = (async () => {
      if (!window.FFmpeg) await loadScript("https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js");
      if (!window.FFmpeg?.createFFmpeg) throw new Error("The video engine is unavailable in this browser.");
   const instance = window.FFmpeg.createFFmpeg({
  log: false,
  mainName: "main",
  corePath:
    "https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js",
});
      await instance.load();
      ffmpegInstance = instance;
      return instance;
    })().catch((error) => {
      ffmpegLoadingPromise = null;
      throw error;
    });
  }
  return ffmpegLoadingPromise;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${index ? value.toFixed(value < 10 ? 2 : 1) : value} ${units[index]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function extension(name) {
  return name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "mp4";
}

function evenDown(value) {
  const number = Math.max(2, Math.floor(Number(value) || 2));
  return number % 2 === 0 ? number : number - 1;
}

function evenFloor(value) {
  const number = Math.max(0, Math.floor(Number(value) || 0));
  return number % 2 === 0 ? number : number - 1;
}

function mimeForExtension(ext) {
  return {
    mp4: "video/mp4",
    webm: "video/webm",
    mkv: "video/x-matroska",
    mov: "video/quicktime",
    gif: "image/gif",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
  }[ext] || "application/octet-stream";
}

function outputFor(tool, format) {
  if (tool === "convert") return { ext: format, name: `converted.${format}` };
  if (tool === "extract") return { ext: format, name: `audio.${format}` };
  const names = {
    compress: "compressed.mp4",
    fps: "retimed.mp4",
    crop: "cropped.mp4",
    enhance: "enhanced.mp4",
    resize: "resized.mp4",
    rotate: "rotated.mp4",
  };
  return { ext: "mp4", name: names[tool] || "processed.mp4" };
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

export default function ClipforgeVideoTools() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [activeTool, setActiveTool] = useState("metadata");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [output, setOutput] = useState(null);
  const [compressQuality, setCompressQuality] = useState("24");
  const [capResolution, setCapResolution] = useState(false);
  const [convertFormat, setConvertFormat] = useState("mp4");
  const [targetFps, setTargetFps] = useState("30");
  const [crop, setCrop] = useState({ width: "", height: "", x: "0", y: "0" });
  const [sharpen, setSharpen] = useState(true);
  const [boostColor, setBoostColor] = useState(true);
  const [denoise, setDenoise] = useState(false);
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [resize, setResize] = useState({ width: "", height: "" });
  const [keepAspect, setKeepAspect] = useState(true);
  const [rotateMode, setRotateMode] = useState("cw");
  const fileInputRef = useRef(null);

  useEffect(() => () => fileUrl && URL.revokeObjectURL(fileUrl), [fileUrl]);
  useEffect(() => () => output?.url && URL.revokeObjectURL(output.url), [output]);

  function clearOutput() {
    setOutput((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
    setProgress(0);
    setStatus("");
    setError("");
  }

  function chooseFile(selectedFile) {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv|avi|m4v|ogv)$/i.test(selectedFile.name)) {
      setError("Choose a valid video file.");
      return;
    }
    setFile(selectedFile);
    setFileUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(selectedFile);
    });
    setMetadata(null);
    clearOutput();
  }

  function handleMetadata(event) {
    if (!file) return;
    const video = event.currentTarget;
    const divisor = gcd(video.videoWidth, video.videoHeight) || 1;
    const duration = video.duration;
    setMetadata({
      width: video.videoWidth,
      height: video.videoHeight,
      duration,
      ratio: `${video.videoWidth / divisor}:${video.videoHeight / divisor}`,
      orientation: video.videoWidth === video.videoHeight ? "Square" : video.videoWidth > video.videoHeight ? "Landscape" : "Portrait",
      bitrate: duration > 0 ? `${Math.round((file.size * 8 / duration) / 1000)} kbps` : "—",
    });
    setCrop({ width: String(evenDown(video.videoWidth)), height: String(evenDown(video.videoHeight)), x: "0", y: "0" });
    setResize({ width: String(evenDown(video.videoWidth)), height: String(evenDown(video.videoHeight)) });
  }

  function selectTool(tool) {
    setActiveTool(tool);
    clearOutput();
  }

  function setCropPreset(preset) {
    if (!metadata) return;
    let width = metadata.width;
    let height = metadata.height;
    if (preset === "square") width = height = Math.min(width, height);
    if (preset === "portrait") {
      width = evenDown(height * 9 / 16);
      if (width > metadata.width) {
        width = metadata.width;
        height = evenDown(width * 16 / 9);
      }
    }
    if (preset === "landscape") {
      height = evenDown(width * 9 / 16);
      if (height > metadata.height) {
        height = metadata.height;
        width = evenDown(height * 16 / 9);
      }
    }
    width = evenDown(width);
    height = evenDown(height);
    setCrop({
      width: String(width),
      height: String(height),
      x: String(evenFloor((metadata.width - width) / 2)),
      y: String(evenFloor((metadata.height - height) / 2)),
    });
  }

  function resizePreset(targetHeight) {
    const sourceWidth = metadata?.width || 16;
    const sourceHeight = metadata?.height || 9;
    setResize({
      width: String(evenDown(targetHeight * sourceWidth / sourceHeight)),
      height: String(evenDown(targetHeight)),
    });
    setKeepAspect(true);
  }

  function buildArguments(inputName, outputName) {
    if (activeTool === "compress") {
      const args = ["-i", inputName];
      if (capResolution) args.push("-vf", "scale='min(1280,iw)':-2");
      return [...args, "-vcodec", "libx264", "-preset", "veryfast", "-crf", compressQuality, "-pix_fmt", "yuv420p", "-acodec", "aac", "-b:a", "128k", outputName];
    }
    if (activeTool === "convert") {
      if (convertFormat === "webm") return ["-i", inputName, "-c:v", "libvpx", "-b:v", "1M", "-c:a", "libvorbis", outputName];
      if (convertFormat === "gif") return ["-i", inputName, "-vf", "fps=10,scale=480:-1:flags=lanczos", outputName];
      return ["-i", inputName, "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", outputName];
    }
    if (activeTool === "fps") return ["-i", inputName, "-filter:v", `fps=fps=${targetFps}`, "-vcodec", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", outputName];
    if (activeTool === "crop") {
      const width = evenDown(crop.width);
      const height = evenDown(crop.height);
      const x = evenFloor(crop.x);
      const y = evenFloor(crop.y);
      if (metadata && (x + width > metadata.width || y + height > metadata.height)) throw new Error("The crop rectangle must stay inside the original frame.");
      return ["-i", inputName, "-filter:v", `crop=${width}:${height}:${x}:${y}`, "-vcodec", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", outputName];
    }
    if (activeTool === "enhance") {
      const filters = [];
      if (denoise) filters.push("hqdn3d=2:1:2:1");
      if (boostColor) filters.push("eq=contrast=1.08:saturation=1.15:brightness=0.02");
      if (sharpen) filters.push("unsharp=5:5:0.8:5:5:0.0");
      if (!filters.length) filters.push("eq=contrast=1.03:saturation=1.05");
      return ["-i", inputName, "-vf", filters.join(","), "-vcodec", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", outputName];
    }
    if (activeTool === "extract") {
      if (audioFormat === "mp3") return ["-i", inputName, "-vn", "-acodec", "libmp3lame", "-q:a", "2", outputName];
      if (audioFormat === "wav") return ["-i", inputName, "-vn", "-acodec", "pcm_s16le", outputName];
      if (audioFormat === "m4a") return ["-i", inputName, "-vn", "-acodec", "aac", "-b:a", "192k", outputName];
      return ["-i", inputName, "-vn", "-acodec", "libvorbis", "-q:a", "5", outputName];
    }
    if (activeTool === "resize") {
      if (!Number(resize.width)) throw new Error("Enter at least a target width.");
      const filter = keepAspect ? `scale=${evenDown(resize.width)}:-2` : `scale=${evenDown(resize.width)}:${evenDown(resize.height || resize.width)}`;
      return ["-i", inputName, "-vf", filter, "-vcodec", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", outputName];
    }
    const filters = { cw: "transpose=1", ccw: "transpose=2", "180": "transpose=2,transpose=2", hflip: "hflip", vflip: "vflip" };
    return ["-i", inputName, "-vf", filters[rotateMode], "-vcodec", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", outputName];
  }

  async function processVideo() {
    if (!file) return setError("Choose a video file first.");
    clearOutput();
    setBusy(true);
    setProgress(2);
    setError("");
    setStatus(ffmpegInstance ? "Preparing file…" : "Loading video engine (first time only, about 25 MB)…");
    try {
      const format = activeTool === "convert" ? convertFormat : activeTool === "extract" ? audioFormat : "mp4";
      const outputInfo = outputFor(activeTool, format);
      const inputName = `input-${Date.now()}.${extension(file.name)}`;
      const outputName = `output-${Date.now()}.${outputInfo.ext}`;
      const ffmpeg = await loadFFmpeg();
      ffmpeg.setProgress(({ ratio }) => {
        const next = Math.min(99, Math.max(2, Math.round((Number(ratio) || 0) * 100)));
        setProgress(next);
        setStatus(`Processing… ${next}%`);
      });
      setStatus("Preparing file…");
      const data = await window.FFmpeg.fetchFile(file);
      ffmpeg.FS("writeFile", inputName, data);
      await ffmpeg.run(...buildArguments(inputName, outputName));
      const result = ffmpeg.FS("readFile", outputName);
      try { ffmpeg.FS("unlink", inputName); } catch {}
      try { ffmpeg.FS("unlink", outputName); } catch {}
      const blob = new Blob([result.buffer], { type: mimeForExtension(outputInfo.ext) });
      setOutput({ blob, url: URL.createObjectURL(blob), name: outputInfo.name, type: outputInfo.ext });
      setProgress(100);
      setStatus("Done.");
    } catch (processError) {
      setError(processError.message || "Something went wrong. Try a shorter clip or another source file.");
      setStatus("");
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  const [toolTitle, toolDescription] = TOOL_COPY[activeTool];
  const buttonLabels = {
    compress: "Compress video",
    convert: "Convert video",
    fps: "Change frame rate",
    crop: "Crop video",
    enhance: "Enhance video",
    extract: "Extract audio",
    resize: "Resize video",
    rotate: "Rotate video",
  };

  return (
    <div>
      <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        {!fileUrl ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && fileInputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition focus-ring ${dragging ? "border-fg bg-surface" : "border-border bg-surface hover:border-muted"}`}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-card text-fg shadow-soft"><Upload size={23} /></span>
            <h2 className="mt-3 font-display text-xl font-semibold text-fg">Drop a video here, or choose one</h2>
            <p className="mt-1 text-sm text-muted">MP4, WebM, MOV, MKV, AVI and more — stays on this device</p>
          </div>
        ) : (
          <div>
            <video src={fileUrl} controls playsInline onLoadedMetadata={handleMetadata} className="max-h-[520px] w-full rounded-xl bg-black" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{file.name}</p>
                <p className="mt-0.5 text-sm text-muted">{formatBytes(file.size)}{metadata ? ` · ${formatDuration(metadata.duration)} · ${metadata.width}×${metadata.height}` : ""}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Choose another file</Button>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="video/*,.mkv,.avi" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <p className="mt-3 flex items-center gap-2 text-sm text-muted"><ShieldCheck size={16} className="shrink-0 text-success" />Nothing leaves your browser. Processing happens on this device.</p>
      </section>

      <section className="mt-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TOOL_TABS.map(([id, label]) => (
            <button key={id} type="button" onClick={() => selectTool(id)} className={`${chipClass} shrink-0 ${activeTool === id ? activeChipClass : inactiveChipClass}`}>{label}</button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-fg"><Film size={20} /></span>
            <div><h2 className="font-display text-xl font-semibold tracking-tight text-fg">{toolTitle}</h2><p className="mt-1 text-sm leading-relaxed text-muted">{toolDescription}</p></div>
          </div>

          {activeTool === "metadata" && (
            metadata && file ? (
              <div className="mt-6 overflow-hidden rounded-xl border border-border">
                {[
                  ["File name", file.name], ["File size", formatBytes(file.size)], ["File type", file.type || `video/${extension(file.name)}`],
                  ["Last modified", file.lastModified ? new Date(file.lastModified).toLocaleString() : "—"],
                  ["Duration", `${formatDuration(metadata.duration)} (${metadata.duration.toFixed(2)}s)`], ["Resolution", `${metadata.width} × ${metadata.height} px`],
                  ["Aspect ratio", metadata.ratio], ["Orientation", metadata.orientation], ["Approx. bitrate", metadata.bitrate],
                ].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(120px,0.45fr)_1fr] border-b border-border last:border-0"><span className="bg-surface px-4 py-3 text-sm font-medium text-fg">{label}</span><span className="min-w-0 break-words px-4 py-3 text-sm text-muted">{value}</span></div>)}
              </div>
            ) : <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm italic text-muted">Choose a video above to inspect its metadata.</div>
          )}

          {activeTool === "compress" && <div className="mt-6 space-y-4"><label className="block text-sm font-medium text-fg">Quality<select className={`${inputClass} mt-2 block w-full sm:w-80`} value={compressQuality} onChange={(e) => setCompressQuality(e.target.value)}><option value="18">Higher quality, larger file</option><option value="24">Balanced (recommended)</option><option value="30">Smaller file, lower quality</option></select></label><label className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={capResolution} onChange={(e) => setCapResolution(e.target.checked)} /> Also cap resolution at 720p for extra savings</label></div>}

          {activeTool === "convert" && <label className="mt-6 block text-sm font-medium text-fg">Convert to<select className={`${inputClass} mt-2 block w-full sm:w-96`} value={convertFormat} onChange={(e) => setConvertFormat(e.target.value)}><option value="mp4">MP4 (H.264 + AAC) — most compatible</option><option value="webm">WebM (VP8 + Vorbis)</option><option value="mkv">MKV (H.264 + AAC)</option><option value="mov">MOV (H.264 + AAC)</option><option value="gif">Animated GIF (no audio)</option></select></label>}

          {activeTool === "fps" && <label className="mt-6 block text-sm font-medium text-fg">Target frame rate<select className={`${inputClass} mt-2 block w-full sm:w-80`} value={targetFps} onChange={(e) => setTargetFps(e.target.value)}>{[[15,"15 fps"],[24,"24 fps (cinematic)"],[25,"25 fps (PAL)"],[30,"30 fps"],[50,"50 fps"],[60,"60 fps"]].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>}

          {activeTool === "crop" && <div className="mt-6"><p className="text-sm text-muted">Original size: {metadata ? `${metadata.width} × ${metadata.height}` : "choose a video first"}</p><div className="mt-3 flex flex-wrap gap-2">{[["square","Square 1:1"],["portrait","Portrait 9:16"],["landscape","Landscape 16:9"],["reset","Full frame"]].map(([id,label]) => <button key={id} type="button" className={`${chipClass} ${inactiveChipClass}`} onClick={() => setCropPreset(id)}>{label}</button>)}</div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["width","Width"],["height","Height"],["x","Offset X"],["y","Offset Y"]].map(([key,label]) => <label key={key} className="text-sm font-medium text-fg">{label}<input className={`${inputClass} mt-2 w-full`} type="number" min="0" value={crop[key]} onChange={(e) => setCrop((current) => ({...current,[key]:e.target.value}))} /></label>)}</div></div>}

          {activeTool === "enhance" && <div className="mt-6 space-y-3">{[["Sharpen detail",sharpen,setSharpen],["Boost contrast & color",boostColor,setBoostColor],["Reduce grain / noise",denoise,setDenoise]].map(([label,value,setValue]) => <label key={label} className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={value} onChange={(e) => setValue(e.target.checked)} /> {label}</label>)}</div>}

          {activeTool === "extract" && <label className="mt-6 block text-sm font-medium text-fg">Audio format<select className={`${inputClass} mt-2 block w-full sm:w-80`} value={audioFormat} onChange={(e) => setAudioFormat(e.target.value)}><option value="mp3">MP3</option><option value="wav">WAV (uncompressed)</option><option value="m4a">M4A / AAC</option><option value="ogg">OGG (Vorbis)</option></select></label>}

          {activeTool === "resize" && <div className="mt-6"><div className="flex flex-wrap gap-2">{[[2160,"4K (2160p)"],[1080,"1080p"],[720,"720p"],[480,"480p"],[360,"360p"]].map(([value,label]) => <button key={value} type="button" className={`${chipClass} ${inactiveChipClass}`} onClick={() => resizePreset(value)}>{label}</button>)}</div><div className="mt-4 grid max-w-xl grid-cols-2 gap-3"><label className="text-sm font-medium text-fg">Width<input className={`${inputClass} mt-2 w-full`} type="number" min="2" value={resize.width} onChange={(e) => setResize((current) => ({...current,width:e.target.value}))} /></label><label className="text-sm font-medium text-fg">Height<input className={`${inputClass} mt-2 w-full`} type="number" min="2" value={resize.height} onChange={(e) => setResize((current) => ({...current,height:e.target.value}))} /></label></div><label className="mt-3 flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} /> Keep aspect ratio (uses width only)</label></div>}

          {activeTool === "rotate" && <div className="mt-6 flex flex-wrap gap-2">{[["cw","Rotate 90° CW"],["ccw","Rotate 90° CCW"],["180","Rotate 180°"],["hflip","Flip horizontal"],["vflip","Flip vertical"]].map(([value,label]) => <button key={value} type="button" onClick={() => setRotateMode(value)} className={`${chipClass} ${rotateMode === value ? activeChipClass : inactiveChipClass}`}>{label}</button>)}</div>}

          {activeTool !== "metadata" && (
            <div className="mt-6">
              <Button type="button" disabled={busy || !file} onClick={processVideo}>{busy ? "Processing…" : buttonLabels[activeTool]}</Button>
              {(busy || progress > 0) && <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-fg transition-all" style={{ width: `${progress}%` }} /></div>}
              {status && <p className="mt-2 text-sm text-muted">{status}</p>}
              {error && <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg">{error}</p>}
            </div>
          )}

          {output && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-4">
              {activeTool === "extract" ? <audio src={output.url} controls className="w-full" /> : output.type === "gif" ? <img src={output.url} alt="Converted GIF preview" className="max-h-96 max-w-full rounded-lg" /> : <video src={output.url} controls playsInline className="max-h-[480px] w-full rounded-lg bg-black" />}
              {activeTool === "compress" && <div className="mt-4 grid grid-cols-3 gap-3 text-center"><div><p className="font-semibold text-fg">{formatBytes(file.size)}</p><p className="text-xs text-muted">Original</p></div><div><p className="font-semibold text-fg">{formatBytes(output.blob.size)}</p><p className="text-xs text-muted">New size</p></div><div><p className="font-semibold text-fg">{Math.max(0,Math.round((1-output.blob.size/file.size)*100))}%</p><p className="text-xs text-muted">Saved</p></div></div>}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => downloadBlob(output.blob, output.name)}><Download size={16} /> Download {output.name}</Button>
            </div>
          )}

          {activeTool === "metadata" && <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted"><Info size={15} className="mt-0.5 shrink-0" />Frame rate and codec details are not exposed reliably by browsers for arbitrary local files. The displayed bitrate is estimated from file size and duration.</p>}
        </div>
      </section>
    </div>
  );
}
