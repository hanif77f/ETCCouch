"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const selectClass = fieldClass + " cursor-pointer";
const areaClass = fieldClass + " min-h-[160px] resize-y font-mono text-sm";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";

const LANGS = [
  ["eng", "English"], ["spa", "Spanish"], ["fra", "French"], ["deu", "German"],
  ["por", "Portuguese"], ["ita", "Italian"], ["nld", "Dutch"], ["ara", "Arabic"],
  ["chi_sim", "Chinese (Simplified)"], ["jpn", "Japanese"], ["rus", "Russian"], ["urd", "Urdu"],
];

const TABS = [
  ["card", "Business Card Scanner"],
  ["receipt", "Receipt & Invoice Scanner"],
  ["pdftext", "PDF Text Extractor"],
  ["qr", "QR Code Reader"],
  ["img2pdf", "Image to PDF"],
];

/* ------------------------------------------------------------------ */
/* Helpers — ported 1:1 from the standalone prototype                  */
/* ------------------------------------------------------------------ */
function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function speakText(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

/* ---- OCR (lazy-loaded — Tesseract.js is large, so it's only fetched on first use) ---- */
async function runOcr(file, lang, onProgress) {
  const Tesseract = (await import("tesseract.js")).default;
  const result = await Tesseract.recognize(file, lang, {
    logger: (m) => onProgress(m),
  });
  return result.data.text;
}

/* ---- Business card parsing ---- */
function parseCard(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\-.\s()]{7,}\d)/);
  let siteMatch = null;
  for (const line of lines) {
    if (line.indexOf("@") === -1) {
      const m = line.match(/((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.(com|net|org|io|co|biz|info|us|uk|ca|in|pk)(\/[^\s]*)?)/i);
      if (m) { siteMatch = m[0]; break; }
    }
  }
  const used = {};
  if (emailMatch) used[emailMatch[0]] = true;
  if (phoneMatch) used[phoneMatch[0]] = true;
  if (siteMatch) used[siteMatch] = true;

  let nameCand = "", companyCand = "";
  const companyKeywords = /(inc\.?|llc|ltd\.?|corp\.?|company|co\.|group|studio|solutions|technologies|enterprises)/i;
  for (const line of lines) {
    if (used[line]) continue;
    if (/\d{4,}/.test(line)) continue;
    if (companyKeywords.test(line) && !companyCand) { companyCand = line; continue; }
    if (!nameCand) { nameCand = line; continue; }
    if (!companyCand) companyCand = line;
  }
  return {
    name: nameCand, company: companyCand,
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    email: emailMatch ? emailMatch[0] : "",
    website: siteMatch || "",
  };
}
function buildVCard(f) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name}\nORG:${f.company}\nTEL:${f.phone}\nEMAIL:${f.email}\nURL:${f.website}\nEND:VCARD`;
}

/* ---- Receipt parsing ---- */
function parseReceipt(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const vendor = lines.length ? lines[0] : "";
  const dateMatch =
    text.match(/\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})\b/) ||
    text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}\b/i);
  const totalLineRegex = /(total|amount due|balance due|grand total)/i;
  const candidateLines = lines.filter((l) => totalLineRegex.test(l));
  const searchIn = candidateLines.length ? candidateLines[candidateLines.length - 1] : text;
  let amtMatch = searchIn.match(/[$€£₹]?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})/);
  if (!amtMatch) {
    const all = text.match(/[$€£₹]?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})/g);
    if (all && all.length) amtMatch = [all[all.length - 1]];
  }
  return { vendor, date: dateMatch ? dateMatch[0] : "", total: amtMatch ? amtMatch[0].trim() : "" };
}

/* ---- PDF text extraction (lazy-loaded, worker matched to installed version) ---- */
async function extractPdfText(file, onProgress) {
  const pdfjsLib = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  let allText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress(pageNum, pdf.numPages);

    // eslint-disable-next-line no-await-in-loop
    const page = await pdf.getPage(pageNum);

    // eslint-disable-next-line no-await-in-loop
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => item.str)
      .join(" ");

    allText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
  }

  return allText.trim();
}

/* ---- QR decoding (lazy-loaded) ---- */
async function decodeQrFromFile(file) {
  const jsQR = (await import("jsqr")).default;
  const img = new Image();
  const url = URL.createObjectURL(file);
  const result = await new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(jsQR(imageData.data, imageData.width, imageData.height));
      } catch {
        resolve(null);
      }
    };
    img.src = url;
  });
  return { result, previewUrl: url };
}

/* ---- Image → PDF (lazy-loaded) ---- */
async function generatePdfFromImages(items, pageSize) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: pageSize });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 24;
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    // eslint-disable-next-line no-await-in-loop
    const img = await new Promise((resolve) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.src = item.url;
    });
    const maxW = pageW - margin * 2, maxH = pageH - margin * 2;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * ratio, h = img.height * ratio;
    const x = (pageW - w) / 2, y = (pageH - h) / 2;
    if (idx > 0) doc.addPage(pageSize);
    const format = item.file.type.indexOf("png") !== -1 ? "PNG" : "JPEG";
    doc.addImage(img, format, x, y, w, h);
  }
  doc.save("scanly-images.pdf");
}

/* ------------------------------------------------------------------ */
/* Small shared UI bits                                                 */
/* ------------------------------------------------------------------ */
function LangSelect({ value, onChange }) {
  return (
    <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {LANGS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
    </select>
  );
}
function ProgressBar({ status, pct }) {
  if (!status) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-muted">{status}</p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full bg-fg transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
function Dropzone({ label, sublabel, previewUrl, fileName, fileSize, onFile, onChange, accept = "image/*", multiple = false }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  if (previewUrl) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-fg">{fileName}</div>
          <div className="text-xs text-muted">{fileSize}</div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onChange}>Change</Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (multiple) onFile(e.dataTransfer.files);
        else if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
      }}
      className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center focus-ring ${dragOver ? "border-fg" : "border-border"}`}
    >
      <Upload size={24} className="mx-auto text-muted" />
      <p className="mt-2 text-sm font-semibold text-fg">{label}</p>
      <p className="mt-1 text-xs text-muted">{sublabel}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (multiple) onFile(e.target.files);
          else if (e.target.files?.[0]) onFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
