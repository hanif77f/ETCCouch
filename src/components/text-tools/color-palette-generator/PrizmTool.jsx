"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Home, Pipette, Blend, Image as ImageIcon, Contrast, Layers, Bookmark, HelpCircle, Search, X } from "lucide-react";
import Button from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Color math — ported 1:1 from the standalone prototype               */
/* ------------------------------------------------------------------ */
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function hexToRgb(hex) {
  hex = hex.replace("#", "").trim();
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  const h = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return "#" + h(r) + h(g) + h(b);
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; } else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h;
  if (d === 0) h = 0;
  else if (max === r) h = 60 * (((g - b) / d) % 6);
  else if (max === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return { h, s: s * 100, v: max * 100 };
}
function hsvToRgb(h, s, v) {
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; } else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
function relLuminance(r, g, b) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(hex1, hex2) {
  const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 1;
  const l1 = relLuminance(c1.r, c1.g, c1.b), l2 = relLuminance(c2.r, c2.g, c2.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function isValidHex(hex) {
  return /^#?[0-9a-fA-F]{6}$/.test(hex) || /^#?[0-9a-fA-F]{3}$/.test(hex);
}
function normalizeHex(hex) {
  if (!hex) return "";
  if (!hex.startsWith("#")) hex = "#" + hex;
  return hex.toLowerCase();
}
function readableTextColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#16171A";
  return relLuminance(rgb.r, rgb.g, rgb.b) > 0.42 ? "#16171A" : "#FFFFFF";
}
function downloadText(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: Home, group: "main" },
  { id: "picker", label: "Picker", Icon: Pipette, group: "studio" },
  { id: "harmonies", label: "Harmonies", Icon: Blend, group: "studio" },
  { id: "extract", label: "Extract", Icon: ImageIcon, group: "studio" },
  { id: "contrast", label: "Contrast", Icon: Contrast, group: "studio" },
  { id: "shades", label: "Shades", Icon: Layers, group: "studio" },
  { id: "saved", label: "Saved", Icon: Bookmark, group: "studio" },
  { id: "faqs", label: "FAQs", Icon: HelpCircle, group: "resources" },
];

/* ------------------------------------------------------------------ */
/* Prizm context — replaces the original's window.__prizm* globals      */
/* ------------------------------------------------------------------ */
const PrizmContext = createContext(null);
function usePrizm() { return useContext(PrizmContext); }

