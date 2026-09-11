"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Shared styles — same tokens as the other ported tools               */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const selectClass = fieldClass + " cursor-pointer";
const areaClass = fieldClass + " min-h-[70px] resize-y";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";
const rowLabelClass = "text-sm font-semibold text-muted sm:w-48 sm:shrink-0";

const CURRENCIES = [
  { symbol: "$", label: "USD – US Dollar ($)" },
  { symbol: "€", label: "EUR – Euro (€)" },
  { symbol: "£", label: "GBP – British Pound (£)" },
  { symbol: "₨", label: "PKR – Pakistani Rupee (₨)" },
  { symbol: "₹", label: "INR – Indian Rupee (₹)" },
  { symbol: "د.إ", label: "AED – UAE Dirham (د.إ)" },
  { symbol: "﷼", label: "SAR – Saudi Riyal (﷼)" },
  { symbol: "﷼ ", label: "OMR – Omani Rial (﷼)" },
  { symbol: "A$", label: "AUD – Australian Dollar (A$)" },
  { symbol: "C$", label: "CAD – Canadian Dollar (C$)" },
  { symbol: "¥", label: "JPY – Japanese Yen (¥)" },
  { symbol: "元", label: "CNY – Chinese Yuan (元)" },
  { symbol: "S$", label: "SGD – Singapore Dollar (S$)" },
  { symbol: "RM", label: "MYR – Malaysian Ringgit (RM)" },
  { symbol: "R", label: "ZAR – South African Rand (R)" },
  { symbol: "Fr", label: "CHF – Swiss Franc (Fr)" },
  { symbol: "NZ$", label: "NZD – New Zealand Dollar (NZ$)" },
  { symbol: "HK$", label: "HKD – Hong Kong Dollar (HK$)" },
  { symbol: "฿", label: "THB – Thai Baht (฿)" },
  { symbol: "Rp", label: "IDR – Indonesian Rupiah (Rp)" },
  { symbol: "₱", label: "PHP – Philippine Peso (₱)" },
  { symbol: "৳", label: "BDT – Bangladeshi Taka (৳)" },
  { symbol: "E£", label: "EGP – Egyptian Pound (E£)" },
  { symbol: "₺", label: "TRY – Turkish Lira (₺)" },
  { symbol: "KSh", label: "KES – Kenyan Shilling (KSh)" },
  { symbol: "₦", label: "NGN – Nigerian Naira (₦)" },
  { symbol: "R$", label: "BRL – Brazilian Real (R$)" },
  { symbol: "MX$", label: "MXN – Mexican Peso (MX$)" },
  { symbol: "₽", label: "RUB – Russian Ruble (₽)" },
  { symbol: "₩", label: "KRW – South Korean Won (₩)" },
  { symbol: "kr", label: "SEK/NOK/DKK – Nordic Krona/Krone (kr)" },
  { symbol: "zł", label: "PLN – Polish Złoty (zł)" },
  { symbol: "Kč", label: "CZK – Czech Koruna (Kč)" },
];

const TABS = [
  ["margin", "Profit Margin & Markup"],
  ["roi", "ROI Calculator"],
  ["breakeven", "Break-Even Point"],
  ["discount", "Discount & Sales Tax"],
  ["loans", "Business Loan / EMI"],
  ["freelance", "Freelance Hourly Rate"],
  ["startup", "Startup Cost Estimator"],
];

/* ------------------------------------------------------------------ */
/* Formatting — takes the current currency symbol as an argument      */
/* rather than a module-level variable, since React re-renders instead */
/* of mutating the DOM directly.                                       */
/* ------------------------------------------------------------------ */
function fmt(n, symbol) {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return "—";
  return symbol + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n) {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}
function fmtNum(n) {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}
function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printableText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text ? escapeHtml(text).replace(/\r?\n/g, "<br>") : fallback;
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl bg-fg px-3 py-2.5 text-surface">
      <span className="block font-mono text-lg font-bold leading-tight">{value}</span>
      <span className="text-[11px] text-accent-soft">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Invoice Generator (hero)                                             */
/* ------------------------------------------------------------------ */
let itemIdCounter = 0;
function newItem() {
  itemIdCounter += 1;
  return { id: itemIdCounter, desc: "", qty: 1, price: 0 };
}

