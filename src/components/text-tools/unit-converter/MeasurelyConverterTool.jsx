"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared styles — same tokens as WordCounterTool.jsx / GaugeCalculatorTool.jsx */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const selectClass = fieldClass + " cursor-pointer";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";

/* ------------------------------------------------------------------ */
/* Unit data — ported 1:1 from the standalone prototype               */
/* ------------------------------------------------------------------ */
const CATEGORIES = {
  length: {
    label: "Length",
    units: { mm: "Millimeters", cm: "Centimeters", m: "Meters", km: "Kilometers", in: "Inches", ft: "Feet", yd: "Yards", mi: "Miles" },
    factor: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    def: { from: "mi", to: "km" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
  weight: {
    label: "Weight",
    units: { mg: "Milligrams", g: "Grams", kg: "Kilograms", t: "Metric tonnes", oz: "Ounces", lb: "Pounds", st: "Stone" },
    factor: { mg: 0.001, g: 1, kg: 1000, t: 1000000, oz: 28.349523125, lb: 453.59237, st: 6350.29318 },
    def: { from: "lb", to: "kg" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
  temperature: {
    label: "Temperature",
    units: { c: "Celsius", f: "Fahrenheit", k: "Kelvin" },
    special: "temperature",
    def: { from: "f", to: "c" },
    refValues: [-40, 0, 20, 37, 100],
  },
  volume: {
    label: "Volume",
    units: { ml: "Milliliters", l: "Liters", galus: "Gallons (US)", qtus: "Quarts (US)", ptus: "Pints (US)", cupus: "Cups (US)", flozus: "Fluid ounces (US)" },
    factor: { ml: 0.001, l: 1, galus: 3.785411784, qtus: 0.946352946, ptus: 0.473176473, cupus: 0.2365882365, flozus: 0.0295735295625 },
    def: { from: "galus", to: "l" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
  speed: {
    label: "Speed",
    units: { kmh: "Km per hour", mph: "Miles per hour", ms: "Meters per second", knot: "Knots" },
    factor: { kmh: 0.2777777778, mph: 0.44704, ms: 1, knot: 0.5144444444 },
    def: { from: "mph", to: "kmh" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
  area: {
    label: "Area",
    units: { sqm: "Square meters", sqkm: "Square kilometers", sqft: "Square feet", sqmi: "Square miles", acre: "Acres", hectare: "Hectares" },
    factor: { sqm: 1, sqkm: 1000000, sqft: 0.09290304, sqmi: 2589988.110336, acre: 4046.8564224, hectare: 10000 },
    def: { from: "sqft", to: "sqm" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
  data: {
    label: "Data",
    units: { bit: "Bits", byte: "Bytes", kb: "Kilobytes", mb: "Megabytes", gb: "Gigabytes", tb: "Terabytes" },
    factor: { bit: 0.125, byte: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 },
    def: { from: "gb", to: "mb" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
  time: {
    label: "Time",
    units: { sec: "Seconds", min: "Minutes", hour: "Hours", day: "Days", week: "Weeks" },
    factor: { sec: 1, min: 60, hour: 3600, day: 86400, week: 604800 },
    def: { from: "hour", to: "min" },
    refValues: [1, 5, 10, 25, 50, 100],
  },
};

function toCelsius(v, unit) {
  if (unit === "c") return v;
  if (unit === "f") return ((v - 32) * 5) / 9;
  return v - 273.15; // k
}
function fromCelsius(v, unit) {
  if (unit === "c") return v;
  if (unit === "f") return (v * 9) / 5 + 32;
  return v + 273.15; // k
}
function convertValue(value, cat, fromUnit, toUnit) {
  if (cat.special === "temperature") return fromCelsius(toCelsius(value, fromUnit), toUnit);
  const base = value * cat.factor[fromUnit];
  return base / cat.factor[toUnit];
}
function formatNumber(n) {
  if (!isFinite(n)) return "—";
  const rounded = Math.round(n * 1e6) / 1e6;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function MeasurelyConverterTool() {
  const [currentCatKey, setCurrentCatKey] = useState("length");
  const cat = CATEGORIES[currentCatKey];

  const [fromUnit, setFromUnit] = useState(cat.def.from);
  const [toUnit, setToUnit] = useState(cat.def.to);
  const [fromValue, setFromValue] = useState("1");

  function switchCategory(key) {
    const nextCat = CATEGORIES[key];
    setCurrentCatKey(key);
    setFromUnit(nextCat.def.from);
    setToUnit(nextCat.def.to);
    setFromValue("1");
  }

  function swap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  const raw = parseFloat(fromValue);
  const result = !isNaN(raw) ? convertValue(raw, cat, fromUnit, toUnit) : null;

  const resultNote =
    result === null ? (
      "Enter a number to convert."
    ) : (
      <>
        <strong>{formatNumber(raw)} {cat.units[fromUnit]}</strong> equals <strong>{formatNumber(result)} {cat.units[toUnit]}</strong>.
      </>
    );

  const refRows = useMemo(() => {
    const { from, to } = cat.def;
    return cat.refValues.map((v) => {
      const r = convertValue(v, cat, from, to);
      return { v, r };
    });
  }, [cat]);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchCategory(key)}
            className={`rounded-full border px-3.5 py-2 text-sm font-semibold focus-ring ${
              currentCatKey === key ? "border-fg bg-fg text-surface" : "border-border bg-surface text-muted hover:text-fg"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className={labelClass} htmlFor="fromValue">From</label>
            <input
              id="fromValue"
              className={`${fieldClass} mb-2 w-full`}
              type="text"
              inputMode="decimal"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
            />
            <select className={`${selectClass} w-full`} value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {Object.entries(cat.units).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swap}
            aria-label="Swap units"
            className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-fg focus-ring sm:mb-2"
          >
            <ArrowLeftRight size={18} />
          </button>

          <div>
            <label className={labelClass} htmlFor="toValue">To</label>
            <input
              id="toValue"
              className={`${fieldClass} mb-2 w-full bg-surface/60`}
              type="text"
              inputMode="decimal"
              readOnly
              value={result !== null ? formatNumber(result) : ""}
            />
            <select className={`${selectClass} w-full`} value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {Object.entries(cat.units).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">{resultNote}</p>
      </section>

      {/* Quick reference table */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Quick reference</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Common {cat.label.toLowerCase()} conversions between {cat.units[cat.def.from].toLowerCase()} and {cat.units[cat.def.to].toLowerCase()}.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {cat.units[cat.def.from]}
                </th>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {cat.units[cat.def.to]}
                </th>
                <th className="border-b border-border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Rounded</th>
              </tr>
            </thead>
            <tbody>
              {refRows.map(({ v, r }) => (
                <tr key={v}>
                  <td className="border-b border-border px-4 py-2.5 text-fg">{formatNumber(v)}</td>
                  <td className="border-b border-border px-4 py-2.5 text-fg">{formatNumber(r)}</td>
                  <td className="border-b border-border px-4 py-2.5 text-fg">{r.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Results are calculated at full precision and rounded only for display, so chaining conversions won&apos;t compound rounding errors.
        </p>
      </section>
    </div>
  );
}
