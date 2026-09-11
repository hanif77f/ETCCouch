"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Shared styles — same tokens as WordCounterTool.jsx                 */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const selectClass = fieldClass + " cursor-pointer";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";
const rowLabelClass = "text-sm font-semibold text-muted sm:w-36 sm:shrink-0";

// Semantic status colors — deliberately fixed hex rather than theme tokens,
// since BMI category / gain-loss meaning (amber = caution, green = good,
// red = bad) should read the same regardless of the site's accent color.
const STATUS = {
  warn: "#d97706", // amber-600 — underweight
  success: "#16a34a", // emerald-600 — healthy / increase
  warn2: "#ea580c", // orange-600 — overweight
  fail: "#e11d48", // rose-600 — obese / decrease
};

// Matches the brand accent from the original prototype (`--accent: #6331ab`).
// Swap for your real accent token/hex if it differs.
const ACCENT = "#6331ab";

function fmtNum(n, d) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 2 });
}

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" }, { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" }, { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" }, { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" }, { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" }, { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" }, { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" }, { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" }, { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" }, { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨" }, { code: "NPR", name: "Nepalese Rupee", symbol: "₨" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" }, { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" }, { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" }, { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" }, { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" }, { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼" }, { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" }, { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£" }, { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" }, { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "LYD", name: "Libyan Dinar", symbol: "ل.د" }, { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" }, { code: "SYP", name: "Syrian Pound", symbol: "£" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" }, { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" }, { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" }, { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" }, { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA" }, { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" }, { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
  { code: "BWP", name: "Botswana Pula", symbol: "P" }, { code: "NAD", name: "Namibian Dollar", symbol: "$" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨" }, { code: "SCR", name: "Seychellois Rupee", symbol: "₨" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK" }, { code: "MGA", name: "Malagasy Ariary", symbol: "Ar" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw" }, { code: "BIF", name: "Burundian Franc", symbol: "FBu" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC" }, { code: "GMD", name: "Gambian Dalasi", symbol: "D" },
  { code: "GNF", name: "Guinean Franc", symbol: "FG" }, { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le" },
  { code: "LRD", name: "Liberian Dollar", symbol: "$" }, { code: "CVE", name: "Cape Verdean Escudo", symbol: "$" },
  { code: "STN", name: "São Tomé & Príncipe Dobra", symbol: "Db" }, { code: "AOA", name: "Angolan Kwanza", symbol: "Kz" },
  { code: "SZL", name: "Eswatini Lilangeni", symbol: "L" }, { code: "LSL", name: "Lesotho Loti", symbol: "L" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh" }, { code: "DJF", name: "Djiboutian Franc", symbol: "Fdj" },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk" }, { code: "SDG", name: "Sudanese Pound", symbol: "ج.س." },
  { code: "KMF", name: "Comorian Franc", symbol: "CF" }, { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" }, { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" }, { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr" }, { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин." }, { code: "ALL", name: "Albanian Lek", symbol: "L" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден" }, { code: "BAM", name: "Bosnia-Herzegovina Mark", symbol: "KM" },
  { code: "MDL", name: "Moldovan Leu", symbol: "L" }, { code: "GEL", name: "Georgian Lari", symbol: "₾" },
  { code: "AMD", name: "Armenian Dram", symbol: "դր." }, { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br" }, { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "so'm" }, { code: "KGS", name: "Kyrgyzstani Som", symbol: "с" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ" }, { code: "TMT", name: "Turkmenistani Manat", symbol: "m" },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮" }, { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" }, { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" }, { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" }, { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "LAK", name: "Lao Kip", symbol: "₭" }, { code: "BND", name: "Brunei Dollar", symbol: "$" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" }, { code: "MOP", name: "Macanese Pataca", symbol: "MOP$" },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu." }, { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" }, { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" }, { code: "ARS", name: "Argentine Peso", symbol: "$" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U" }, { code: "PYG", name: "Paraguayan Guarani", symbol: "₲" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs." }, { code: "VES", name: "Venezuelan Bolivar", symbol: "Bs." },
  { code: "GYD", name: "Guyanese Dollar", symbol: "$" }, { code: "SRD", name: "Surinamese Dollar", symbol: "$" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" }, { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "NIO", name: "Nicaraguan Cordoba", symbol: "C$" }, { code: "CRC", name: "Costa Rican Colon", symbol: "₡" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/." }, { code: "DOP", name: "Dominican Peso", symbol: "RD$" },
  { code: "CUP", name: "Cuban Peso", symbol: "$" }, { code: "HTG", name: "Haitian Gourde", symbol: "G" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "$" }, { code: "TTD", name: "Trinidad & Tobago Dollar", symbol: "$" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "$" }, { code: "BSD", name: "Bahamian Dollar", symbol: "$" },
  { code: "BZD", name: "Belize Dollar", symbol: "$" }, { code: "BMD", name: "Bermudian Dollar", symbol: "$" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "$" }, { code: "XCD", name: "East Caribbean Dollar", symbol: "$" },
  { code: "ANG", name: "Netherlands Antillean Guilder", symbol: "ƒ" }, { code: "AWG", name: "Aruban Florin", symbol: "ƒ" },
  { code: "FJD", name: "Fijian Dollar", symbol: "$" }, { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
  { code: "WST", name: "Samoan Tala", symbol: "T" }, { code: "TOP", name: "Tongan Pa'anga", symbol: "T$" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "$" }, { code: "VUV", name: "Vanuatu Vatu", symbol: "VT" },
  { code: "XPF", name: "CFP Franc", symbol: "₣" }, { code: "FKP", name: "Falkland Islands Pound", symbol: "£" },
  { code: "GIP", name: "Gibraltar Pound", symbol: "£" }, { code: "SHP", name: "Saint Helena Pound", symbol: "£" },
  { code: "JEP", name: "Jersey Pound", symbol: "£" }, { code: "GGP", name: "Guernsey Pound", symbol: "£" },
  { code: "IMP", name: "Isle of Man Pound", symbol: "£" },
];

function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}
function fmtMoney(n, symbol) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return (symbol || "$") + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function CurrencySelect({ value, onChange, includeNone }) {
  return (
    <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {includeNone && <option value="">None — plain numbers</option>}
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}

function CopyButton({ activeKey, myKey, onCopy, value }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onCopy(myKey, value)}>
        Copy result
      </Button>
      <span className={`text-xs font-semibold text-accent-soft transition-opacity ${activeKey === myKey ? "opacity-100" : "opacity-0"}`}>
        Copied.
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BMI                                                                  */
/* ------------------------------------------------------------------ */
const BMI_CATEGORIES = [
  { max: 18.5, name: "Underweight", color: STATUS.warn },
  { max: 25, name: "Healthy", color: STATUS.success },
  { max: 30, name: "Overweight", color: STATUS.warn2 },
  { max: Infinity, name: "Obese", color: STATUS.fail },
];

function bmiNeedlePoint(value) {
  const clamped = Math.max(15, Math.min(40, value));
  const fraction = (clamped - 15) / (40 - 15);
  const angleDeg = 180 - fraction * 180;
  const rad = (angleDeg * Math.PI) / 180;
  const r = 95, cx = 150, cy = 150;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function BmiSection({ copiedKey, copy }) {
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightCm, setHeightCm] = useState("170");
  const [heightM, setHeightM] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightKg, setWeightKg] = useState("68");
  const [weightLb, setWeightLb] = useState("");
  const [weightSt, setWeightSt] = useState("");

  function heightToMeters() {
    if (heightUnit === "cm") {
      const cm = parseFloat(heightCm);
      return cm ? cm / 100 : null;
    }
    if (heightUnit === "m") {
      const m = parseFloat(heightM);
      return m || null;
    }
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    const totalIn = ft * 12 + inch;
    return totalIn ? totalIn * 0.0254 : null;
  }
  function weightToKg() {
    if (weightUnit === "kg") return parseFloat(weightKg) || null;
    if (weightUnit === "lb") {
      const lb = parseFloat(weightLb);
      return lb ? lb * 0.453592 : null;
    }
    const st = parseFloat(weightSt);
    return st ? st * 6.35029 : null;
  }
  function kgToDisplay(kg) {
    if (weightUnit === "kg") return `${fmtNum(kg, 1)} kg`;
    if (weightUnit === "lb") return `${fmtNum(kg * 2.20462, 0)} lb`;
    return `${fmtNum(kg / 6.35029, 1)} st`;
  }

  const heightMeters = heightToMeters();
  const weightKgVal = weightToKg();
  const bmi = heightMeters && weightKgVal ? weightKgVal / (heightMeters * heightMeters) : null;
  const category = bmi ? BMI_CATEGORIES.find((c) => bmi < c.max) : null;
  const needle = bmiNeedlePoint(bmi || 15);

  let rangeText = "—";
  let summary = "";
  if (bmi && heightMeters) {
    const minKg = 18.5 * heightMeters * heightMeters;
    const maxKg = 24.9 * heightMeters * heightMeters;
    rangeText = `${kgToDisplay(minKg)} – ${kgToDisplay(maxKg)}`;
    summary = `BMI: ${fmtNum(bmi, 1)} (${category.name}) — healthy range ${rangeText}`;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">BMI Calculator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Check your body mass index and see your healthy weight range for your height.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div>
          <label className={labelClass}>Height</label>
          <select className={`${selectClass} mb-3`} value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)}>
            <option value="cm">Centimeters (cm)</option>
            <option value="ftin">Feet &amp; inches</option>
            <option value="m">Meters (m)</option>
          </select>
          {heightUnit === "cm" && (
            <input className={`${fieldClass} mb-4 w-full`} type="number" min="0" placeholder="170" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} aria-label="Height in centimeters" />
          )}
          {heightUnit === "ftin" && (
            <div className="mb-4 flex gap-2">
              <input className={fieldClass} type="number" min="0" placeholder="5" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} aria-label="Height, feet" />
              <input className={fieldClass} type="number" min="0" placeholder="7" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} aria-label="Height, inches" />
            </div>
          )}
          {heightUnit === "m" && (
            <input className={`${fieldClass} mb-4 w-full`} type="number" min="0" step="0.01" placeholder="1.70" value={heightM} onChange={(e) => setHeightM(e.target.value)} aria-label="Height in meters" />
          )}

          <label className={labelClass}>Weight</label>
          <select className={`${selectClass} mb-3`} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}>
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="st">Stone (st)</option>
          </select>
          {weightUnit === "kg" && (
            <input className={`${fieldClass} w-full`} type="number" min="0" placeholder="68" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} aria-label="Weight in kilograms" />
          )}
          {weightUnit === "lb" && (
            <input className={`${fieldClass} w-full`} type="number" min="0" placeholder="150" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} aria-label="Weight in pounds" />
          )}
          {weightUnit === "st" && (
            <input className={`${fieldClass} w-full`} type="number" min="0" step="0.1" placeholder="10.7" value={weightSt} onChange={(e) => setWeightSt(e.target.value)} aria-label="Weight in stone" />
          )}

          <details className="mt-5 border-t border-border pt-3">
            <summary className="cursor-pointer text-sm font-semibold text-fg">How this is calculated</summary>
            <p className="mt-2 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-muted">
              BMI = weight (kg) ÷ height (m)². Height and weight are converted to metric internally, whichever units you pick above. Categories follow the WHO adult reference ranges.
            </p>
          </details>
        </div>

        {/* Readout */}
        <div className="text text-center">
          <p className={labelClass}>Your BMI</p>
          <p className="font-mono text-4xl font-bold leading-tight text-fg">{bmi ? fmtNum(bmi, 1) : "—"}</p>
          {category && (
            <p className="mt-1 text-sm font-semibold" style={{ color: category.color }}>
              {category.name} weight
            </p>
          )}

          <div className="mt-4 flex flex-col items-center">
            <svg viewBox="0 0 300 165" width="240">
              <path d="M40,150 A110,110 0 0 1 50.47,103.16" fill="none" stroke={STATUS.warn} strokeWidth="16" strokeLinecap="round" />
              <path d="M50.47,103.16 A110,110 0 0 1 116.01,45.38" fill="none" stroke={STATUS.success} strokeWidth="16" strokeLinecap="round" />
              <path d="M116.01,45.38 A110,110 0 0 1 183.99,45.38" fill="none" stroke={STATUS.warn2} strokeWidth="16" strokeLinecap="round" />
              <path d="M183.99,45.38 A110,110 0 0 1 260,150" fill="none" stroke={STATUS.fail} strokeWidth="16" strokeLinecap="round" />
              <circle cx="150" cy="150" r="6" className="fill-fg" />
              <line x1="150" y1="150" x2={needle.x.toFixed(1)} y2={needle.y.toFixed(1)} className="stroke-fg" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="mt-3 flex flex-wrap justify-center gap-3.5 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS.warn }} />Underweight</span>
              <span className="inline-flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS.success }} />Healthy</span>
              <span className="inline-flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS.warn2 }} />Overweight</span>
              <span className="inline-flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS.fail }} />Obese</span>
            </div>
          </div>

          <hr className="my-4 border-border" />
          <p className={labelClass}>Healthy weight range for this height</p>
          <p className="font-mono text-lg font-bold text-fg">{rangeText}</p>

          <CopyButton activeKey={copiedKey} myKey="bmi" onCopy={copy} value={summary} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mortgage                                                             */