function InvoiceSection({ symbol }) {
  const [from, setFrom] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [to, setTo] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [invNumber, setInvNumber] = useState("INV-0001");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState(() => [newItem(), newItem()]);
  const [discountPct, setDiscountPct] = useState("0");
  const [taxPct, setTaxPct] = useState("0");
  const [notes, setNotes] = useState("");

  // Set today/+14-days only after mount so server and client markup match
  // (a Date computed during render would differ between build time and
  // the moment the browser hydrates).
  useEffect(() => {
    const today = new Date();
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setDate(today.toISOString().slice(0, 10));
    setDueDate(due.toISOString().slice(0, 10));
  }, []);

  function updateItem(id, field, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }
  function removeItem(id) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev.map((it) => (it.id === id ? { ...it, desc: "", qty: 1, price: 0 } : it))));
  }
  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }
  function clearInvoice() {
    setFrom(""); setFromAddress(""); setTo(""); setToAddress("");
    setInvNumber("INV-0001");
    const today = new Date();
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setDate(today.toISOString().slice(0, 10));
    setDueDate(due.toISOString().slice(0, 10));
    setDiscountPct("0"); setTaxPct("0"); setNotes("");
    setItems([newItem(), newItem()]);
  }

  const subtotal = items.reduce((sum, it) => sum + num(it.qty) * num(it.price), 0);
  const discountAmt = (subtotal * num(discountPct)) / 100;
  const taxable = subtotal - discountAmt;
  const taxAmt = (taxable * num(taxPct)) / 100;
  const total = taxable + taxAmt;

  function printInvoice() {
    const rows = items
      .filter((item) => item.desc.trim() || num(item.qty) || num(item.price))
      .map(
        (item) => `
          <tr>
            <td>${printableText(item.desc, "Item or service")}</td>
            <td class="number">${escapeHtml(item.qty)}</td>
            <td class="number">${escapeHtml(fmt(num(item.price), symbol))}</td>
            <td class="number strong">${escapeHtml(fmt(num(item.qty) * num(item.price), symbol))}</td>
          </tr>`,
      )
      .join("");

    const invoiceHtml = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${escapeHtml(invNumber || "INV-0001")}</title>
          <style>
            @page { size: A4; margin: 14mm; }
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; background: #fff; color: #17131f; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5; }
            .invoice { width: 100%; max-width: 760px; margin: 0 auto; }
            .top { display: flex; justify-content: space-between; gap: 32px; padding-bottom: 24px; border-bottom: 2px solid #6232aa; }
            .brand { margin: 0; color: #6232aa; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
            h1 { margin: 5px 0 0; font-size: 34px; line-height: 1; letter-spacing: -.03em; }
            .meta { min-width: 230px; border-collapse: collapse; }
            .meta td { padding: 2px 0 2px 18px; vertical-align: top; }
            .meta td:first-child { color: #716b7b; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
            .meta td:last-child { text-align: right; font-weight: 600; }
            .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 42px; padding: 26px 0; }
            .eyebrow { margin-bottom: 7px; color: #716b7b; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
            .party-name { margin-bottom: 3px; font-size: 15px; font-weight: 700; }
            .muted { color: #615b69; }
            table.items { width: 100%; border-collapse: collapse; }
            .items thead { display: table-header-group; }
            .items th { padding: 9px 10px; background: #f2edf9; color: #4f2a84; font-size: 10px; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
            .items th.number, .items td.number { text-align: right; }
            .items td { padding: 11px 10px; border-bottom: 1px solid #e8e3ed; vertical-align: top; }
            .items tr { break-inside: avoid; page-break-inside: avoid; }
            .strong { font-weight: 700; }
            .bottom { display: grid; grid-template-columns: 1fr 270px; gap: 38px; margin-top: 24px; align-items: start; }
            .notes { min-height: 70px; padding: 14px; border: 1px solid #e8e3ed; border-radius: 8px; }
            .totals { width: 100%; border-collapse: collapse; }
            .totals td { padding: 5px 0 5px 14px; }
            .totals td:first-child { color: #615b69; }
            .totals td:last-child { text-align: right; font-weight: 600; }
            .totals .grand td { padding-top: 11px; border-top: 2px solid #6232aa; color: #17131f; font-size: 16px; font-weight: 800; }
            .footer { margin-top: 38px; padding-top: 12px; border-top: 1px solid #e8e3ed; color: #817a89; font-size: 10px; text-align: center; }
            @media print {
              html, body { width: 100%; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <main class="invoice">
            <header class="top">
              <div>
                <p class="brand">Ledgerly</p>
                <h1>Invoice</h1>
              </div>
              <table class="meta">
                <tr><td>Invoice #</td><td>${printableText(invNumber)}</td></tr>
                <tr><td>Date</td><td>${printableText(date)}</td></tr>
                <tr><td>Due date</td><td>${printableText(dueDate)}</td></tr>
              </table>
            </header>

            <section class="parties">
              <div>
                <div class="eyebrow">From</div>
                <div class="party-name">${printableText(from)}</div>
                <div class="muted">${printableText(fromAddress, "")}</div>
              </div>
              <div>
                <div class="eyebrow">Bill to</div>
                <div class="party-name">${printableText(to)}</div>
                <div class="muted">${printableText(toAddress, "")}</div>
              </div>
            </section>

            <table class="items">
              <thead>
                <tr><th>Description</th><th class="number">Qty</th><th class="number">Price</th><th class="number">Amount</th></tr>
              </thead>
              <tbody>${rows || '<tr><td colspan="4" class="muted">No line items</td></tr>'}</tbody>
            </table>

            <section class="bottom">
              <div class="notes">
                <div class="eyebrow">Notes / payment terms</div>
                <div class="muted">${printableText(notes, "No additional notes.")}</div>
              </div>
              <table class="totals">
                <tr><td>Subtotal</td><td>${escapeHtml(fmt(subtotal, symbol))}</td></tr>
                <tr><td>Discount (${escapeHtml(discountPct || "0")}%)</td><td>− ${escapeHtml(fmt(discountAmt, symbol))}</td></tr>
                <tr><td>Tax (${escapeHtml(taxPct || "0")}%)</td><td>${escapeHtml(fmt(taxAmt, symbol))}</td></tr>
                <tr class="grand"><td>Total due</td><td>${escapeHtml(fmt(total, symbol))}</td></tr>
              </table>
            </section>

            <footer class="footer">Invoice generated with Ledgerly</footer>
          </main>
        </body>
      </html>`;

    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("title", "Printable invoice");
    printFrame.setAttribute("aria-hidden", "true");
    Object.assign(printFrame.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "0",
      height: "0",
      border: "0",
    });
    document.body.appendChild(printFrame);

    const printDocument = printFrame.contentDocument;
    if (!printDocument || !printFrame.contentWindow) {
      printFrame.remove();
      return;
    }

    printDocument.open();
    printDocument.write(invoiceHtml);
    printDocument.close();

    const removeFrame = () => {
      window.setTimeout(() => {
        if (printFrame.isConnected) printFrame.remove();
      }, 500);
    };

    window.setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.onafterprint = removeFrame;
      printFrame.contentWindow.print();
      removeFrame();
    }, 250);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Invoice Generator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Fill in the details below — totals update as you type.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>From</label>
          <input className={`${fieldClass} mb-2 w-full`} type="text" placeholder="Your business name" value={from} onChange={(e) => setFrom(e.target.value)} />
          <textarea className={`${areaClass} w-full`} placeholder="Address, email, phone (optional)" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Bill to</label>
          <input className={`${fieldClass} mb-2 w-full`} type="text" placeholder="Client name" value={to} onChange={(e) => setTo(e.target.value)} />
          <textarea className={`${areaClass} w-full`} placeholder="Client address or email (optional)" value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Invoice #</label>
          <input className={`${fieldClass} w-full`} type="text" value={invNumber} onChange={(e) => setInvNumber(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input className={`${fieldClass} w-full`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <input className={`${fieldClass} w-full`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <label className={`${labelClass} mt-5`}>Line items</label>
      <div className="hidden grid-cols-[1fr_60px_90px_90px_32px] gap-2 px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted sm:grid">
        <span>Description</span><span>Qty</span><span>Price</span><span>Total</span><span />
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_60px_90px_90px_32px] sm:items-center">
            <input
              className={`${fieldClass} col-span-2 sm:col-span-1`}
              type="text"
              placeholder="Item or service description"
              value={it.desc}
              onChange={(e) => updateItem(it.id, "desc", e.target.value)}
            />
            <input className={fieldClass} type="number" min="0" step="1" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(it.id, "qty", e.target.value)} />
            <input className={fieldClass} type="number" min="0" step="0.01" placeholder="Price" value={it.price} onChange={(e) => updateItem(it.id, "price", e.target.value)} />
            <span className="text-sm font-semibold text-fg">{fmt(num(it.qty) * num(it.price), symbol)}</span>
            <button type="button" onClick={() => removeItem(it.id)} aria-label="Remove item" className="justify-self-start text-lg leading-none text-muted hover:text-fg print:hidden">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 print:hidden">
        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Add item</Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Discount (%)</label>
          <input className={`${fieldClass} w-full`} type="number" min="0" max="100" step="0.5" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Tax (%)</label>
          <input className={`${fieldClass} w-full`} type="number" min="0" max="100" step="0.5" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Notes / payment terms</label>
        <textarea
          className={`${areaClass} w-full`}
          placeholder="e.g. Payment due within 14 days. Thank you for your business!"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat value={fmt(subtotal, symbol)} label="Subtotal" />
        <Stat value={fmt(discountAmt, symbol)} label="Discount" />
        <Stat value={fmt(taxAmt, symbol)} label="Tax" />
        <Stat value={fmt(total, symbol)} label="Total due" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <Button type="button" size="sm" onClick={printInvoice}>Print / Save as PDF</Button>
        <Button type="button" variant="outline" size="sm" onClick={clearInvoice}>Clear invoice</Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Profit Margin & Markup                                               */
/* ------------------------------------------------------------------ */
function MarginSection({ symbol }) {
  const [costA, setCostA] = useState("");
  const [priceA, setPriceA] = useState("");
  const [costB, setCostB] = useState("");
  const [targetB, setTargetB] = useState("");

  let profit = null, marginPct = null, markupPct = null;
  if (costA !== "" && priceA !== "") {
    const cost = num(costA), price = num(priceA);
    profit = price - cost;
    marginPct = price > 0 ? (profit / price) * 100 : 0;
    markupPct = cost > 0 ? (profit / cost) * 100 : 0;
  }

  let targetResult = null;
  if (costB !== "" && targetB !== "") {
    const cost = num(costB), target = num(targetB);
    if (target >= 100 || target < 0) {
      targetResult = { ok: false, text: "Target margin must be between 0% and 99%." };
    } else {
      const price = cost / (1 - target / 100);
      targetResult = { ok: true, text: `Charge ${fmt(price, symbol)} to hit a ${fmtPct(target)} margin.` };
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Profit Margin &amp; Markup</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Margin is profit as a share of your selling price. Markup is profit as a share of your cost. Same profit, two different percentages.
      </p>

      <div className="mt-5 rounded-xl border border-border bg-surface/60 p-4">
        <p className="font-semibold text-fg">Know your margin</p>
        <p className="mt-0.5 text-sm text-muted">Enter your cost and selling price to see profit, margin, and markup together.</p>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Cost per unit</label>
            <input className={fieldClass} type="number" placeholder="e.g. 40" value={costA} onChange={(e) => setCostA(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Selling price per unit</label>
            <input className={fieldClass} type="number" placeholder="e.g. 60" value={priceA} onChange={(e) => setPriceA(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat value={profit !== null ? fmt(profit, symbol) : "—"} label="Profit" />
          <Stat value={marginPct !== null ? fmtPct(marginPct) : "—"} label="Gross margin" />
          <Stat value={markupPct !== null ? fmtPct(markupPct) : "—"} label="Markup" />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface/60 p-4">
        <p className="font-semibold text-fg">Price for a target margin</p>
        <p className="mt-0.5 text-sm text-muted">Enter your cost and the margin you want, and this works out the price to charge.</p>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Cost per unit</label>
            <input className={fieldClass} type="number" placeholder="e.g. 40" value={costB} onChange={(e) => setCostB(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Target margin (%)</label>
            <input className={fieldClass} type="number" min="0" max="99" placeholder="e.g. 35" value={targetB} onChange={(e) => setTargetB(e.target.value)} />
          </div>
        </div>
        {targetResult && (
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
              targetResult.ok
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            {targetResult.text}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ROI                                                                  */
/* ------------------------------------------------------------------ */
function RoiSection({ symbol }) {
  const [initial, setInitial] = useState("");
  const [final, setFinalVal] = useState("");
  const [months, setMonths] = useState("");

  let profit = null, roiPct = null, annualized = null;
  if (initial !== "" && final !== "") {
    const initialN = num(initial), finalN = num(final), monthsN = num(months);
    profit = finalN - initialN;
    roiPct = initialN > 0 ? (profit / initialN) * 100 : 0;
    const base = 1 + roiPct / 100;
    annualized = monthsN > 0 && base > 0 ? (Math.pow(base, 12 / monthsN) - 1) * 100 : NaN;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">ROI Calculator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Enter what you put in and what came back out to see your return on investment, plus what that return looks like annualized.
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Initial investment</label>
          <input className={fieldClass} type="number" placeholder="e.g. 10000" value={initial} onChange={(e) => setInitial(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Final value</label>
          <input className={fieldClass} type="number" placeholder="e.g. 13500" value={final} onChange={(e) => setFinalVal(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Holding period (months)</label>
          <input className={fieldClass} type="number" placeholder="e.g. 18" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat value={profit !== null ? fmt(profit, symbol) : "—"} label="Net profit" />
        <Stat value={roiPct !== null ? fmtPct(roiPct) : "—"} label="ROI" />
        <Stat value={annualized !== null ? fmtPct(annualized) : "—"} label="Annualized ROI" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Break-Even                                                           */
/* ------------------------------------------------------------------ */
function BreakevenSection({ symbol }) {
  const [fixed, setFixed] = useState("");
  const [price, setPrice] = useState("");
  const [varCost, setVarCost] = useState("");

  let cm = null, cmr = null, units = null, revenue = null, warning = null;
  if (fixed !== "" && price !== "" && varCost !== "") {
    const fixedN = num(fixed), priceN = num(price), varCostN = num(varCost);
    cm = priceN - varCostN;
    if (cm <= 0) {
      warning = "Price must be higher than variable cost per unit for a break-even point to exist.";
    } else {
      units = fixedN / cm;
      revenue = units * priceN;
      cmr = priceN > 0 ? (cm / priceN) * 100 : 0;
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Break-Even Point</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Find out how many units you need to sell before your revenue covers your costs.</p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Fixed costs (per period)</label>
          <input className={fieldClass} type="number" placeholder="e.g. 5000" value={fixed} onChange={(e) => setFixed(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Price per unit</label>
          <input className={fieldClass} type="number" placeholder="e.g. 25" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Variable cost per unit</label>
          <input className={fieldClass} type="number" placeholder="e.g. 10" value={varCost} onChange={(e) => setVarCost(e.target.value)} />
        </div>
      </div>
      {warning && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3.5 py-2.5 text-sm font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {warning}
        </div>
      )}
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat value={cm !== null ? fmt(cm, symbol) : "—"} label="Contribution margin" />
        <Stat value={cmr !== null ? fmtPct(cmr) : "—"} label="CM ratio" />
        <Stat value={units !== null ? fmtNum(units) : "—"} label="Break-even units" />
        <Stat value={revenue !== null ? fmt(revenue, symbol) : "—"} label="Break-even revenue" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Discount & Sales Tax                                                 */
/* ------------------------------------------------------------------ */
function DiscountSection({ symbol }) {
  const [original, setOriginal] = useState("");
  const [discPct, setDiscPct] = useState("0");
  const [taxPct, setTaxPct] = useState("0");

  let discountAmt = null, afterDiscount = null, taxAmt = null, finalPrice = null;
  if (original !== "") {
    const originalN = num(original), dPct = num(discPct), tPct = num(taxPct);
    discountAmt = (originalN * dPct) / 100;
    afterDiscount = originalN - discountAmt;
    taxAmt = (afterDiscount * tPct) / 100;
    finalPrice = afterDiscount + taxAmt;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Discount &amp; Sales Tax</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Apply a discount, then tax on top of the discounted price — the order most businesses actually invoice in.
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Original price</label>
          <input className={fieldClass} type="number" placeholder="e.g. 100" value={original} onChange={(e) => setOriginal(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Discount (%)</label>
          <input className={fieldClass} type="number" min="0" max="100" value={discPct} onChange={(e) => setDiscPct(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Sales tax (%)</label>
          <input className={fieldClass} type="number" min="0" max="100" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat value={discountAmt !== null ? fmt(discountAmt, symbol) : "—"} label="Discount amount" />
        <Stat value={afterDiscount !== null ? fmt(afterDiscount, symbol) : "—"} label="After discount" />
        <Stat value={taxAmt !== null ? fmt(taxAmt, symbol) : "—"} label="Tax amount" />
        <Stat value={finalPrice !== null ? fmt(finalPrice, symbol) : "—"} label="Final price" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Business Loan / EMI                                                  */
/* ------------------------------------------------------------------ */
function LoanSection({ symbol }) {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");

  let payment = null, totalInterest = null, totalPaid = null;
  if (amount !== "" && term !== "") {
    const P = num(amount), annualRate = num(rate), n = num(term);
    if (P > 0 && n > 0) {
      const r = annualRate / 100 / 12;
      let emi;
      if (r === 0) {
        emi = P / n;
      } else {
        const factor = Math.pow(1 + r, n);
        emi = (P * r * factor) / (factor - 1);
      }
      payment = emi;
      totalPaid = emi * n;
      totalInterest = totalPaid - P;
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Business Loan / EMI Calculator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Work out the monthly payment on a fixed-rate loan, and how much of it is interest over the full term.
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Loan amount</label>
          <input className={fieldClass} type="number" placeholder="e.g. 50000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Annual interest rate (%)</label>
          <input className={fieldClass} type="number" placeholder="e.g. 8.5" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Term (months)</label>
          <input className={fieldClass} type="number" placeholder="e.g. 36" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat value={payment !== null ? fmt(payment, symbol) : "—"} label="Monthly payment" />
        <Stat value={totalInterest !== null ? fmt(totalInterest, symbol) : "—"} label="Total interest" />
        <Stat value={totalPaid !== null ? fmt(totalPaid, symbol) : "—"} label="Total repaid" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Freelance Hourly Rate                                                */
/* ------------------------------------------------------------------ */
function FreelanceSection({ symbol }) {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [marginPct, setMarginPct] = useState("0");
  const [hoursWeek, setHoursWeek] = useState("");
  const [weeksYear, setWeeksYear] = useState("");

  let totalHours = null, hourly = null, dayRate = null, weekRate = null;
  if (income !== "" && hoursWeek !== "" && weeksYear !== "") {
    const incomeN = num(income), expensesN = num(expenses), marginN = num(marginPct);
    const hoursWeekN = num(hoursWeek), weeksYearN = num(weeksYear);
    totalHours = hoursWeekN * weeksYearN;
    const base = incomeN + expensesN;
    const gross = marginN < 100 && marginN >= 0 ? base / (1 - marginN / 100) : base;
    hourly = totalHours > 0 ? gross / totalHours : 0;
    dayRate = hourly * 8;
    weekRate = hourly * hoursWeekN;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Freelance Hourly Rate</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Work backward from what you need to earn to a rate you can quote with confidence.</p>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Desired annual income</label>
          <input className={fieldClass} type="number" placeholder="e.g. 60000" value={income} onChange={(e) => setIncome(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Annual business expenses</label>
          <input className={fieldClass} type="number" placeholder="e.g. 6000" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Target profit margin (%)</label>
          <input className={fieldClass} type="number" min="0" max="95" value={marginPct} onChange={(e) => setMarginPct(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Billable hours per week</label>
          <input className={fieldClass} type="number" placeholder="e.g. 25" value={hoursWeek} onChange={(e) => setHoursWeek(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Working weeks per year</label>
          <input className={fieldClass} type="number" placeholder="e.g. 48" value={weeksYear} onChange={(e) => setWeeksYear(e.target.value)} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat value={totalHours !== null ? fmtNum(totalHours) : "—"} label="Billable hours/yr" />
        <Stat value={hourly !== null ? fmt(hourly, symbol) : "—"} label="Hourly rate" />
        <Stat value={dayRate !== null ? fmt(dayRate, symbol) : "—"} label="Day rate (8h)" />
        <Stat value={weekRate !== null ? fmt(weekRate, symbol) : "—"} label="Weekly rate" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Startup Cost Estimator                                               */
/* ------------------------------------------------------------------ */
let costIdCounter = 0;
function newCost(placeholder) {
  costIdCounter += 1;
  return { id: costIdCounter, name: "", amount: 0, placeholder };
}

function CostList({ title, rows, setRows, addLabel, addPlaceholder }) {
  function update(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function remove(id) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev.map((r) => (r.id === id ? { ...r, name: "", amount: 0 } : r))));
  }
  function add() {
    setRows((prev) => [...prev, newCost(addPlaceholder)]);
  }
  return (
    <div>
      <label className={labelClass}>{title}</label>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <input className={fieldClass} type="text" placeholder={r.placeholder} value={r.name} onChange={(e) => update(r.id, "name", e.target.value)} />
            <input className={`${fieldClass} max-w-[120px]`} type="number" min="0" step="0.01" placeholder="Amount" value={r.amount} onChange={(e) => update(r.id, "amount", e.target.value)} />
            <button type="button" onClick={() => remove(r.id)} aria-label="Remove cost" className="text-lg leading-none text-muted hover:text-fg">×</button>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Button type="button" variant="outline" size="sm" onClick={add}>{addLabel}</Button>
      </div>
    </div>
  );
}

function StartupSection({ symbol }) {
  const [oneTime, setOneTime] = useState(() => [newCost("e.g. Equipment"), newCost("e.g. Website & branding")]);
  const [recurring, setRecurring] = useState(() => [newCost("e.g. Rent"), newCost("e.g. Software subscriptions")]);

  const oneTimeTotal = oneTime.reduce((sum, r) => sum + num(r.amount), 0);
  const monthlyTotal = recurring.reduce((sum, r) => sum + num(r.amount), 0);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Startup Cost Estimator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        List what you&apos;ll spend once to get started, and what repeats every month, to size up the investment and a cash runway.
      </p>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <CostList title="One-time costs" rows={oneTime} setRows={setOneTime} addLabel="+ Add one-time cost" addPlaceholder="e.g. Equipment" />
        <CostList title="Monthly recurring costs" rows={recurring} setRows={setRecurring} addLabel="+ Add recurring cost" addPlaceholder="e.g. Rent" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat value={fmt(oneTimeTotal, symbol)} label="Total one-time" />
        <Stat value={fmt(monthlyTotal, symbol)} label="Monthly recurring" />
        <Stat value={fmt(oneTimeTotal + monthlyTotal * 12, symbol)} label="First-year estimate" />
        <Stat value={fmt(oneTimeTotal + monthlyTotal * 6, symbol)} label="6-month runway" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
export default function LedgerlyBusinessTool() {
  const [symbol, setSymbol] = useState("$");
  const [activeTab, setActiveTab] = useState("margin");

  return (
    <div>
      <InvoiceSection symbol={symbol} />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className={rowLabelClass} htmlFor="currencySelect">Display currency</label>
        <select id="currencySelect" className={`${selectClass} max-w-xs`} value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.label} value={c.symbol}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        {activeTab === "margin" && <MarginSection symbol={symbol} />}
        {activeTab === "roi" && <RoiSection symbol={symbol} />}
        {activeTab === "breakeven" && <BreakevenSection symbol={symbol} />}
        {activeTab === "discount" && <DiscountSection symbol={symbol} />}
        {activeTab === "loans" && <LoanSection symbol={symbol} />}
        {activeTab === "freelance" && <FreelanceSection symbol={symbol} />}
        {activeTab === "startup" && <StartupSection symbol={symbol} />}
      </div>
    </div>
  );
}