/* ------------------------------------------------------------------ */
/* Toast                                                                */
/* ------------------------------------------------------------------ */
function Toast({ message }) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-fg px-4 py-2.5 text-sm font-semibold text-surface shadow-lift transition-opacity ${
        message ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Swatch card — shared by Harmonies / Extract / Shades                */
/* ------------------------------------------------------------------ */
function SwatchCard({ hex, label }) {
  const { addColor, copy } = usePrizm();
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="flex h-16 items-end p-2 font-mono text-xs font-semibold"
        style={{ background: hex, color: readableTextColor(hex) }}
      >
        {label}
      </div>
      <div className="flex items-center justify-between gap-2 bg-card p-2">
        <span className="font-mono text-xs text-fg">{hex}</span>
        <div className="flex gap-1.5">
          <button type="button" className="text-xs font-semibold text-accent-soft hover:underline" onClick={() => addColor(hex)}>Add</button>
          <button type="button" className="text-xs font-semibold text-muted hover:underline" onClick={() => copy(hex)}>Copy</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home panel                                                           */
/* ------------------------------------------------------------------ */
const HERO_DEFAULT = ["#6331ab", "#b98fe8", "#2e5c3a", "#caa14a", "#b23b2e"];
const FEATURES = [
  { id: "picker", color: "#6331ab", title: "Precision picker", desc: "A saturation/brightness canvas plus a hue slider, kept in sync with editable HEX, RGB, and HSL fields." },
  { id: "harmonies", color: "#2e5c3a", title: "Color harmonies", desc: "Generate complementary, analogous, triadic, split-complementary, tetradic, and monochromatic sets from any base color." },
  { id: "extract", color: "#caa14a", title: "Image extraction", desc: "Drop in a photo or screenshot and pull its dominant colors, processed locally with no upload." },
  { id: "contrast", color: "#131316", title: "Contrast checker", desc: "Test a text/background pair against WCAG AA and AAA thresholds, for both normal and large text." },
  { id: "shades", color: "#b23b2e", title: "Shade ramps", desc: "Turn one base color into a full 50–950 scale, the same shape as a Tailwind color token set." },
  { id: "saved", color: "#b98fe8", title: "Export & save", desc: "Save palettes locally, then export to CSS variables, SCSS, Tailwind config, JSON, or plain lists." },
];
function HomePanel({ setActivePanel }) {
  const { palette } = usePrizm();
  const heroColors = palette.length >= 3 ? palette.slice(0, 6) : HERO_DEFAULT;
  return (
    <div>
      <div className="flex flex-col gap-8 py-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-soft">Color palette studio</p>
          <h1 className="mt-2 max-w-[15ch] font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Pick, extract, and check colors — right in your browser.
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Prizm is a free set of color tools for designers and developers: a precision picker, harmony generator,
            image extractor, WCAG contrast checker, and shade ramp builder. No account, no install, nothing leaves
            your device.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={() => setActivePanel("picker")}>Open the picker</Button>
            <Button type="button" variant="outline" onClick={() => setActivePanel("faqs")}>Browse the FAQs</Button>
          </div>
        </div>
        <div className="grid h-56 flex-1 grid-flow-col gap-0 overflow-hidden rounded-xl border border-border" style={{ gridTemplateColumns: `repeat(${heroColors.length}, 1fr)` }}>
          {heroColors.map((c, i) => <div key={i} style={{ background: c }} />)}
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold tracking-tight text-fg">Everything in one tray</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActivePanel(f.id)}
            className="rounded-xl border border-border bg-card p-4 text-left shadow-soft transition hover:-translate-y-0.5"
          >
            <div className="h-2.5 w-10 rounded-full" style={{ background: f.color }} />
            <h3 className="mt-3 font-display text-base font-semibold text-fg">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div>
          <h3 className="font-semibold text-fg">No sign-up, no lock-in</h3>
          <p className="mt-1 text-sm text-muted">Every tool runs client-side. Saved palettes live in your browser&apos;s local storage — nothing is uploaded to a server.</p>
        </div>
        <div>
          <h3 className="font-semibold text-fg">Built for real design work</h3>
          <p className="mt-1 text-sm text-muted">Export straight to CSS variables, SCSS, Tailwind config, or JSON — whatever your codebase already speaks.</p>
        </div>
        <div>
          <h3 className="font-semibold text-fg">Accessible by default</h3>
          <p className="mt-1 text-sm text-muted">The contrast checker uses the same relative-luminance math as WCAG 2.1, so what passes here passes an audit.</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Picker panel                                                         */
/* ------------------------------------------------------------------ */
function PickerPanel() {
  const { addColor, copy } = usePrizm();
  const [hsv, setHsv] = useState({ h: 265, s: 71, v: 67 });
  const [hexText, setHexText] = useState("#6331ab");
  const [rgbText, setRgbText] = useState("99,49,171");
  const [hslText, setHslText] = useState("265,55%,43%");
  const svCanvasRef = useRef(null);
  const svWrapRef = useRef(null);
  const draggingRef = useRef(false);

  function applyHsv(nextHsv, skip) {
    setHsv(nextHsv);
    const rgb = hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    if (skip !== "hex") setHexText(hex);
    if (skip !== "rgb") setRgbText(`${rgb.r},${rgb.g},${rgb.b}`);
    if (skip !== "hsl") setHslText(`${hsl.h},${hsl.s}%,${hsl.l}%`);
  }

  const currentHex = hexText;

  useEffect(() => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const rgbFull = hsvToRgb(hsv.h, 100, 100);
    const satGrad = ctx.createLinearGradient(0, 0, w, 0);
    satGrad.addColorStop(0, "rgb(255,255,255)");
    satGrad.addColorStop(1, `rgb(${rgbFull.r},${rgbFull.g},${rgbFull.b})`);
    ctx.fillStyle = satGrad;
    ctx.fillRect(0, 0, w, h);
    const valGrad = ctx.createLinearGradient(0, 0, 0, h);
    valGrad.addColorStop(0, "rgba(0,0,0,0)");
    valGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = valGrad;
    ctx.fillRect(0, 0, w, h);
  }, [hsv.h]);

  function svPointer(clientX, clientY) {
    const rect = svWrapRef.current.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);
    applyHsv({ h: hsv.h, s: Math.round(x * 100), v: Math.round((1 - y) * 100) });
  }

  useEffect(() => {
    function move(e) {
      if (!draggingRef.current) return;
      const t = e.touches ? e.touches[0] : e;
      svPointer(t.clientX, t.clientY);
    }
    function up() { draggingRef.current = false; }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsv]);

  function handleHexChange(v) {
    setHexText(v);
    const hex = normalizeHex(v);
    if (!isValidHex(hex)) return;
    const rgb = hexToRgb(hex);
    applyHsv(rgbToHsv(rgb.r, rgb.g, rgb.b), "hex");
  }
  function handleRgbChange(v) {
    setRgbText(v);
    const parts = v.split(",").map((n) => parseInt(n.trim(), 10));
    if (parts.length !== 3 || parts.some(isNaN)) return;
    const [r, g, b] = parts.map((n) => clamp(n, 0, 255));
    applyHsv(rgbToHsv(r, g, b), "rgb");
  }
  function handleHslChange(v) {
    setHslText(v);
    const m = v.match(/(-?\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
    if (!m) return;
    const h = Number(m[1]), s = clamp(Number(m[2]), 0, 100), l = clamp(Number(m[3]), 0, 100);
    const rgb = hslToRgb(h, s, l);
    applyHsv(rgbToHsv(rgb.r, rgb.g, rgb.b), "hsl");
  }

  const tintSteps = [90, 75, 60, 45, 30, 15, -15, -30];
  const baseRgb = hexToRgb(currentHex) || { r: 99, g: 49, b: 171 };
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const tints = tintSteps.map((delta) => {
    const l = Math.min(97, Math.max(3, baseHsl.l + delta * 0.35));
    const c = hslToRgb(baseHsl.h, baseHsl.s, l);
    return rgbToHex(c.r, c.g, c.b);
  });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Color Picker</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Dial in an exact color, then add it to your working palette.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <div
            ref={svWrapRef}
            className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-xl touch-none"
            onMouseDown={(e) => { draggingRef.current = true; svPointer(e.clientX, e.clientY); }}
            onTouchStart={(e) => { draggingRef.current = true; const t = e.touches[0]; svPointer(t.clientX, t.clientY); }}
          >
            <canvas ref={svCanvasRef} width={300} height={300} className="block h-full w-full" />
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
            />
          </div>
          <input
            type="range" min="0" max="360" value={hsv.h}
            onChange={(e) => applyHsv({ ...hsv, h: Number(e.target.value) })}
            className="mt-4 w-full"
            style={{ accentColor: currentHex }}
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div><label className={labelClass}>HEX</label><input className={`${fieldClass} w-full`} value={hexText} onChange={(e) => handleHexChange(e.target.value)} /></div>
            <div><label className={labelClass}>RGB</label><input className={`${fieldClass} w-full`} value={rgbText} onChange={(e) => handleRgbChange(e.target.value)} /></div>
            <div><label className={labelClass}>HSL</label><input className={`${fieldClass} w-full`} value={hslText} onChange={(e) => handleHslChange(e.target.value)} /></div>
          </div>
        </div>

        <div>
          <div className="h-44 rounded-xl border border-border" style={{ background: currentHex }} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => addColor(currentHex)}>Add to palette</Button>
            <Button type="button" variant="outline" onClick={() => copy(currentHex)}>Copy HEX</Button>
          </div>
          <h3 className="mt-6 font-display text-base font-semibold text-fg">Tints &amp; tones</h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {tints.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => handleHexChange(hex)}
                className="h-12 rounded-lg border border-border"
                style={{ background: hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Harmonies panel                                                       */
/* ------------------------------------------------------------------ */
const HARMONY_TYPES = [
  { id: "complementary", label: "Complementary", angles: [0, 180] },
  { id: "analogous", label: "Analogous", angles: [-30, 0, 30] },
  { id: "triadic", label: "Triadic", angles: [0, 120, 240] },
  { id: "split", label: "Split-complementary", angles: [0, 150, 210] },
  { id: "tetradic", label: "Tetradic", angles: [0, 90, 180, 270] },
  { id: "monochromatic", label: "Monochromatic", angles: [0] },
];
function generateHarmony(hex, typeId) {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (typeId === "monochromatic") {
    return [0.9, 0.7, 0.5, 0.32, 0.16].map((f) => {
      const l = Math.round(15 + f * 70);
      const c = hslToRgb(hsl.h, hsl.s, l);
      return rgbToHex(c.r, c.g, c.b);
    });
  }
  const type = HARMONY_TYPES.find((t) => t.id === typeId);
  return type.angles.map((a) => {
    const c = hslToRgb(hsl.h + a, hsl.s, hsl.l);
    return rgbToHex(c.r, c.g, c.b);
  });
}
function HarmoniesPanel() {
  const { addManyColors, toast } = usePrizm();
  const [baseHex, setBaseHex] = useState("#6331ab");
  const [type, setType] = useState("complementary");
  const colors = isValidHex(normalizeHex(baseHex)) ? generateHarmony(normalizeHex(baseHex), type) : [];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Color Harmonies</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Generate proven color relationships from a single base color.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <label className={labelClass}>Base HEX</label>
          <input
            className={`${fieldClass} w-full`}
            value={baseHex}
            onChange={(e) => setBaseHex(e.target.value)}
            onBlur={() => { if (!isValidHex(normalizeHex(baseHex))) toast("Enter a valid HEX"); }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {HARMONY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus-ring ${
                  type === t.id ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-fg">{HARMONY_TYPES.find((t) => t.id === type)?.label}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {colors.map((c) => <SwatchCard key={c} hex={c} />)}
          </div>
          <div className="mt-4">
            <Button type="button" onClick={() => addManyColors(colors)}>Add all to palette</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Extract panel                                                        */
/* ------------------------------------------------------------------ */
function extractColors(data, k) {
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length === 0) return [];
  let centroids = [];
  for (let c = 0; c < k; c++) centroids.push(pixels[Math.floor((c / k) * pixels.length)].slice());
  for (let iter = 0; iter < 8; iter++) {
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (const p of pixels) {
      let bestI = 0, bestD = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = (p[0] - centroids[c][0]) ** 2 + (p[1] - centroids[c][1]) ** 2 + (p[2] - centroids[c][2]) ** 2;
        if (d < bestD) { bestD = d; bestI = c; }
      }
      sums[bestI][0] += p[0]; sums[bestI][1] += p[1]; sums[bestI][2] += p[2]; sums[bestI][3]++;
    }
    centroids = centroids.map((c, i) => (sums[i][3] > 0 ? [sums[i][0] / sums[i][3], sums[i][1] / sums[i][3], sums[i][2] / sums[i][3]] : c));
  }
  const counts = centroids.map(() => 0);
  for (const p of pixels) {
    let bestI = 0, bestD = Infinity;
    for (let c = 0; c < centroids.length; c++) {
      const d = (p[0] - centroids[c][0]) ** 2 + (p[1] - centroids[c][1]) ** 2 + (p[2] - centroids[c][2]) ** 2;
      if (d < bestD) { bestD = d; bestI = c; }
    }
    counts[bestI]++;
  }
  const order = centroids.map((c, i) => i).sort((a, b) => counts[b] - counts[a]);
  return order.map((i) => rgbToHex(centroids[i][0], centroids[i][1], centroids[i][2]));
}
function ExtractPanel() {
  const { addManyColors, toast } = usePrizm();
  const [previewSrc, setPreviewSrc] = useState("");
  const [count, setCount] = useState(6);
  const [colors, setColors] = useState([]);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const lastImageDataRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function getImageData(img) {
    const canvas = document.createElement("canvas");
    const maxDim = 160;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  }
  function runExtraction(k) {
    if (!lastImageDataRef.current) return;
    setColors(extractColors(lastImageDataRef.current, k));
  }
  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) { toast("Please choose an image file"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSrc(e.target.result);
    };
    reader.readAsDataURL(file);
  }
  function onImgLoad() {
    lastImageDataRef.current = getImageData(imgRef.current);
    runExtraction(count);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Extract From Image</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Upload a photo or screenshot to pull its dominant colors.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center ${dragOver ? "border-fg" : "border-border"}`}
          >
            <p className="text-sm font-semibold text-fg">Drop an image here, or click to browse</p>
            <p className="mt-1 text-xs text-muted">JPG, PNG, WEBP — processed locally in your browser</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          {previewSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img ref={imgRef} src={previewSrc} alt="" onLoad={onImgLoad} className="mt-4 w-full rounded-xl border border-border" />
          )}
          <div className="mt-4">
            <label className={labelClass}>Number of colors: {count}</label>
            <input
              type="range" min="3" max="10" value={count}
              onChange={(e) => { const k = Number(e.target.value); setCount(k); runExtraction(k); }}
              className="w-full"
            />
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-fg">Extracted palette</h3>
          {colors.length === 0 ? (
            <p className="mt-3 text-sm italic text-muted">Upload an image to see its dominant colors here.</p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {colors.map((c) => <SwatchCard key={c} hex={c} />)}
              </div>
              <div className="mt-4">
                <Button type="button" onClick={() => addManyColors(colors)}>Add all to palette</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contrast panel                                                       */
/* ------------------------------------------------------------------ */
function ContrastPanel() {
  const [fg, setFg] = useState("#16171a");
  const [bg, setBg] = useState("#f1f2f4");
  const fgValid = isValidHex(normalizeHex(fg)), bgValid = isValidHex(normalizeHex(bg));
  const ratio = fgValid && bgValid ? contrastRatio(normalizeHex(fg), normalizeHex(bg)) : null;
  const checks = ratio !== null ? [
    { label: "AA Normal", pass: ratio >= 4.5 },
    { label: "AA Large", pass: ratio >= 3 },
    { label: "AAA Normal", pass: ratio >= 7 },
    { label: "AAA Large", pass: ratio >= 4.5 },
  ] : [];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Contrast Checker</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Check foreground/background pairs against WCAG AA and AAA.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <label className={labelClass}>Text color</label>
          <input className={`${fieldClass} mb-4 w-full`} value={fg} onChange={(e) => setFg(e.target.value)} />
          <label className={labelClass}>Background color</label>
          <input className={`${fieldClass} w-full`} value={bg} onChange={(e) => setBg(e.target.value)} />
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => { setFg(bg); setBg(fg); }}>
            Swap colors
          </Button>
        </div>
        <div>
          {fgValid && bgValid ? (
            <>
              <div className="rounded-xl border border-border p-6" style={{ background: normalizeHex(bg) }}>
                <p className="text-2xl font-bold" style={{ color: normalizeHex(fg) }}>Large sample text</p>
                <p className="mt-1 text-sm" style={{ color: normalizeHex(fg) }}>Body-size sample text for reading contrast.</p>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-fg">{ratio.toFixed(2)}</span>
                <span className="text-sm text-muted">contrast ratio</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {checks.map((c) => (
                  <div key={c.label} className={`rounded-lg p-2.5 text-center ${c.pass ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-rose-100 dark:bg-rose-950/40"}`}>
                    <div className={`text-xs font-bold ${c.pass ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{c.pass ? "PASS" : "FAIL"}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{c.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm italic text-muted">Enter two valid HEX colors to see the result.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shades panel                                                         */
/* ------------------------------------------------------------------ */
const SHADE_STEPS = [
  { name: "50", l: 97 }, { name: "100", l: 93 }, { name: "200", l: 85 }, { name: "300", l: 74 },
  { name: "400", l: 62 }, { name: "500", l: 50 }, { name: "600", l: 41 }, { name: "700", l: 33 },
  { name: "800", l: 24 }, { name: "900", l: 16 }, { name: "950", l: 9 },
];
function ShadesPanel() {
  const { addManyColors, toast } = usePrizm();
  const [baseHex, setBaseHex] = useState("#6331ab");
  const hex = normalizeHex(baseHex);
  const valid = isValidHex(hex);
  const colors = valid ? (() => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return SHADE_STEPS.map((step) => {
      const c = hslToRgb(hsl.h, hsl.s, step.l);
      return { name: step.name, hex: rgbToHex(c.r, c.g, c.b) };
    });
  })() : [];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Shade Ramp</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Generate a Tailwind-style 50–950 scale from one base color.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <label className={labelClass}>Base HEX</label>
          <input
            className={`${fieldClass} w-full`}
            value={baseHex}
            onChange={(e) => setBaseHex(e.target.value)}
            onBlur={() => { if (!valid) toast("Enter a valid HEX"); }}
          />
        </div>
        <div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {colors.map((c) => <SwatchCard key={c.name} hex={c.hex} label={c.name} />)}
          </div>
          {colors.length > 0 && (
            <div className="mt-4">
              <Button type="button" onClick={() => addManyColors(colors.map((c) => c.hex))}>Add ramp to palette</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Saved panel                                                          */
/* ------------------------------------------------------------------ */
function SavedPanel({ setActivePanel }) {
  const { savedPalettes, setSavedPalettes, setPalette, toast } = usePrizm();

  function load(p) {
    setPalette(p.colors.slice());
    toast(`Loaded "${p.name}"`);
    setActivePanel("picker");
  }
  function duplicate(p) {
    setSavedPalettes([...savedPalettes, { id: "p_" + Date.now(), name: p.name + " copy", colors: p.colors.slice(), created: Date.now() }]);
    toast("Palette duplicated");
  }
  function remove(id) {
    setSavedPalettes(savedPalettes.filter((x) => x.id !== id));
    toast("Palette deleted");
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Saved Palettes</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Palettes you&apos;ve saved are stored locally in this browser.</p>

      {savedPalettes.length === 0 ? (
        <p className="mt-4 text-sm italic text-muted">No saved palettes yet. Build one with the tools, then hit &quot;Save palette.&quot;</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...savedPalettes].reverse().map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-3.5 shadow-soft">
              <div className="flex h-12 overflow-hidden rounded-lg">
                {p.colors.map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
              </div>
              <div className="mt-2.5 text-sm font-semibold text-fg">{p.name}</div>
              <div className="text-xs text-muted">{p.colors.length} colors · {new Date(p.created).toLocaleDateString()}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button type="button" size="sm" onClick={() => load(p)}>Load</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => duplicate(p)}>Duplicate</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => remove(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQs panel                                                           */
/* ------------------------------------------------------------------ */
const FAQ_DATA = [
  { category: "General", items: [
    { q: "Is Prizm free to use?", a: "Yes. Every tool on this site — the picker, harmony generator, image extractor, contrast checker, and shade ramp builder — is free, with no account or sign-up required." },
    { q: "Do I need to create an account?", a: "No. All tools work as soon as the page loads. Saved palettes are tied to your browser rather than to a login, so there is nothing to register." },
    { q: "Who is Prizm built for?", a: "Designers and developers who need quick, accurate color decisions — picking an exact value, checking accessibility, pulling colors from a reference image, or generating a ramp for a design system." },
    { q: "Does Prizm work offline?", a: "Once the page has loaded, most tools keep working without a connection, since everything runs client-side." },
    { q: "Can I use the colors I generate commercially?", a: "Yes. Colors, ramps, and exported code are yours to use however you like — Prizm does not claim any rights over what you create with it." },
  ]},
  { category: "Privacy & data", items: [
    { q: "Where is my palette data stored?", a: "Locally, in your browser's localStorage. Nothing is sent to a server. If you clear your browser's site data, saved palettes will be removed along with it." },
    { q: "Will my saved palettes show up on my other devices?", a: "Not automatically — storage is local to whichever browser you are using. To move a palette elsewhere, use the \"Share\" link or export it as a file and open that file on the other device." },
    { q: "Does uploading a photo for color extraction send it anywhere?", a: "No. The image is read and processed entirely in your browser using the Canvas API. The pixel data never leaves your device or touches a server." },
    { q: "Is my shared link private?", a: "A share link encodes your palette's colors directly in the URL. Anyone who has the exact link can open it — there is no separate password, so treat the link itself as the access control." },
  ]},
  { category: "Color picker", items: [
    { q: "How do I enter an exact color?", a: "Type it straight into the HEX, RGB, or HSL field and press Enter or click away — all three stay in sync no matter which one you edit." },
    { q: "What are the \"tints & tones\" swatches showing me?", a: "A quick set of lighter and darker variations of your current color, generated by shifting lightness while keeping the hue fixed." },
    { q: "Why did my RGB or HSL values shift slightly after I typed a HEX code?", a: "HEX only has 16.7 million exact values, and converting between color models involves rounding. A shift of a point or two is normal and won't be visible to the eye." },
  ]},
  { category: "Harmonies", items: [
    { q: "What do the six harmony types mean?", a: "Complementary pairs opposite hues; analogous uses neighboring hues; triadic and tetradic space three or four hues evenly around the wheel; split-complementary pairs a hue with the two neighbors of its opposite; monochromatic varies only the lightness of a single hue." },
    { q: "Can I add just one harmony color instead of all of them?", a: "Yes — each generated swatch has its own \"Add\" button, or use \"Add all to palette\" to bring in the whole set at once." },
  ]},
  { category: "Image extraction", items: [
    { q: "How does the color extraction actually work?", a: "The image is downsampled for speed, then similar pixel colors are grouped using a lightweight k-means-style clustering pass. The most populous clusters become your extracted palette." },
    { q: "What image formats are supported?", a: "Any format your browser can display as an image — JPG, PNG, and WEBP all work, since the file is drawn onto a canvas rather than parsed format-by-format." },
  ]},
  { category: "Contrast checker", items: [
    { q: "How is the contrast ratio calculated?", a: "Using the WCAG 2.1 relative luminance formula — the same math accessibility auditing tools use." },
    { q: "What is the difference between AA, AAA, and \"large text\"?", a: "AA requires a ratio of at least 4.5:1 for normal text and 3:1 for large text. AAA is stricter, requiring 7:1 and 4.5:1 respectively." },
  ]},
  { category: "Shade ramps", items: [
    { q: "What is a shade ramp?", a: "A set of colors — commonly numbered 50 through 950 — all sharing one hue and saturation, varying only in lightness. It's the same shape as a Tailwind CSS color scale." },
    { q: "Can I generate a ramp from a color I extracted from an image?", a: "Yes — copy or add the extracted HEX value, then paste it into the \"Base color\" field on the Shades tool to generate a full ramp from it." },
  ]},
  { category: "Palettes, export & sharing", items: [
    { q: "Is there a limit to how many colors I can hold in my working palette?", a: "The tray holds up to 24 colors at a time." },
    { q: "What export formats are available?", a: "CSS custom properties, SCSS variables, a Tailwind config snippet, raw JSON, a plain HEX list, and a plain RGB list — copyable or downloadable as a file." },
    { q: "Can I load a saved palette back into my working tray?", a: "Yes — open the Saved tab and click \"Load\" on any palette card to replace your current tray with its colors." },
  ]},
];
function FaqsPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openKey, setOpenKey] = useState(null);
  const q = query.trim().toLowerCase();

  const filtered = FAQ_DATA
    .filter((cat) => category === "all" || cat.category === category)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Frequently Asked Questions</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Everything about how Prizm works, what happens to your data, and how to get the most out of each tool.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className={`${fieldClass} w-full pl-9`}
            placeholder='Search FAQs — try "localStorage" or "contrast"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...FAQ_DATA.map((c) => c.category)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus-ring ${
                category === cat ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No FAQs match your search.</p>
      ) : (
        <div className="mt-6 max-w-prose">
          {filtered.map((cat) => (
            <div key={cat.category} className="mb-2">
              <div className="mb-1 mt-6 font-display text-sm font-semibold italic text-accent-soft first:mt-0">{cat.category}</div>
              {cat.items.map((item) => {
                const key = cat.category + item.q;
                const open = openKey === key;
                return (
                  <div key={key} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpenKey(open ? null : key)}
                      className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm font-semibold text-fg"
                    >
                      {item.q}
                      <span className={`shrink-0 text-muted transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                    </button>
                    {open && <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Save / Export / Share modals                                        */
/* ------------------------------------------------------------------ */
function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-5" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[82vh] w-full max-w-lg overflow-auto rounded-2xl bg-card shadow-lift">{children}</div>
    </div>
  );
}
function SaveModal({ onClose }) {
  const { palette, savedPalettes, setSavedPalettes, toast } = usePrizm();
  const [name, setName] = useState("");
  function save() {
    const finalName = name.trim() || `Palette ${savedPalettes.length + 1}`;
    setSavedPalettes([...savedPalettes, { id: "p_" + Date.now(), name: finalName, colors: palette.slice(), created: Date.now() }]);
    toast("Palette saved");
    onClose();
  }
  return (
    <ModalShell onClose={onClose}>
      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-fg">Save palette</h3>
        <p className="mt-1 text-sm text-muted">{palette.length} colors in your current palette.</p>
        <div className="mt-4 flex h-11 overflow-hidden rounded-lg">
          {palette.map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
        </div>
        <label className={`${labelClass} mt-4`}>Palette name</label>
        <input
          autoFocus
          className={`${fieldClass} w-full`}
          placeholder="e.g. Sunset dashboard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={save}>Save</Button>
        </div>
      </div>
    </ModalShell>
  );
}
function buildExport(format, colors) {
  const names = colors.map((c, i) => "color-" + (i + 1));
  switch (format) {
    case "css": return ":root {\n" + colors.map((c, i) => `  --${names[i]}: ${c};`).join("\n") + "\n}";
    case "scss": return colors.map((c, i) => `$${names[i]}: ${c};`).join("\n");
    case "tailwind": return "module.exports = {\n  theme: {\n    extend: {\n      colors: {\n" + colors.map((c, i) => `        prizm${i + 1}: '${c}',`).join("\n") + "\n      }\n    }\n  }\n}";
    case "json": return JSON.stringify(colors, null, 2);
    case "hex": return colors.join("\n");
    case "rgb": return colors.map((c) => { const rgb = hexToRgb(c); return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; }).join("\n");
    default: return "";
  }
}
const EXPORT_FORMATS = [
  { id: "css", label: "CSS variables" }, { id: "scss", label: "SCSS" }, { id: "tailwind", label: "Tailwind" },
  { id: "json", label: "JSON" }, { id: "hex", label: "HEX list" }, { id: "rgb", label: "RGB list" },
];
function ExportModal({ onClose }) {
  const { palette, copy } = usePrizm();
  const [format, setFormat] = useState("css");
  const output = buildExport(format, palette);
  const ext = format === "json" ? "json" : format === "scss" ? "scss" : format === "tailwind" ? "js" : format === "css" ? "css" : "txt";
  return (
    <ModalShell onClose={onClose}>
      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-fg">Export palette</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus-ring ${
                format === f.id ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-surface p-3.5 font-mono text-xs text-fg">{output}</pre>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => downloadText(`prizm-palette.${ext}`, output)}>Download file</Button>
          <Button type="button" onClick={() => copy(output)}>Copy</Button>
        </div>
      </div>
    </ModalShell>
  );
}
function encodePalette(colors) { return btoa(JSON.stringify(colors)).replace(/=+$/, ""); }
function decodePalette(str) {
  try {
    const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch { return null; }
}
function drawPaletteImage(colors) {
  const canvas = document.createElement("canvas");
  const w = 1200, h = 400;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const colW = w / colors.length;
  colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * colW, 0, colW, h * 0.78); });
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.font = "600 20px monospace";
  ctx.fillStyle = "#16171A";
  ctx.textAlign = "center";
  colors.forEach((c, i) => ctx.fillText(c.toUpperCase(), i * colW + colW / 2, h * 0.78 + 34));
  ctx.font = "600 14px sans-serif";
  ctx.fillStyle = "#8B8D94";
  ctx.textAlign = "left";
  ctx.fillText("Made with Prizm", 16, h - 14);
  return canvas.toDataURL("image/png");
}
function ShareModal({ onClose }) {
  const { palette, copy } = usePrizm();
  const link = typeof window !== "undefined" ? window.location.origin + window.location.pathname + "#p=" + encodePalette(palette) : "";
  return (
    <ModalShell onClose={onClose}>
      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-fg">Share palette</h3>
        <p className="mt-1 text-sm text-muted">Anyone with the link opens your palette loaded into their own tray.</p>
        <label className={`${labelClass} mt-4`}>Shareable link</label>
        <div className="flex gap-2">
          <input readOnly className={`${fieldClass} font-mono text-xs`} value={link} />
          <Button type="button" onClick={() => copy(link)}>Copy</Button>
        </div>
        <div className="mt-4 flex h-11 overflow-hidden rounded-lg">
          {palette.map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const dataUrl = drawPaletteImage(palette);
              const a = document.createElement("a");
              a.href = dataUrl; a.download = "prizm-palette.png";
              document.body.appendChild(a); a.click(); document.body.removeChild(a);
            }}
          >
            Download as image
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Tray                                                                 */
/* ------------------------------------------------------------------ */
function Tray() {
  const { palette, removeColor, clearPalette } = usePrizm();
  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">Palette</span>
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {palette.length === 0 ? (
            <span className="text-sm text-muted">Nothing yet — add colors from any tool.</span>
          ) : (
            palette.map((hex) => (
              <button
                key={hex}
                type="button"
                title={`${hex} — click to remove`}
                onClick={() => removeColor(hex)}
                className="h-9 w-9 shrink-0 rounded-lg border border-border"
                style={{ background: hex }}
              />
            ))
          )}
        </div>
        <button type="button" onClick={clearPalette} className="shrink-0 text-xs font-semibold text-muted hover:text-fg">Clear</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "prizm_saved_palettes_v1";

export default function PrizmTool() {
  const [activePanel, setActivePanel] = useState("home");
  const [palette, setPalette] = useState([]);
  const [savedPalettes, setSavedPalettesState] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [modal, setModal] = useState(null); // null | 'save' | 'export' | 'share'
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setSavedPalettesState(raw ? JSON.parse(raw) : []);
    } catch {
      setSavedPalettesState([]);
    }
    const m = window.location.hash.match(/p=([^&]+)/);
    if (m) {
      const colors = decodePalette(decodeURIComponent(m[1]));
      if (Array.isArray(colors) && colors.length) {
        setPalette(colors.filter((c) => isValidHex(c)).map((c) => normalizeHex(c)));
        toast("Loaded shared palette");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1800);
  }
  function copy(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard")).catch(() => toast("Could not copy"));
    }
  }
  function addColor(hex) {
    hex = normalizeHex(hex);
    if (!isValidHex(hex)) return;
    if (palette.includes(hex)) { toast("Already in palette"); return; }
    if (palette.length >= 24) { toast("Palette is full (24 max)"); return; }
    setPalette([...palette, hex]);
    toast("Added to palette");
  }
  function addManyColors(hexes) {
    let added = 0;
    const next = [...palette];
    hexes.forEach((h) => {
      h = normalizeHex(h);
      if (isValidHex(h) && !next.includes(h) && next.length < 24) { next.push(h); added++; }
    });
    setPalette(next);
    toast(added > 0 ? `${added} color${added > 1 ? "s" : ""} added` : "Nothing new to add");
  }
  function removeColor(hex) { setPalette(palette.filter((h) => h !== hex)); }
  function clearPalette() { if (palette.length) { setPalette([]); toast("Palette cleared"); } }
  function setSavedPalettes(next) {
    setSavedPalettesState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  const ctx = { palette, setPalette, savedPalettes, setSavedPalettes, addColor, addManyColors, removeColor, clearPalette, toast, copy };

  return (
    <PrizmContext.Provider value={ctx}>
      <div className="rounded-xl border border-border bg-card shadow-soft">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <span className="font-display text-lg font-semibold text-fg">Prizm</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModal("share")}>Share</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setModal("export")}>Export</Button>
            <Button type="button" size="sm" onClick={() => setModal("save")}>Save palette</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-border p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePanel(id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold focus-ring ${
                activePanel === id ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Panels — all mounted, toggled via `hidden` so tool state (uploaded image, HSV, etc.) survives switching tabs */}
        <div className="p-5 sm:p-6">
          <div className={activePanel === "home" ? "" : "hidden"}><HomePanel setActivePanel={setActivePanel} /></div>
          <div className={activePanel === "picker" ? "" : "hidden"}><PickerPanel /></div>
          <div className={activePanel === "harmonies" ? "" : "hidden"}><HarmoniesPanel /></div>
          <div className={activePanel === "extract" ? "" : "hidden"}><ExtractPanel /></div>
          <div className={activePanel === "contrast" ? "" : "hidden"}><ContrastPanel /></div>
          <div className={activePanel === "shades" ? "" : "hidden"}><ShadesPanel /></div>
          <div className={activePanel === "saved" ? "" : "hidden"}><SavedPanel setActivePanel={setActivePanel} /></div>
          <div className={activePanel === "faqs" ? "" : "hidden"}><FaqsPanel /></div>
        </div>

        <Tray />
      </div>

      {modal === "save" && <SaveModal onClose={() => setModal(null)} />}
      {modal === "export" && <ExportModal onClose={() => setModal(null)} />}
      {modal === "share" && <ShareModal onClose={() => setModal(null)} />}
      <Toast message={toastMsg} />
    </PrizmContext.Provider>
  );
}
