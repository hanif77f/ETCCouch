import { Timer, CalendarRange, Globe, Cake } from "lucide-react";

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
};

const FALLBACK = {
  Icon: Timer,
  rgb: "98 50 170",
};

export const getToolTheme = (slug) => TOOL_THEMES[slug] || FALLBACK;

