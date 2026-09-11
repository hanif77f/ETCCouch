"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import qrcode from "qrcode-generator";
import jsQR from "jsqr";
import JSZip from "jszip";

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const selectClass = fieldClass + " cursor-pointer";
const areaClass = fieldClass + " min-h-[110px] resize-y font-mono text-sm";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";
const rowLabelClass = "text-sm font-semibold text-muted sm:w-44 sm:shrink-0";

const TABS = [
  ["shortener", "URL Shortener"],
  ["qr", "QR Code Generator"],
  ["bulk", "Bulk QR Codes"],
  ["scanner", "QR Code Scanner"],
  ["utm", "Campaign URL Builder"],
  ["encode", "URL Encoder / Decoder"],
  ["parser", "URL Parser"],
];

/* ------------------------------------------------------------------ */
/* Helpers — ported 1:1 from the standalone prototype                  */
/* ------------------------------------------------------------------ */
function normalizeUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return null;
  try {
    return new URL(s).href;
  } catch {}
  try {
    return new URL("https://" + s).href;
  } catch {}
  return null;
}
function randomCode(len) {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(len);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let j = 0; j < len; j++) out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
function wifiEscape(s) {
  return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/:/g, "\\:");
}

const LINKS_KEY = "linkforge_links_v1";
function loadLinks() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LINKS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveLinksToStorage(map) {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(map));
  } catch {}
}
function shortLinkUrl(code) {
  if (typeof window === "undefined") return "";
  return window.location.origin + window.location.pathname + "#s/" + code;
}

/* ---- QR payload builder ---- */
function buildQrPayload(type, f) {
  if (type === "url") return normalizeUrl(f.url) || "";
  if (type === "text") return f.text || "";
  if (type === "email") {
    const to = (f.emailTo || "").trim();
    if (!to) return "";
    const params = [];
    if (f.emailSubject) params.push("subject=" + encodeURIComponent(f.emailSubject));
    if (f.emailBody) params.push("body=" + encodeURIComponent(f.emailBody));
    return "mailto:" + to + (params.length ? "?" + params.join("&") : "");
  }
  if (type === "phone") {
    const phone = (f.phone || "").trim();
    return phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "";
  }
  if (type === "sms") {
    const num = (f.smsNumber || "").trim().replace(/[^\d+]/g, "");
    if (!num) return "";
    return "SMSTO:" + num + ":" + (f.smsMessage || "");
  }
  if (type === "wifi") {
    if (!f.wifiSsid) return "";
    const sec = f.wifiSecurity || "WPA";
    return (
      "WIFI:T:" + sec + ";S:" + wifiEscape(f.wifiSsid) + ";" +
      (sec !== "nopass" ? "P:" + wifiEscape(f.wifiPassword) + ";" : "") +
      (f.wifiHidden ? "H:true;" : "") + ";"
    );
  }
  if (type === "vcard") {
    const name = (f.vName || "").trim();
    if (!name) return "";
    const lines = ["BEGIN:VCARD", "VERSION:3.0", "N:;" + name + ";;;", "FN:" + name];
    if (f.vOrg) lines.push("ORG:" + f.vOrg);
    if (f.vTitle) lines.push("TITLE:" + f.vTitle);
    if (f.vPhone) lines.push("TEL:" + f.vPhone);
    if (f.vEmail) lines.push("EMAIL:" + f.vEmail);
    lines.push("END:VCARD");
    return lines.join("\n");
  }
  return "";
}