/* ------------------------------------------------------------------ */
function MortgageSection({ copiedKey, copy }) {
  const [currency, setCurrency] = useState("USD");
  const [price, setPrice] = useState("");
  const [down, setDown] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("30");
  const [termCustom, setTermCustom] = useState("");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [tax, setTax] = useState("");
  const [insurance, setInsurance] = useState("");
  const [hoa, setHoa] = useState("");

  const symbol = getCurrency(currency).symbol;
  const priceNum = parseFloat(price);
  const downNum = parseFloat(down) || 0;
  const rateNum = parseFloat(rate);
  const termNum = term === "custom" ? parseFloat(termCustom) : parseFloat(term);

  let monthlyTotal = null, monthlyPI = null, principal = null, totalInterest = null, totalPaid = null, principalPct = 50;
  let summary = "";

  if (priceNum && !isNaN(rateNum) && termNum) {
    principal = Math.max(priceNum - downNum, 0);
    const monthlyRate = rateNum / 100 / 12;
    const n = termNum * 12;
    monthlyPI = monthlyRate === 0 ? principal / n : (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
    totalPaid = monthlyPI * n;
    totalInterest = totalPaid - principal;

    const extras = (parseFloat(tax) || 0) / 12 + (parseFloat(insurance) || 0) / 12 + (parseFloat(hoa) || 0);
    monthlyTotal = monthlyPI + (extrasOpen ? extras : 0);
    principalPct = (principal / totalPaid) * 100;

    summary = `Monthly payment: ${fmtMoney(monthlyTotal, symbol)} — loan amount ${fmtMoney(principal, symbol)}, total interest ${fmtMoney(totalInterest, symbol)}, total of payments ${fmtMoney(totalPaid, symbol)}`;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Mortgage Payment Calculator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Estimate your monthly principal &amp; interest, total interest paid, and the full cost of the loan.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Currency</label>
          <CurrencySelect value={currency} onChange={setCurrency} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Home price</label>
          <input className={fieldClass} type="number" min="0" placeholder="350,000" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Down payment</label>
          <input className={fieldClass} type="number" min="0" placeholder="70,000" value={down} onChange={(e) => setDown(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Interest rate</label>
          <input className={fieldClass} type="number" min="0" step="0.01" placeholder="6.5 %/yr" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Loan term</label>
          <select className={selectClass} value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {term === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Custom term</label>
            <input className={fieldClass} type="number" min="1" placeholder="10 years" value={termCustom} onChange={(e) => setTermCustom(e.target.value)} />
          </div>
        )}
      </div>

      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setExtrasOpen((o) => !o)}>
        {extrasOpen ? "− Hide" : "+ Add"} taxes, insurance &amp; HOA
      </Button>
      {extrasOpen && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Property tax</label>
            <input className={fieldClass} type="number" min="0" placeholder="0 /yr" value={tax} onChange={(e) => setTax(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>Home insurance</label>
            <input className={fieldClass} type="number" min="0" placeholder="0 /yr" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className={rowLabelClass}>HOA dues</label>
            <input className={fieldClass} type="number" min="0" placeholder="0 /mo" value={hoa} onChange={(e) => setHoa(e.target.value)} />
          </div>
        </div>
      )}

      <hr className="my-5 border-border" />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl bg-fg px-3 py-2.5 text-surface">
          <span className="block font-mono text-lg font-bold">{fmtMoney(monthlyTotal, symbol)}</span>
          <span className="text-[11px] text-accent-soft">Monthly payment</span>
        </div>
        <div className="rounded-xl bg-fg px-3 py-2.5 text-surface">
          <span className="block font-mono text-lg font-bold">{fmtMoney(principal, symbol)}</span>
          <span className="text-[11px] text-accent-soft">Loan amount</span>
        </div>
        <div className="rounded-xl bg-fg px-3 py-2.5 text-surface">
          <span className="block font-mono text-lg font-bold">{fmtMoney(totalInterest, symbol)}</span>
          <span className="text-[11px] text-accent-soft">Total interest</span>
        </div>
        <div className="rounded-xl bg-fg px-3 py-2.5 text-surface">
          <span className="block font-mono text-lg font-bold">{fmtMoney(totalPaid, symbol)}</span>
          <span className="text-[11px] text-accent-soft">Total of payments</span>
        </div>
      </div>
      <p className="mt-2.5 text-sm text-muted">
        {extrasOpen && monthlyPI ? `Includes taxes, insurance & HOA · P&I is ${fmtMoney(monthlyPI, symbol)}` : "Principal & interest"}
      </p>

      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-surface">
        <div className="h-full bg-fg" style={{ width: `${principalPct}%` }} />
        <div className="h-full" style={{ width: `${100 - principalPct}%`, backgroundColor: ACCENT }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-sm bg-fg" />Principal</span>
        <span className="inline-flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: ACCENT }} />Interest</span>
      </div>

      <CopyButton activeKey={copiedKey} myKey="mortgage" onCopy={copy} value={summary} />

      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-fg">How this is calculated</summary>
        <p className="mt-2 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-muted">
          M = P × r(1+r)ⁿ ÷ ((1+r)ⁿ − 1)<br />P = loan amount, r = monthly rate, n = number of payments.
        </p>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Percentage                                                           */
/* ------------------------------------------------------------------ */
const PERCENT_LABELS = {
  of: { a: "Percentage", b: "Of this number", resultLabel: "Result", formula: "Result = (X ÷ 100) × Y" },
  find: { a: "This number", b: "Is what % of", resultLabel: "Is this percentage", formula: "Result = (X ÷ Y) × 100" },
  change: { a: "From", b: "To", resultLabel: "Change", formula: "Result = ((Y − X) ÷ X) × 100" },
};

function PercentageSection({ copiedKey, copy }) {
  const [mode, setMode] = useState("of");
  const [currency, setCurrency] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const L = PERCENT_LABELS[mode];
  const sym = currency ? getCurrency(currency).symbol : "";
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);

  let resultText = "—", sentence = "", isUp = null;
  if (!isNaN(aNum) && !isNaN(bNum)) {
    if (mode === "of") {
      const r = (aNum / 100) * bNum;
      resultText = sym + fmtNum(r, 2);
      sentence = `${aNum}% of ${sym}${bNum} is ${sym}${fmtNum(r, 2)}.`;
    } else if (mode === "find") {
      if (bNum === 0) {
        sentence = "Can't divide by zero.";
      } else {
        const r2 = (aNum / bNum) * 100;
        resultText = `${fmtNum(r2, 2)}%`;
        sentence = `${sym}${aNum} is ${fmtNum(r2, 2)}% of ${sym}${bNum}.`;
      }
    } else {
      if (aNum === 0) {
        sentence = "Starting value can't be zero.";
      } else {
        const change = ((bNum - aNum) / aNum) * 100;
        isUp = change >= 0;
        resultText = `${isUp ? "+" : ""}${fmtNum(change, 2)}%`;
        sentence = `From ${sym}${aNum} to ${sym}${bNum} is a ${isUp ? "rise" : "drop"} of ${fmtNum(Math.abs(change), 2)}%.`;
      }
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Percentage Calculator</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">Three modes for the percentage questions people actually ask.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["of", "X% of Y"],
          ["find", "X is what % of Y"],
          ["change", "% change"],
        ].map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full border px-3.5 py-2 text-sm font-semibold focus-ring ${
              mode === m ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>Currency (optional)</label>
          <CurrencySelect value={currency} onChange={setCurrency} includeNone />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>{L.a}</label>
          <input className={fieldClass} type="number" placeholder="15" value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className={rowLabelClass}>{L.b}</label>
          <input className={fieldClass} type="number" placeholder="240" value={b} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>

      <hr className="my-5 border-border" />

      <div className="inline-block rounded-xl bg-fg px-3.5 py-2.5 text-surface">
        <span className="block font-mono text-xl font-bold">{resultText}</span>
        <span className="text-[11px] text-accent-soft">{L.resultLabel}</span>
      </div>
      <p className="mt-3 text-sm text-muted">{sentence}</p>
      {mode === "change" && isUp !== null && (
        <div
          className="mt-2 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: isUp ? STATUS.success : STATUS.fail }}
        >
          {isUp ? "▲ Increase" : "▼ Decrease"}
        </div>
      )}

      <CopyButton activeKey={copiedKey} myKey="percentage" onCopy={copy} value={sentence} />

      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-fg">How this is calculated</summary>
        <p className="mt-2 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-muted">{L.formula}</p>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
export default function GaugeCalculatorTool() {
  const [activeTab, setActiveTab] = useState("mortgage");
  const [copiedKey, setCopiedKey] = useState("");

  function copy(key, value) {
    if (!value) return;
    const done = () => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(done);
    } else {
      done();
    }
  }

  return (
    <div>
      <BmiSection copiedKey={copiedKey} copy={copy} />

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ["mortgage", "Mortgage"],
          ["percentage", "Percentage"],
        ].map(([key, label]) => (
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
        {activeTab === "mortgage" && <MortgageSection copiedKey={copiedKey} copy={copy} />}
        {activeTab === "percentage" && <PercentageSection copiedKey={copiedKey} copy={copy} />}
      </div>
    </div>
  );
}