function CopyRow({ activeKey, myKey, onCopy, value, label = "Copy" }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onCopy(myKey, value)}>{label}</Button>
      <span className={`text-xs font-semibold text-accent-soft transition-opacity ${activeKey === myKey ? "opacity-100" : "opacity-0"}`}>Copied.</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — Image to Text (OCR)                                           */
/* ------------------------------------------------------------------ */
function OcrHero({ copiedKey, copy }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ status: "", pct: 0 });
  const [output, setOutput] = useState("");

  function handleFile(f) {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }
  function reset() {
    setFile(null); setPreviewUrl(""); setOutput(""); setProgress({ status: "", pct: 0 });
  }

  async function extract() {
    if (!file) return;
    setBusy(true);
    try {
      const text = await runOcr(file, lang, (m) => {
        if (m.status) {
          const label = m.status.charAt(0).toUpperCase() + m.status.slice(1);
          setProgress({ status: label + (m.progress != null ? ` — ${Math.round(m.progress * 100)}%` : ""), pct: m.progress != null ? Math.round(m.progress * 100) : 0 });
        }
      });
      setOutput(text.trim());
    } catch {
      setOutput("Something went wrong reading this image. Try a clearer photo or a different language.");
    }
    setProgress({ status: "", pct: 0 });
    setBusy(false);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Image to Text (OCR)</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Pull text out of a photo, screenshot, or scan — business cards, receipts, whiteboards, documents.</p>

      <div className="mt-4">
        <Dropzone
          label="Drop an image, or click to browse"
          sublabel="JPG, PNG, or WEBP"
          previewUrl={previewUrl}
          fileName={file?.name}
          fileSize={file ? formatBytes(file.size) : ""}
          onFile={handleFile}
          onChange={reset}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-muted">Language</label>
        <LangSelect value={lang} onChange={setLang} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={extract} disabled={!file || busy}>{busy ? "Extracting…" : "Extract text"}</Button>
        <Button type="button" variant="outline" onClick={reset}>Clear</Button>
      </div>
      <ProgressBar status={progress.status} pct={progress.pct} />

      <label className={`${labelClass} mt-5`}>Extracted text</label>
      <textarea className={`${areaClass} w-full`} readOnly value={output} placeholder="Your extracted text will appear here." />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => copy("ocr", output)}>Copy text</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => downloadTextFile("scanly-extracted-text.txt", output)}>Download .txt</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => speakText(output)}>Read aloud</Button>
        <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copiedKey === "ocr" ? "opacity-100" : "opacity-0"}`}>Copied.</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Business Card Scanner                                                */
/* ------------------------------------------------------------------ */
function CardSection({ copiedKey, copy }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ status: "", pct: 0 });
  const [fields, setFields] = useState({ name: "", company: "", phone: "", email: "", website: "" });
  const [rawText, setRawText] = useState("");

  function handleFile(f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); }
  function reset() { setFile(null); setPreviewUrl(""); }

  async function scan() {
    if (!file) return;
    setBusy(true);
    try {
      const text = await runOcr(file, lang, (m) => {
        if (m.status) {
          const label = m.status.charAt(0).toUpperCase() + m.status.slice(1);
          setProgress({ status: label + (m.progress != null ? ` — ${Math.round(m.progress * 100)}%` : ""), pct: m.progress != null ? Math.round(m.progress * 100) : 0 });
        }
      });
      setFields(parseCard(text));
      setRawText(text.trim());
    } catch {
      setRawText("Something went wrong reading this image. Try a clearer photo.");
    }
    setProgress({ status: "", pct: 0 });
    setBusy(false);
  }

  function setField(key, value) { setFields((prev) => ({ ...prev, [key]: value })); }
  const summaryBlock = `Name: ${fields.name}\nCompany: ${fields.company}\nPhone: ${fields.phone}\nEmail: ${fields.email}\nWebsite: ${fields.website}`;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Business Card Scanner</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Upload a photo of a business card and pull out the name, company, phone, email, and website automatically.</p>

      <div className="mt-4">
        <Dropzone
          label="Drop a business card photo, or click to browse"
          sublabel="Works best with the card flat and well-lit"
          previewUrl={previewUrl}
          fileName={file?.name}
          fileSize={file ? formatBytes(file.size) : ""}
          onFile={handleFile}
          onChange={reset}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-muted">Language</label>
        <LangSelect value={lang} onChange={setLang} />
      </div>
      <div className="mt-3">
        <Button type="button" onClick={scan} disabled={!file || busy}>{busy ? "Scanning…" : "Scan card"}</Button>
      </div>
      <ProgressBar status={progress.status} pct={progress.pct} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div><label className={labelClass}>Name</label><input className={`${fieldClass} w-full`} value={fields.name} onChange={(e) => setField("name", e.target.value)} placeholder="—" /></div>
        <div><label className={labelClass}>Job title / Company</label><input className={`${fieldClass} w-full`} value={fields.company} onChange={(e) => setField("company", e.target.value)} placeholder="—" /></div>
        <div><label className={labelClass}>Phone</label><input className={`${fieldClass} w-full`} value={fields.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="—" /></div>
        <div><label className={labelClass}>Email</label><input className={`${fieldClass} w-full`} value={fields.email} onChange={(e) => setField("email", e.target.value)} placeholder="—" /></div>
        <div className="sm:col-span-2"><label className={labelClass}>Website</label><input className={`${fieldClass} w-full`} value={fields.website} onChange={(e) => setField("website", e.target.value)} placeholder="—" /></div>
      </div>
      <p className="mt-2 text-xs text-muted">Fields are a best-effort read of the card — check them before you save.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => copy("card", summaryBlock)}>Copy all</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => downloadTextFile(`${(fields.name || "contact").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.vcf`, buildVCard(fields))}>Download vCard (.vcf)</Button>
        <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copiedKey === "card" ? "opacity-100" : "opacity-0"}`}>Copied.</span>
      </div>

      {rawText && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-fg">Show raw text</summary>
          <textarea className={`${areaClass} mt-2 w-full`} readOnly value={rawText} />
        </details>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Receipt & Invoice Scanner                                            */
/* ------------------------------------------------------------------ */
function ReceiptSection({ copiedKey, copy }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ status: "", pct: 0 });
  const [fields, setFields] = useState({ vendor: "", date: "", total: "" });
  const [rawText, setRawText] = useState("");

  function handleFile(f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); }
  function reset() { setFile(null); setPreviewUrl(""); }

  async function scan() {
    if (!file) return;
    setBusy(true);
    try {
      const text = await runOcr(file, lang, (m) => {
        if (m.status) {
          const label = m.status.charAt(0).toUpperCase() + m.status.slice(1);
          setProgress({ status: label + (m.progress != null ? ` — ${Math.round(m.progress * 100)}%` : ""), pct: m.progress != null ? Math.round(m.progress * 100) : 0 });
        }
      });
      setFields(parseReceipt(text));
      setRawText(text.trim());
    } catch {
      setRawText("Something went wrong reading this image. Try a clearer photo.");
    }
    setProgress({ status: "", pct: 0 });
    setBusy(false);
  }
  function setField(key, value) { setFields((prev) => ({ ...prev, [key]: value })); }
  const summaryBlock = `Vendor: ${fields.vendor}\nDate: ${fields.date}\nTotal: ${fields.total}`;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Receipt &amp; Invoice Scanner</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Upload a photo of a receipt or invoice to pull out the vendor, date, and total.</p>

      <div className="mt-4">
        <Dropzone
          label="Drop a receipt or invoice photo, or click to browse"
          sublabel="A flat, well-lit shot works best"
          previewUrl={previewUrl}
          fileName={file?.name}
          fileSize={file ? formatBytes(file.size) : ""}
          onFile={handleFile}
          onChange={reset}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-muted">Language</label>
        <LangSelect value={lang} onChange={setLang} />
      </div>
      <div className="mt-3">
        <Button type="button" onClick={scan} disabled={!file || busy}>{busy ? "Scanning…" : "Scan receipt"}</Button>
      </div>
      <ProgressBar status={progress.status} pct={progress.pct} />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div><label className={labelClass}>Vendor</label><input className={`${fieldClass} w-full`} value={fields.vendor} onChange={(e) => setField("vendor", e.target.value)} placeholder="—" /></div>
        <div><label className={labelClass}>Date</label><input className={`${fieldClass} w-full`} value={fields.date} onChange={(e) => setField("date", e.target.value)} placeholder="—" /></div>
        <div><label className={labelClass}>Total</label><input className={`${fieldClass} w-full`} value={fields.total} onChange={(e) => setField("total", e.target.value)} placeholder="—" /></div>
      </div>
      <p className="mt-2 text-xs text-muted">Best-effort reading — always check the total against the receipt image before using it in a report.</p>
      <CopyRow activeKey={copiedKey} myKey="receipt" onCopy={copy} value={summaryBlock} label="Copy all" />

      {rawText && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-fg">Show raw text</summary>
          <textarea className={`${areaClass} mt-2 w-full`} readOnly value={rawText} />
        </details>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PDF Text Extractor                                                   */
/* ------------------------------------------------------------------ */
function PdfTextSection({ copiedKey, copy }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ status: "", pct: 0 });
  const [output, setOutput] = useState("");
  const inputRef = useRef(null);

  async function extract() {
    if (!file) return;
    setBusy(true);
    setProgress({ status: "Opening PDF…", pct: 0 });
    try {
      const text = await extractPdfText(file, (pageNum, total) => {
        setProgress({ status: `Reading page ${pageNum} of ${total}…`, pct: Math.round((pageNum / total) * 100) });
      });
      setOutput(text);
    } catch {
      setOutput("Could not read this PDF. It may be password-protected or corrupted.");
    }
    setProgress({ status: "", pct: 0 });
    setBusy(false);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">PDF Text Extractor</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Pull the selectable text layer out of a PDF — fast, and no OCR needed for text-based PDFs.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-muted">PDF file</label>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-muted"
        />
      </div>
      <div className="mt-3">
        <Button type="button" onClick={extract} disabled={!file || busy}>{busy ? "Extracting…" : "Extract text"}</Button>
      </div>
      <ProgressBar status={progress.status} pct={progress.pct} />

      <label className={`${labelClass} mt-5`}>Extracted text</label>
      <textarea className={`${areaClass} w-full`} readOnly value={output} placeholder="Extracted text will appear here." />
      <p className="mt-2 text-xs text-muted">If a page comes back empty, it&apos;s likely a scanned image — use Image to Text above instead, one page at a time.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => copy("pdftext", output)}>Copy text</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => downloadTextFile("scanly-pdf-text.txt", output)}>Download .txt</Button>
        <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copiedKey === "pdftext" ? "opacity-100" : "opacity-0"}`}>Copied.</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QR Code Reader                                                       */
/* ------------------------------------------------------------------ */
function QrSection() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [decoding, setDecoding] = useState(false);
  const [data, setData] = useState(null); // undefined = not run, null = no code found, string = decoded
  const [copied, setCopied] = useState(false);

  async function handleFile(f) {
    setFile(f);
    setDecoding(true);
    setData(undefined);
    const { result, previewUrl: url } = await decodeQrFromFile(f);
    setPreviewUrl(url);
    setData(result?.data ?? null);
    setDecoding(false);
  }
  function reset() { setFile(null); setPreviewUrl(""); setData(undefined); }
  function copyResult() {
    navigator.clipboard?.writeText(data).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
  }
  const isUrl = typeof data === "string" && /^https?:\/\//i.test(data);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">QR Code Reader</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Upload a photo or screenshot containing a QR code to read what&apos;s encoded in it.</p>

      <div className="mt-4">
        <Dropzone
          label="Drop an image with a QR code, or click to browse"
          sublabel="Decodes automatically once it loads"
          previewUrl={previewUrl}
          fileName={file?.name}
          fileSize={file ? formatBytes(file.size) : ""}
          onFile={handleFile}
          onChange={reset}
        />
      </div>

      {decoding && <p className="mt-4 text-sm text-muted">Reading…</p>}
      {!decoding && data !== undefined && (
        <div className="mt-4">
          {data === null ? (
            <div className="rounded-lg bg-rose-100 px-3.5 py-2.5 text-sm font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              No QR code detected
              <p className="mt-1 text-xs font-normal text-muted">Try a closer crop, better lighting, or a sharper image.</p>
            </div>
          ) : (
            <>
              <div className="inline-block rounded-lg bg-emerald-100 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                QR code found
              </div>
              <label className={`${labelClass} mt-4`}>Decoded content</label>
              <textarea className={`${areaClass} w-full`} readOnly value={data} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyResult}>Copy</Button>
                {isUrl && <Button type="button" size="sm" onClick={() => window.open(data, "_blank", "noopener")}>Open link</Button>}
                <span className={`text-xs font-semibold text-accent-soft transition-opacity ${copied ? "opacity-100" : "opacity-0"}`}>Copied.</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image to PDF Converter                                               */
/* ------------------------------------------------------------------ */
function Img2PdfSection() {
  const [items, setItems] = useState([]); // [{file, url}]
  const [pageSize, setPageSize] = useState("a4");
  const [generating, setGenerating] = useState(false);

  function addFiles(fileList) {
    const next = Array.from(fileList).filter((f) => f.type.startsWith("image")).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setItems((prev) => [...prev, ...next]);
  }
  function move(idx, dir) {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  function remove(idx) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  async function generate() {
    if (!items.length) return;
    setGenerating(true);
    try {
      await generatePdfFromImages(items, pageSize);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Image to PDF Converter</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Combine multiple images into a single PDF — arrange the order, then download.</p>

      <div className="mt-4">
        <Dropzone
          label="Drop images here, or click to browse — add as many as you like"
          sublabel="Each image becomes its own page"
          onFile={addFiles}
          multiple
        />
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item, idx) => (
            <div key={item.url} className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
              <span className="min-w-0 flex-1 truncate text-sm text-fg">{item.file.name}</span>
              <div className="flex shrink-0 gap-1">
                <button type="button" title="Move up" onClick={() => move(idx, -1)} className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-fg">↑</button>
                <button type="button" title="Move down" onClick={() => move(idx, 1)} className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-fg">↓</button>
                <button type="button" title="Remove" onClick={() => remove(idx)} className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-fg">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-muted">Page size</label>
        <select className={selectClass} value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
          <option value="a4">A4</option>
          <option value="letter">US Letter</option>
        </select>
      </div>
      <div className="mt-3">
        <Button type="button" onClick={generate} disabled={items.length === 0 || generating}>
          {generating ? "Generating…" : "Generate PDF"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
export default function ScanlyTool() {
  const [activeTab, setActiveTab] = useState("card");
  const [copiedKey, setCopiedKey] = useState("");

  function copy(key, value) {
    if (!value) return;
    const done = () => { setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1400); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(done).catch(done);
    else done();
  }

  return (
    <div>
      <OcrHero copiedKey={copiedKey} copy={copy} />

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
        {activeTab === "card" && <CardSection copiedKey={copiedKey} copy={copy} />}
        {activeTab === "receipt" && <ReceiptSection copiedKey={copiedKey} copy={copy} />}
        {activeTab === "pdftext" && <PdfTextSection copiedKey={copiedKey} copy={copy} />}
        {activeTab === "qr" && <QrSection />}
        {activeTab === "img2pdf" && <Img2PdfSection />}
      </div>
    </div>
  );
}
