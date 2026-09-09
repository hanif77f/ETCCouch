/**
 * Central time & date tools registry — same pattern as `src/data/playGames.js`.
 * To add a new tool: add one entry here and a matching entry in
 * `src/data/toolThemes.js` for its icon/accent.
 */
export const TOOLS = [
  {
    slug: "epoch-timestamp-converter",
    name: "Epoch & Timestamp Converter",
    category: "Converter",
    shortDescription:
      "Convert Unix epoch time to human-readable dates and back — free online timestamp converter.",
    description:
      "Convert Unix epoch/timestamp values to human-readable dates and back, in any timezone. A free online epoch & timestamp converter for developers — no download, no sign-up.",
  },
  {
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    category: "Calculator",
    shortDescription:
      "Find the exact days, weeks or months between two dates — free online date difference calculator.",
    description:
      "Calculate the exact number of days, weeks, months or years between two dates. A free online date difference calculator for deadlines, anniversaries and planning — no download, no sign-up.",
  },
  {
    slug: "timezone-converter",
    name: "Timezone Converter",
    category: "Converter",
    shortDescription:
      "Convert a time between cities and timezones instantly — free online timezone converter.",
    description:
      "Convert a time between cities and timezones instantly, DST included. A free online timezone converter for scheduling calls and meetings across the world — no download, no sign-up.",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    category: "Calculator",
    shortDescription:
      "Calculate exact age in years, months and days from a birth date — free online age calculator.",
    description:
      "Calculate exact age in years, months and days from any birth date. A free online age calculator you can use straight from the browser — no download, no sign-up.",
  },
];

/** O(1) lookup by slug. */
export const TOOLS_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export const getTool = (slug) => TOOLS_BY_SLUG[slug] || null;
export const getToolSlugs = () => TOOLS.map((t) => t.slug);