/* ---- QR rendering ---- */
function makeQrMatrix(payload, level) {
  const qr = qrcode(0, level || "M");
  qr.addData(payload);
  qr.make();
  return qr;
}
function drawQrToCanvas(canvas, payload, opts = {}) {
  if (!canvas) return null;
  const size = opts.size || canvas.width || 320;
  const fg = opts.fg || "#131316";
  const bg = opts.bg || "#ffffff";
  const level = opts.level || "M";
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  if (!payload) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    return null;
  }
  let qr;
  try {
    qr = makeQrMatrix(payload, level);
  } catch {
    return null;
  }
  const n = qr.getModuleCount();
  const cell = size / n;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(Math.floor(c * cell), Math.floor(r * cell), Math.ceil(cell), Math.ceil(cell));
    }
  }
  if (opts.logoImage) {
    const logoSize = size * 0.22;
    const pad = logoSize * 0.16;
    const cx = (size - logoSize) / 2, cy = (size - logoSize) / 2;
    ctx.fillStyle = bg;
    ctx.fillRect(cx - pad, cy - pad, logoSize + pad * 2, logoSize + pad * 2);
    ctx.drawImage(opts.logoImage, cx, cy, logoSize, logoSize);
  }
  return qr;
}
function qrToSvgString(qr, opts = {}) {
  const fg = opts.fg || "#131316";
  const bg = opts.bg || "#ffffff";
  const n = qr.getModuleCount();
  const size = opts.size || 320;
  const cell = size / n;
  let rects = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${fg}"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bg}"/>${rects}</svg>`;
}
function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ------------------------------------------------------------------ */
/* Small shared UI bits                                                 */
/* ------------------------------------------------------------------ */
function CopyButton({ label = "Copy result", activeKey, myKey, onCopy, value }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onCopy(myKey, value)}>
        {label}
      </Button>
      <span className={`text-xs font-semibold text-accent-soft transition-opacity ${activeKey === myKey ? "opacity-100" : "opacity-0"}`}>
        Copied.
      </span>
    </div>
  );
}
function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3.5 py-2.5 text-sm font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — quick shorten + QR preview                                    */
/* ------------------------------------------------------------------ */
function HeroSection({ links, persistLinks, copiedKey, copy }) {
  const [heroUrl, setHeroUrl] = useState("");
  const [heroResult, setHeroResult] = useState(null); // { full }
  const heroCanvasRef = useRef(null);

  function handleShorten() {
    const url = normalizeUrl(heroUrl);
    if (!url) return;
    const map = { ...links };
    let code;
    do {
      code = randomCode(6);
    } while (map[code]);
    map[code] = { long: url, created: Date.now(), clicks: 0 };
    persistLinks(map);
    const full = shortLinkUrl(code);
    setHeroResult({ full });
  }

  useEffect(() => {
    if (heroResult && heroCanvasRef.current) {
      drawQrToCanvas(heroCanvasRef.current, heroResult.full, { size: 100, fg: "#131316", bg: "#ffffff", level: "M" });
    }
  }, [heroResult]);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Quick Shorten &amp; QR</h2>
      <label className={`${labelClass} mt-3`} htmlFor="heroUrl">Paste a link to shorten and turn into a QR code</label>
      <input
        id="heroUrl"
        className={`${fieldClass} w-full`}
        type="text"
        placeholder="https://example.com/a-very-long-page-address"
        value={heroUrl}
        onChange={(e) => setHeroUrl(e.target.value)}
      />
      {heroResult && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface/60 p-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono text-sm font-semibold text-fg">{heroResult.full}</div>
            <div className="mt-1 text-xs text-muted">Works when opened in this browser — see the Shortener tab below for details.</div>
          </div>
          <canvas ref={heroCanvasRef} width={100} height={100} className="shrink-0 rounded-md border border-border" />
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={handleShorten}>Shorten &amp; make QR</Button>
        {heroResult && (
          <Button type="button" variant="outline" size="sm" onClick={() => copy("hero", heroResult.full)}>
            Copy short link
          </Button>
        )}
        <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copiedKey === "hero" ? "opacity-100" : "opacity-0"}`}>
          Copied.
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* URL Shortener                                                        */
/* ------------------------------------------------------------------ */
function ShortenerSection({ links, persistLinks, prefillUrl, onOpenQr, copiedKey, copy }) {
  const [url, setUrl] = useState(prefillUrl || "");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (prefillUrl) setUrl(prefillUrl);
  }, [prefillUrl]);

  function handleCreate() {
    setError("");
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Enter a valid URL, e.g. https://example.com");
      return;
    }
    const map = { ...links };
    let code = (alias || "").trim();
    if (code) {
      if (!/^[a-zA-Z0-9_-]{2,40}$/.test(code)) {
        setError("Custom aliases can only use letters, numbers, hyphens, and underscores (2–40 characters).");
        return;
      }
      if (map[code]) {
        setError("That alias is already in use — pick another one.");
        return;
      }
    } else {
      do {
        code = randomCode(6);
      } while (map[code]);
    }
    map[code] = { long: normalized, created: Date.now(), clicks: 0 };
    persistLinks(map);
    setUrl("");
    setAlias("");
  }

  function handleDelete(code) {
    const map = { ...links };
    delete map[code];
    persistLinks(map);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: "application/json" });
    downloadBlob(blob, "linkforge-short-links.json");
  }
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(reader.result);
        if (typeof incoming !== "object" || incoming === null) throw new Error("bad format");
        const map = { ...links };
        Object.keys(incoming).forEach((code) => {
          if (incoming[code]?.long) map[code] = incoming[code];
        });
        persistLinks(map);
      } catch {
        setError("That file doesn't look like a Linkforge export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const codes = Object.keys(links).sort((a, b) => (links[b].created || 0) - (links[a].created || 0));

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">URL Shortener</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Turn a long link into a short, shareable code. Short links are saved in this browser and redirect when opened here.
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Long URL</label>
          <input className={fieldClass} type="text" placeholder="https://example.com/a-very-long-page-address?with=params" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Custom alias (optional)</label>
          <input className={fieldClass} type="text" placeholder="e.g. spring-sale" value={alias} onChange={(e) => setAlias(e.target.value)} />
          <Button type="button" size="sm" onClick={handleCreate}>Create short link</Button>
        </div>
      </div>
      <ErrorBanner>{error}</ErrorBanner>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <span className={labelClass}>Your short links (this browser)</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleExport}>Export list</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Import list</Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {codes.length === 0 ? (
        <p className="mt-3 text-sm italic text-muted">No short links yet — create one above.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Short code</th>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Original URL</th>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Clicks</th>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const item = links[code];
                const full = shortLinkUrl(code);
                return (
                  <tr key={code}>
                    <td className="border-b border-border px-4 py-2.5 font-mono text-fg">{code}</td>
                    <td className="max-w-[260px] truncate border-b border-border px-4 py-2.5 text-fg" title={item.long}>{item.long}</td>
                    <td className="border-b border-border px-4 py-2.5 text-fg">{item.clicks || 0}</td>
                    <td className="border-b border-border px-4 py-2.5">
                      <div className="flex gap-2">
                        <button type="button" className="text-xs font-semibold text-accent-soft hover:underline" onClick={() => copy(`row-${code}`, full)}>
                          {copiedKey === `row-${code}` ? "Copied" : "Copy"}
                        </button>
                        <button type="button" className="text-xs font-semibold text-accent-soft hover:underline" onClick={() => onOpenQr(full)}>QR</button>
                        <button type="button" className="text-xs font-semibold text-rose-600 hover:underline" onClick={() => handleDelete(code)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        Short links are stored only in this browser&apos;s local storage. Opening one on another device or browser won&apos;t redirect, since there&apos;s no server behind it — this is a tool for organizing your own links, not a public hosting service.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QR Code Generator                                                    */
/* ------------------------------------------------------------------ */
const QR_TYPES = [
  ["url", "Website URL"],
  ["text", "Plain text"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["sms", "SMS"],
  ["wifi", "Wi-Fi"],
  ["vcard", "Contact (vCard)"],
];

function QrGeneratorSection({ type, setType, url, setUrl, copiedKey, copy }) {
  const [fields, setFields] = useState({
    text: "", emailTo: "", emailSubject: "", emailBody: "",
    phone: "", smsNumber: "", smsMessage: "",
    wifiSsid: "", wifiPassword: "", wifiSecurity: "WPA", wifiHidden: false,
    vName: "", vOrg: "", vTitle: "", vPhone: "", vEmail: "",
  });
  const [fg, setFg] = useState("#131316");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState("M");
  const [size, setSize] = useState(320);
  const [logoImage, setLogoImage] = useState(null);
  const canvasRef = useRef(null);
  const logoInputRef = useRef(null);

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const payload = useMemo(() => buildQrPayload(type, { ...fields, url }), [type, fields, url]);

  useEffect(() => {
    drawQrToCanvas(canvasRef.current, payload, { size, fg, bg, level, logoImage });
  }, [payload, size, fg, bg, level, logoImage]);

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setLogoImage(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function downloadPng() {
    if (!canvasRef.current) return;
    downloadDataUrl(canvasRef.current.toDataURL("image/png"), "linkforge-qr-code.png");
  }
  function downloadSvg() {
    if (!payload) return;
    const qr = makeQrMatrix(payload, level);
    const svg = qrToSvgString(qr, { fg, bg, size });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "linkforge-qr-code.svg");
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">QR Code Generator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Create a QR code for a link, message, Wi-Fi network, contact card, and more — customize the colors and download it.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {QR_TYPES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus-ring ${
              type === key ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div>
          {type === "url" && (
            <div className="flex flex-wrap items-center gap-3">
              <label className={rowLabelClass}>Website URL</label>
              <input className={fieldClass} type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          )}
          {type === "text" && (
            <div>
              <label className={labelClass}>Text</label>
              <textarea className={`${areaClass} w-full`} placeholder="Any message, note, or code…" value={fields.text} onChange={(e) => setField("text", e.target.value)} />
            </div>
          )}
          {type === "email" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>To</label><input className={fieldClass} type="text" placeholder="name@example.com" value={fields.emailTo} onChange={(e) => setField("emailTo", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Subject</label><input className={fieldClass} type="text" placeholder="Optional subject" value={fields.emailSubject} onChange={(e) => setField("emailSubject", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Body</label><input className={fieldClass} type="text" placeholder="Optional message" value={fields.emailBody} onChange={(e) => setField("emailBody", e.target.value)} /></div>
            </div>
          )}
          {type === "phone" && (
            <div className="flex flex-wrap items-center gap-3">
              <label className={rowLabelClass}>Phone number</label>
              <input className={fieldClass} type="text" placeholder="+1 555 123 4567" value={fields.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
          )}
          {type === "sms" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Phone number</label><input className={fieldClass} type="text" placeholder="+1 555 123 4567" value={fields.smsNumber} onChange={(e) => setField("smsNumber", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Message</label><input className={fieldClass} type="text" placeholder="Optional pre-written message" value={fields.smsMessage} onChange={(e) => setField("smsMessage", e.target.value)} /></div>
            </div>
          )}
          {type === "wifi" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Network name (SSID)</label><input className={fieldClass} type="text" placeholder="e.g. Office-Guest" value={fields.wifiSsid} onChange={(e) => setField("wifiSsid", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Password</label><input className={fieldClass} type="text" placeholder="Network password" value={fields.wifiPassword} onChange={(e) => setField("wifiPassword", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3">
                <label className={rowLabelClass}>Security</label>
                <select className={selectClass} value={fields.wifiSecurity} onChange={(e) => setField("wifiSecurity", e.target.value)}>
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (open network)</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={fields.wifiHidden} onChange={(e) => setField("wifiHidden", e.target.checked)} /> Hidden network
                </label>
              </div>
              <p className="text-xs text-muted">Your password is encoded directly into the QR image in this browser — it&apos;s never uploaded. Treat the resulting image with the same care as the password itself.</p>
            </div>
          )}
          {type === "vcard" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Full name</label><input className={fieldClass} type="text" placeholder="Jane Doe" value={fields.vName} onChange={(e) => setField("vName", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Company</label><input className={fieldClass} type="text" placeholder="Optional" value={fields.vOrg} onChange={(e) => setField("vOrg", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Job title</label><input className={fieldClass} type="text" placeholder="Optional" value={fields.vTitle} onChange={(e) => setField("vTitle", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Phone</label><input className={fieldClass} type="text" placeholder="Optional" value={fields.vPhone} onChange={(e) => setField("vPhone", e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Email</label><input className={fieldClass} type="text" placeholder="Optional" value={fields.vEmail} onChange={(e) => setField("vEmail", e.target.value)} /></div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div><label className={labelClass}>Foreground</label><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-14 rounded border border-border" /></div>
            <div><label className={labelClass}>Background</label><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 rounded border border-border" /></div>
            <div>
              <label className={labelClass}>Error correction</label>
              <select className={selectClass} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="L">Low</option>
                <option value="M">Medium</option>
                <option value="Q">Quartile</option>
                <option value="H">High</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Size (px)</label>
              <input className={`${fieldClass} w-24`} type="number" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10) || 320)} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Logo overlay (optional)</label>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="text-sm text-muted" />
            <Button type="button" variant="outline" size="sm" onClick={() => { setLogoImage(null); if (logoInputRef.current) logoInputRef.current.value = ""; }}>
              Remove logo
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <canvas ref={canvasRef} width={320} height={320} className="rounded-lg border border-border" />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={downloadPng}>Download PNG</Button>
            <Button type="button" variant="outline" size="sm" onClick={downloadSvg}>Download SVG</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bulk QR Codes                                                        */
/* ------------------------------------------------------------------ */
function parseBulkLines(raw) {
  return raw.split("\n").map((l) => l.trim()).filter(Boolean).map((line, i) => {
    const idx = line.indexOf(",");
    if (idx > -1) {
      const name = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (name && value) return { name, value };
    }
    return { name: `item-${i + 1}`, value: line };
  });
}

function BulkQrSection() {
  const [input, setInput] = useState("");
  const [fg, setFg] = useState("#131316");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState("M");
  const [size, setSize] = useState(320);
  const [items, setItems] = useState([]); // [{name, value}]
  const [status, setStatus] = useState("");
  const gridRefs = useRef({});

  function generate() {
    const parsed = parseBulkLines(input);
    setItems(parsed);
    if (parsed.length === 0) {
      setStatus("Add at least one line to generate codes.");
      return;
    }
    setStatus(`${parsed.length} QR code${parsed.length === 1 ? "" : "s"} generated.`);
  }

  useEffect(() => {
    items.forEach((item) => {
      const canvas = gridRefs.current[item.name + item.value];
      if (canvas) drawQrToCanvas(canvas, item.value, { size: 140, fg, bg, level });
    });
  }, [items, fg, bg, level]);

  async function downloadAll() {
    if (!items.length) return;
    const zip = new JSZip();
    const usedNames = {};
    items.forEach((item) => {
      const fullCanvas = document.createElement("canvas");
      drawQrToCanvas(fullCanvas, item.value, { size, fg, bg, level });
      const dataUrl = fullCanvas.toDataURL("image/png");
      const base = item.name.replace(/[^a-z0-9_-]+/gi, "_") || "qr-code";
      let name = base, n = 1;
      while (usedNames[name]) name = `${base}-${++n}`;
      usedNames[name] = true;
      zip.file(`${name}.png`, dataUrl.split(",")[1], { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "linkforge-qr-codes.zip");
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Bulk QR Code Generator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Paste a list of URLs or text, one per line, and generate a QR code for each. Optionally name each one with <span className="font-mono">name, value</span>.
      </p>
      <label className={`${labelClass} mt-4`}>One item per line</label>
      <textarea
        className={`${areaClass} w-full`}
        placeholder={"Front desk, https://example.com/front-desk\nTable 1, https://example.com/menu?table=1\nhttps://example.com/plain-link-no-name"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div><label className={labelClass}>Foreground</label><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-14 rounded border border-border" /></div>
        <div><label className={labelClass}>Background</label><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 rounded border border-border" /></div>
        <div>
          <label className={labelClass}>Error correction</label>
          <select className={selectClass} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="L">Low</option><option value="M">Medium</option><option value="Q">Quartile</option><option value="H">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Size (px)</label>
          <input className={`${fieldClass} w-24`} type="number" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10) || 320)} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={generate}>Generate batch</Button>
        <Button type="button" variant="outline" size="sm" onClick={downloadAll} disabled={!items.length}>Download all as ZIP</Button>
        {status && <span className="text-xs font-semibold text-accent-soft">{status}</span>}
      </div>
      {items.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.name + item.value} className="text-center">
              <canvas ref={(el) => { gridRefs.current[item.name + item.value] = el; }} width={140} height={140} className="mx-auto rounded-lg border border-border" />
              <div className="mt-1.5 truncate text-xs text-muted" title={item.value}>{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QR Code Scanner                                                      */
/* ------------------------------------------------------------------ */
function ScannerSection() {
  const [previewSrc, setPreviewSrc] = useState("");
  const [resultText, setResultText] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  function decodeImageEl(img) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const canvas = scanCanvasRef.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const result = jsQR(data.data, w, h);
    setResultText(result ? result.data : "");
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setPreviewSrc(reader.result);
        decodeImageEl(img);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }

  function scanLoop() {
    const video = videoRef.current, canvas = scanCanvasRef.current;
    if (!streamRef.current || !video || !canvas) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(data.data, canvas.width, canvas.height);
      if (result?.data) {
        setResultText(result.data);
        stopCamera();
        return;
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraOn(true);
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch {
      setCameraError("Couldn't access the camera — check your browser's permission settings.");
    }
  }

  useEffect(() => () => stopCamera(), []);

  const isLink = /^https?:\/\//i.test(resultText || "");
  const [copied, setCopied] = useState(false);
  function copyResult() {
    if (!resultText) return;
    navigator.clipboard?.writeText(resultText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">QR Code Scanner</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Upload an image, or scan live with your camera. Decoding happens entirely in your browser.</p>

      <label
        className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <Upload size={24} className="text-muted" />
        <p className="text-sm text-muted">Click to upload a QR code image, or drag one here</p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </label>
      {previewSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewSrc} alt="Uploaded QR code" className="mx-auto mt-4 max-h-64 rounded-lg border border-border" />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!cameraOn ? (
          <Button type="button" variant="outline" size="sm" onClick={startCamera}>Scan with camera</Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={stopCamera}>Stop camera</Button>
        )}
      </div>
      <ErrorBanner>{cameraError}</ErrorBanner>
      <video ref={videoRef} playsInline muted className={`mt-4 w-full max-w-sm rounded-lg border border-border ${cameraOn ? "" : "hidden"}`} />
      <canvas ref={scanCanvasRef} className="hidden" />

      {resultText !== "" ? (
        <div className="mt-4 rounded-lg border border-border bg-surface/60 p-3">
          <div className="break-all font-mono text-sm text-fg">{resultText || "No QR code found in that image."}</div>
        </div>
      ) : previewSrc || cameraError ? (
        <div className="mt-4 rounded-lg border border-border bg-surface/60 p-3 text-sm text-muted">No QR code found in that image.</div>
      ) : null}
      {resultText && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isLink && (
            <Button type="button" size="sm" onClick={() => window.open(resultText, "_blank", "noopener")}>Open link</Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={copyResult}>Copy result</Button>
          <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copied ? "opacity-100" : "opacity-0"}`}>Copied.</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campaign URL Builder (UTM)                                          */
/* ------------------------------------------------------------------ */
function UtmSection({ onSendToQr, onSendToShortener, copiedKey, copy }) {
  const [base, setBase] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [output, setOutput] = useState("");

  function build() {
    const normalized = normalizeUrl(base);
    if (!normalized) {
      setOutput("Enter a valid website URL first.");
      return;
    }
    const url = new URL(normalized);
    [
      ["utm_source", source], ["utm_medium", medium], ["utm_campaign", campaign],
      ["utm_term", term], ["utm_content", content],
    ].forEach(([key, val]) => {
      if (val && val.trim()) url.searchParams.set(key, val.trim());
    });
    setOutput(url.href);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Campaign URL Builder</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Add UTM parameters to a link so tools like Google Analytics can tell you where your traffic came from.</p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Website URL</label><input className={fieldClass} type="text" placeholder="https://example.com/landing-page" value={base} onChange={(e) => setBase(e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Campaign source</label><input className={fieldClass} type="text" placeholder="e.g. newsletter, google, facebook" value={source} onChange={(e) => setSource(e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Campaign medium</label><input className={fieldClass} type="text" placeholder="e.g. email, cpc, social" value={medium} onChange={(e) => setMedium(e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Campaign name</label><input className={fieldClass} type="text" placeholder="e.g. spring_sale" value={campaign} onChange={(e) => setCampaign(e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Campaign term (optional)</label><input className={fieldClass} type="text" placeholder="Paid keyword" value={term} onChange={(e) => setTerm(e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3"><label className={rowLabelClass}>Campaign content (optional)</label><input className={fieldClass} type="text" placeholder="Distinguish similar ads or links" value={content} onChange={(e) => setContent(e.target.value)} /></div>
      </div>
      <div className="mt-3"><Button type="button" size="sm" onClick={build}>Build campaign URL</Button></div>
      <label className={`${labelClass} mt-5`}>Result</label>
      <textarea className={`${areaClass} min-h-[60px] w-full`} readOnly value={output} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => copy("utm", output)}>Copy URL</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => output && onSendToQr(output)}>Generate QR</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => output && onSendToShortener(output)}>Shorten this</Button>
        <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copiedKey === "utm" ? "opacity-100" : "opacity-0"}`}>Copied.</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* URL Encoder / Decoder                                                */
/* ------------------------------------------------------------------ */
function EncodeSection({ copiedKey, copy }) {
  const [mode, setMode] = useState("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function encode() {
    setOutput(mode === "full" ? encodeURI(input) : encodeURIComponent(input));
  }
  function decode() {
    try {
      setOutput(mode === "full" ? decodeURI(input) : decodeURIComponent(input));
    } catch {
      setOutput("That doesn't look like valid percent-encoded text.");
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">URL Encoder / Decoder</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Convert text to and from percent-encoded URL format.</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="radio" name="encodeMode" checked={mode === "component"} onChange={() => setMode("component")} />
          Component (encode <span className="font-mono">/ &amp; ?</span> too)
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="radio" name="encodeMode" checked={mode === "full"} onChange={() => setMode("full")} />
          Full URL (keep <span className="font-mono">/ &amp; ?</span>)
        </label>
      </div>
      <label className={`${labelClass} mt-4`}>Input</label>
      <textarea className={`${areaClass} w-full`} placeholder="Paste text or a URL…" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" onClick={encode}>Encode</Button>
        <Button type="button" size="sm" onClick={decode}>Decode</Button>
      </div>
      <label className={`${labelClass} mt-5`}>Result</label>
      <textarea className={`${areaClass} w-full`} readOnly value={output} />
      <CopyButton activeKey={copiedKey} myKey="encode" onCopy={copy} value={output} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* URL Parser & Link Inspector                                          */
/* ------------------------------------------------------------------ */
function ParserSection() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState(null); // {protocol, host, port, path, hash, params} | null
  const [invalid, setInvalid] = useState(false);

  function analyze() {
    const raw = input.trim();
    let url;
    try {
      url = new URL(raw);
    } catch {
      try {
        url = new URL("https://" + raw);
      } catch {
        setInvalid(true);
        setParsed(null);
        return;
      }
    }
    setInvalid(false);
    setParsed({
      protocol: url.protocol.replace(":", ""),
      host: url.hostname,
      port: url.port || "(default)",
      path: url.pathname || "/",
      hash: url.hash ? url.hash.slice(1) : "—",
      params: Array.from(url.searchParams.entries()),
    });
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">URL Parser &amp; Link Inspector</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Break a URL down into its protocol, host, path, query parameters, and fragment.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className={rowLabelClass}>URL</label>
        <input className={fieldClass} type="text" placeholder="https://example.com/path/page?utm_source=x&id=42#section" value={input} onChange={(e) => setInput(e.target.value)} />
      </div>
      <div className="mt-3"><Button type="button" size="sm" onClick={analyze}>Inspect URL</Button></div>
      <ErrorBanner>{invalid ? "That doesn't look like a valid URL. Make sure it includes a protocol, like https://." : null}</ErrorBanner>

      {parsed && (
        <div className="mt-5">
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold text-muted">Protocol</dt><dd className="font-mono text-fg">{parsed.protocol}</dd>
            <dt className="font-semibold text-muted">Host</dt><dd className="font-mono text-fg">{parsed.host}</dd>
            <dt className="font-semibold text-muted">Port</dt><dd className="font-mono text-fg">{parsed.port}</dd>
            <dt className="font-semibold text-muted">Path</dt><dd className="break-all font-mono text-fg">{parsed.path}</dd>
            <dt className="font-semibold text-muted">Fragment</dt><dd className="break-all font-mono text-fg">{parsed.hash}</dd>
          </dl>
          <label className={`${labelClass} mt-5`}>Query parameters</label>
          {parsed.params.length === 0 ? (
            <p className="mt-1 text-sm italic text-muted">No query parameters on this URL.</p>
          ) : (
            <table className="mt-2 w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Key</th>
                  <th className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsed.params.map(([k, v], i) => (
                  <tr key={i}>
                    <td className="border-b border-border px-3 py-2 font-mono text-fg">{k}</td>
                    <td className="border-b border-border px-3 py-2 font-mono text-fg">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
export default function LinkforgeTool() {
  const [activeTab, setActiveTab] = useState("shortener");
  const [links, setLinks] = useState({});
  const [copiedKey, setCopiedKey] = useState("");
  const [qrType, setQrType] = useState("url");
  const [qrUrl, setQrUrl] = useState("");
  const [shortenerPrefill, setShortenerPrefill] = useState("");
  const [redirect, setRedirect] = useState(null); // null | { status: 'found'|'notfound', target? }

  // Load persisted links on mount, and check for a redirect hash.
  useEffect(() => {
    setLinks(loadLinks());
    const m = /^#s\/([a-zA-Z0-9_-]+)$/.exec(window.location.hash);
    if (m) {
      const map = loadLinks();
      const code = m[1];
      if (map[code]) {
        map[code].clicks = (map[code].clicks || 0) + 1;
        saveLinksToStorage(map);
        setRedirect({ status: "found", target: map[code].long });
        setTimeout(() => {
          window.location.href = map[code].long;
        }, 700);
      } else {
        setRedirect({ status: "notfound" });
      }
    }
  }, []);

  function persistLinks(map) {
    setLinks(map);
    saveLinksToStorage(map);
  }
  function copy(key, value) {
    if (!value) return;
    const done = () => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1400);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(done);
    } else {
      done();
    }
  }
  function openInQr(url) {
    setQrType("url");
    setQrUrl(url);
    setActiveTab("qr");
  }
  function sendToShortener(url) {
    setShortenerPrefill(url);
    setActiveTab("shortener");
  }

  if (redirect) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
        <h2 className="font-display text-xl font-semibold text-fg">
          {redirect.status === "found" ? "Redirecting…" : "This short link isn't in this browser"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {redirect.status === "found"
            ? `Taking you to ${redirect.target}`
            : "Short links created by Linkforge only work in the browser that created them, since there's no server behind them. If you made this link on a different device, open it there instead."}
        </p>
        <a
          href={typeof window !== "undefined" ? window.location.pathname + window.location.search : "#"}
          className="mt-4 inline-block text-sm font-semibold text-accent-soft hover:underline"
        >
          Back to Linkforge
        </a>
      </div>
    );
  }

  return (
    <div>
      <HeroSection links={links} persistLinks={persistLinks} copiedKey={copiedKey} copy={copy} />

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold focus-ring ${
              activeTab === key ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        {activeTab === "shortener" && (
          <ShortenerSection
            links={links}
            persistLinks={persistLinks}
            prefillUrl={shortenerPrefill}
            onOpenQr={openInQr}
            copiedKey={copiedKey}
            copy={copy}
          />
        )}
        {activeTab === "qr" && <QrGeneratorSection type={qrType} setType={setQrType} url={qrUrl} setUrl={setQrUrl} copiedKey={copiedKey} copy={copy} />}
        {activeTab === "bulk" && <BulkQrSection />}
        {activeTab === "scanner" && <ScannerSection />}
        {activeTab === "utm" && <UtmSection onSendToQr={openInQr} onSendToShortener={sendToShortener} copiedKey={copiedKey} copy={copy} />}
        {activeTab === "encode" && <EncodeSection copiedKey={copiedKey} copy={copy} />}
        {activeTab === "parser" && <ParserSection />}
      </div>
    </div>
  );
}
