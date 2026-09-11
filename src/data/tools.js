/**
 * Central tools registry — same pattern as `src/data/playGames.js`.
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
    slug: "word-counter-text-tools",
    name: "Word Counter & Text Tools",
    category: "Text Tools",
    shortDescription:
      "Free online word counter, character counter, case converter, and text formatter. Count words, characters, sentences, and paragraphs instantly.",
    description:
      "A free online word counter and text tools suite for counting words and characters, converting text case, formatting text, finding and replacing text, generating slugs, checking word frequency, encoding Base64, and more.",
  },
  {
    slug: "gauge-calculators",
    name: "Gauge – BMI, Mortgage & Percentage Calculator",
    category: "Calculator",
    shortDescription:
      "Free online BMI calculator, mortgage payment calculator, and percentage calculator — all in one tool.",
    description:
      "A free online calculator suite for checking your body mass index and healthy weight range, estimating a monthly mortgage payment in any of 158 currencies, and working out percentages three different ways — no download, no sign-up.",
  },
  {
    slug: "unit-converter",
    name: "Measurely – Unit Converter",
    category: "Converter",
    shortDescription:
      "Convert length, weight, temperature, volume, speed, area, data, and time — free online unit converter.",
    description:
      "Convert any unit in one clean move: length, weight, temperature, volume, speed, area, data storage, and time. A free online unit converter with full-precision math and a quick-reference table for common conversions — no download, no sign-up.",
  },
 {
    slug: "business-tools",
    name: "Ledgerly – Invoice Generator & Business Calculators",
    category: "Business",
    shortDescription:
      "Free online invoice generator plus ROI, profit margin, break-even, discount, loan, freelance rate, and startup cost calculators.",
    description:
      "A free online invoice generator with line items, discount and tax, and print/PDF export, alongside profit margin, ROI, break-even, discount and sales tax, business loan, freelance hourly rate, and startup cost calculators — with multi-currency display throughout. No download, no sign-up.",
  },
  {
    slug: "link-tools",
    name: "Linkforge – URL Shortener & QR Code Tools",
    category: "Business",
    shortDescription:
      "Free URL shortener, QR code generator, bulk QR codes, QR scanner, UTM campaign builder, URL encoder/decoder, and URL parser.",
    description:
      "A free browser-based link toolkit: shorten URLs with local click tracking, generate QR codes for links, text, email, phone, SMS, Wi-Fi, and contact cards, batch-generate QR codes with a ZIP download, scan QR codes from an image or camera, build UTM campaign links, and encode, decode, or inspect any URL. No download, no sign-up.",
  },
  {
    slug: "color-palette-generator",
    name: "Prizm – Color Palette Studio",
    category: "Design",
    shortDescription:
      "Free color picker, harmony generator, image color extraction, WCAG contrast checker, and Tailwind-style shade ramps.",
    description:
      "A free browser-based color palette studio: a precision picker synced across HEX, RGB, and HSL, a six-type harmony generator, image color extraction via in-browser clustering, a WCAG contrast checker, Tailwind-style 50–950 shade ramps, and palette saving, export, and link-based sharing. No download, no sign-up.",
  },
  
  {
    slug: "pixly-image-tools",
    name: "Pixly Image Tools",
    category: "Image Tools",
    shortDescription:
      "Compress, resize, convert, crop, rotate and create favicons from images privately in your browser.",
    description:
      "Free online image tools for compressing, resizing, converting, cropping, rotating and flipping images, plus generating favicon sets. Browser-based, private and no sign-up required.",
  },
  {
    slug: "scanly",
    name: "Scanly – Image to Text (OCR) & Business Scanning Tools",
    category: "Business",
    shortDescription:
      "Free image-to-text OCR, business card scanner, receipt scanner, PDF text extractor, QR code reader, and image-to-PDF converter.",
    description:
      "A free browser-based OCR and scanning toolkit: extract text from any image in 12 languages, scan business cards into editable fields with vCard export, scan receipts for vendor/date/total, pull embedded text from PDFs, decode QR codes, and combine images into a PDF. No download, no sign-up.",
  },
   {
    slug: "clipforge-video-tools",
    name: "ClipForge – Free Online Video Tools",
    category: "Video Tools",
    shortDescription:
      "Play, inspect, compress, convert, crop, resize, rotate and enhance videos, or extract audio in your browser.",
    description:
      "A free browser-based video toolkit with a player, metadata viewer, compressor, format converter, FPS changer, cropper, quality enhancer, audio extractor, resizer and rotator. No uploads or sign-up required.",
  },

  
];

/** O(1) lookup by slug. */
export const TOOLS_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export const getTool = (slug) => TOOLS_BY_SLUG[slug] || null;
export const getToolSlugs = () => TOOLS.map((t) => t.slug);
