import { Timer, CalendarRange, Globe, Cake, Type, Gauge,Clapperboard , ArrowLeftRight, FileText,Images, QrCode, Palette, ScanText } from "lucide-react";

/**
 * Per-tool visual identity — same pattern as `src/data/gameThemes.js`.
 * `rgb` is a space-separated triplet so it can be dropped into
 * `rgb(<triplet> / <alpha>)` for translucent layers.
 */
export const TOOL_THEMES = {
  "epoch-timestamp-converter": {
    Icon: Timer,
    rgb: "98 50 170", // primary #6232AA
  },
  "date-difference-calculator": {
    Icon: CalendarRange,
    rgb: "124 77 196", // primary, lifted
  },
  "timezone-converter": {
    Icon: Globe,
    rgb: "143 99 214", // primary, light
  },
  "age-calculator": {
    Icon: Cake,
    rgb: "74 34 134", // primary, deep
  },
  "word-counter-text-tools": {
    Icon: Type,
    rgb: "98 50 170",
  },
   "link-tools": {
    Icon: QrCode,
    rgb: "111 80 168", // primary, mid — distinct from every other active tool's shade
  },
  "pixly-image-tools": {
    Icon: Images,
    rgb: "98 50 170",
  },
  "unit-converter": {
    Icon: ArrowLeftRight,
    rgb: "160 115 220", // primary, light — distinct from every other active tool's shade
  },
  "business-tools": {
    Icon: FileText,
    rgb: "90 60 150", // primary, muted — distinct from every other active tool's shade
  },
  "clipforge-video-tools": {
    Icon: Clapperboard,
    rgb: "112 69 190",
  },
  "color-palette-generator": {
    Icon: Palette,
    rgb: "99 49 171", // matches Prizm's own accent — #6331ab
  },
  "scanly": {
    Icon: ScanText,
    rgb: "99 49 171", // primary, warm-shifted — distinct from every other active tool's shade
  },
};

const FALLBACK = {
  Icon: Timer,
  rgb: "98 50 170",
};

export const getToolTheme = (slug) => TOOL_THEMES[slug] || FALLBACK;
