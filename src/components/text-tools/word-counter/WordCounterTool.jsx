"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Shared styles — reuses the same tokens as EpochConverterTool.jsx    */
/* ------------------------------------------------------------------ */
const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-ring";
const textareaClass =
  "w-full min-h-[160px] resize-y rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm leading-relaxed text-fg placeholder:text-muted focus-ring";
const outputClass =
  "w-full min-h-[160px] resize-y rounded-lg border border-border bg-surface/60 px-3 py-2.5 font-mono text-sm leading-relaxed text-fg focus-ring";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";
const checkClass = "flex items-center gap-2 text-sm text-muted";

const TABS = [
  { key: "case", label: "Case Converter" },
  { key: "format", label: "Text Formatter" },
  { key: "replace", label: "Find & Replace" },
  { key: "reverse", label: "Reverse Text" },
  { key: "slug", label: "Slug Generator" },
  { key: "lorem", label: "Lorem Ipsum" },
  { key: "freq", label: "Word Frequency" },
  { key: "base64", label: "Base64 Encode/Decode" },
  { key: "palindrome", label: "Palindrome Checker" },
];

/* ------------------------------------------------------------------ */
/* Pure helpers — ported 1:1 from the standalone Wordbench prototype  */
/* ------------------------------------------------------------------ */
function wordCount(text) {
  const t = text.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
}
function sentenceCount(text) {
  const t = text.trim();
  if (t === "") return 0;
  const matches = t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  return matches ? matches.filter((s) => s.trim().length > 0).length : 0;
}
function paragraphCount(text) {
  const t = text.trim();
  if (t === "") return 0;
  const parts = t.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return parts.length || 1;
}
function formatSeconds(totalSeconds) {
  if (totalSeconds < 60) return `${Math.max(0, Math.round(totalSeconds))}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${s}s`;
}
function toTitleCase(s) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
}
function toSentenceCase(s) {
  const lower = s.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
}
function toAlternating(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) out += i % 2 === 0 ? s[i].toLowerCase() : s[i].toUpperCase();
  return out;
}
function toCamel(s) {
  const words = s.trim().toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
  return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join("");
}
function toSnake(s) {
  return s.trim().toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean).join("_");
}
function toKebab(s) {
  return s.trim().toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean).join("-");
}
function makeSlug(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut",
  "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor",
  "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa",
  "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];
function randomSentence(minW, maxW) {
  const len = minW + Math.floor(Math.random() * (maxW - minW));
  const words = [];
  for (let i = 0; i < len; i++) words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  const s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}
function randomParagraph() {
  const sentences = 3 + Math.floor(Math.random() * 3);
  const out = [];
  for (let i = 0; i < sentences; i++) out.push(randomSentence(6, 14));
  return out.join(" ");
}

/* ------------------------------------------------------------------ */
/* Small shared UI bits                                                */
/* ------------------------------------------------------------------ */
function CopyButton({ label = "Copy result", copyKey, activeKey, onCopy, value }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onCopy(copyKey, value)}>
        {label}
      </Button>
      <span
        className={`text-xs font-semibold text-accent-soft transition-opacity ${
          activeKey === copyKey ? "opacity-100" : "opacity-0"
        }`}
      >
        Copied.
      </span>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl bg-fg px-3 py-2.5 text-surface">
      <span className="block font-mono text-lg font-bold leading-tight sm:text-xl">{value}</span>
      <span className="text-[11px] text-accent-soft">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function WordCounterTool() {
  const [activeTab, setActiveTab] = useState("case");
  const [copiedKey, setCopiedKey] = useState("");

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

  /* ---- Hero counter ---- */
  const [heroText, setHeroText] = useState("");
  const words = wordCount(heroText);

  /* ---- Case converter ---- */
  const [caseInput, setCaseInput] = useState("");
  const [caseOutput, setCaseOutput] = useState("");
  function runCase(mode) {
    const text = caseInput;
    let result = text;
    if (mode === "upper") result = text.toUpperCase();
    else if (mode === "lower") result = text.toLowerCase();
    else if (mode === "title") result = toTitleCase(text);
    else if (mode === "sentence") result = toSentenceCase(text);
    else if (mode === "alt") result = toAlternating(text);
    else if (mode === "camel") result = toCamel(text);
    else if (mode === "snake") result = toSnake(text);
    else if (mode === "kebab") result = toKebab(text);
    setCaseOutput(result);
  }

  /* ---- Text formatter ---- */
  const [formatInput, setFormatInput] = useState("");
  const [formatOutput, setFormatOutput] = useState("");
  function runFormat(mode) {
    const text = formatInput;
    const lines = text.split("\n");
    let result = text;
    if (mode === "trim") result = lines.map((l) => l.trim()).join("\n");
    else if (mode === "collapseSpaces") result = text.replace(/[ \t]+/g, " ");
    else if (mode === "removeBlank") result = lines.filter((l) => l.trim() !== "").join("\n");
    else if (mode === "removeDupes") {
      const seen = {};
      const out = [];
      lines.forEach((l) => {
        const key = l.trim();
        if (!seen[key]) {
          seen[key] = true;
          out.push(l);
        }
      });
      result = out.join("\n");
    } else if (mode === "sortAZ") result = [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
    else if (mode === "sortZA") result = [...lines].sort((a, b) => b.localeCompare(a)).join("\n");
    else if (mode === "sortLength") result = [...lines].sort((a, b) => a.length - b.length).join("\n");
    setFormatOutput(result);
  }

  /* ---- Find & replace ---- */
  const [replaceInput, setReplaceInput] = useState("");
  const [findWord, setFindWord] = useState("");
  const [replaceWord, setReplaceWord] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [replaceOutput, setReplaceOutput] = useState("");
  function runReplace() {
    if (!findWord) {
      setReplaceOutput(replaceInput);
      return;
    }
    const escaped = findWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
    const flags = "g" + (caseSensitive ? "" : "i");
    try {
      const re = new RegExp(pattern, flags);
      setReplaceOutput(replaceInput.replace(re, replaceWord));
    } catch {
      setReplaceOutput(replaceInput);
    }
  }

  /* ---- Reverse text ---- */
  const [reverseInput, setReverseInput] = useState("");
  const [reverseOutput, setReverseOutput] = useState("");
  function runReverse(mode) {
    const text = reverseInput;
    let result = text;
    if (mode === "chars") result = text.split("").reverse().join("");
    else if (mode === "words") result = text.trim().split(/\s+/).reverse().join(" ");
    else if (mode === "lines") result = text.split("\n").reverse().join("\n");
    setReverseOutput(result);
  }

  /* ---- Slug generator ---- */
  const [slugInput, setSlugInput] = useState("");

  /* ---- Lorem ipsum ---- */
  const [loremCount, setLoremCount] = useState(3);
  const [loremOutput, setLoremOutput] = useState("");
  function runLorem() {
    const count = Math.min(Math.max(parseInt(loremCount, 10) || 1, 1), 20);
    const paras = [];
    for (let i = 0; i < count; i++) paras.push(randomParagraph());
    setLoremOutput(paras.join("\n\n"));
  }

  /* ---- Word frequency ---- */
  const [freqInput, setFreqInput] = useState("");
  const [freqResults, setFreqResults] = useState([]);
  function runFreq() {
    const text = freqInput.toLowerCase();
    const wordsList = text.match(/[a-z0-9']+/g) || [];
    const counts = {};
    wordsList.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
    const entries = Object.keys(counts)
      .map((w) => [w, counts[w]])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
    setFreqResults(entries);
  }
  const freqMax = freqResults[0]?.[1] || 1;

  /* ---- Base64 ---- */
  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  function runBase64(mode) {
    try {
      if (mode === "encode") setBase64Output(btoa(unescape(encodeURIComponent(base64Input))));
      else setBase64Output(decodeURIComponent(escape(atob(base64Input.trim()))));
    } catch {
      setBase64Output(mode === "encode" ? "Could not encode this text." : "That doesn't look like valid Base64.");
    }
  }

  /* ---- Palindrome ---- */
  const [palindromeInput, setPalindromeInput] = useState("");
  const cleanedPalindrome = palindromeInput.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isPalindrome = cleanedPalindrome.length > 0 && cleanedPalindrome === [...cleanedPalindrome].reverse().join("");

  return (
    <div>
      {/* ---- Hero: word & character counter ---- */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <label className={labelClass} htmlFor="heroText">
          Paste or type your text
        </label>
        <textarea
          id="heroText"
          className={textareaClass}
          placeholder="Start typing, or paste a paragraph, an essay, an email — anything. Your counts update as you go."
          value={heroText}
          onChange={(e) => setHeroText(e.target.value)}
        />
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat value={words} label="Words" />
          <Stat value={heroText.length} label="Characters" />
          <Stat value={heroText.replace(/\s/g, "").length} label="No spaces" />
          <Stat value={sentenceCount(heroText)} label="Sentences" />
          <Stat value={paragraphCount(heroText)} label="Paragraphs" />
          <Stat value={formatSeconds((words / 200) * 60)} label="Reading time" />
          <Stat value={formatSeconds((words / 130) * 60)} label="Speaking time" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setHeroText("")}>
            Clear text
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => copy("hero", heroText)}>
            Copy text
          </Button>
          <span
            className={`text-xs font-semibold text-accent-soft transition-opacity ${
              copiedKey === "hero" ? "opacity-100" : "opacity-0"
            }`}
          >
            Copied.
          </span>
        </div>
      </section>

      {/* ---- Tool tabs ---- */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold focus-ring ${
              activeTab === tab.key
                ? "border-fg bg-fg text-surface"
                : "border-border bg-surface text-muted hover:text-fg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        {/* Case Converter */}
        {activeTab === "case" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Case Converter</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Switch between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and more.
            </p>
            <label className={`${labelClass} mt-4`}>Your text</label>
            <textarea
              className={textareaClass}
              placeholder="Type or paste text to convert…"
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["upper", "UPPERCASE"],
                ["lower", "lowercase"],
                ["title", "Title Case"],
                ["sentence", "Sentence case"],
                ["alt", "aLtErNaTiNg"],
                ["camel", "camelCase"],
                ["snake", "snake_case"],
                ["kebab", "kebab-case"],
              ].map(([mode, label]) => (
                <Button key={mode} type="button" size="sm" onClick={() => runCase(mode)}>
                  {label}
                </Button>
              ))}
            </div>
            <label className={`${labelClass} mt-5`}>Result</label>
            <textarea className={outputClass} readOnly value={caseOutput} />
            <CopyButton copyKey="case" activeKey={copiedKey} onCopy={copy} value={caseOutput} />
          </div>
        )}

        {/* Text Formatter */}
        {activeTab === "format" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Text Formatter</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Trim stray spaces, collapse blank lines, drop duplicates, or sort your lines.
            </p>
            <label className={`${labelClass} mt-4`}>Your text</label>
            <textarea
              className={textareaClass}
              placeholder="Paste messy text — extra spaces, blank lines, repeated lines…"
              value={formatInput}
              onChange={(e) => setFormatInput(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["trim", "Trim each line"],
                ["collapseSpaces", "Collapse spaces"],
                ["removeBlank", "Remove blank lines"],
                ["removeDupes", "Remove duplicate lines"],
                ["sortAZ", "Sort A → Z"],
                ["sortZA", "Sort Z → A"],
                ["sortLength", "Sort by length"],
              ].map(([mode, label]) => (
                <Button key={mode} type="button" size="sm" onClick={() => runFormat(mode)}>
                  {label}
                </Button>
              ))}
            </div>
            <label className={`${labelClass} mt-5`}>Result</label>
            <textarea className={outputClass} readOnly value={formatOutput} />
            <CopyButton copyKey="format" activeKey={copiedKey} onCopy={copy} value={formatOutput} />
          </div>
        )}

        {/* Find & Replace */}
        {activeTab === "replace" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Find &amp; Replace</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Swap every occurrence of one word or phrase for another.</p>
            <label className={`${labelClass} mt-4`}>Your text</label>
            <textarea
              className={textareaClass}
              placeholder="Paste the text you want to edit…"
              value={replaceInput}
              onChange={(e) => setReplaceInput(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                className={fieldClass}
                type="text"
                placeholder="Find, e.g. teh"
                value={findWord}
                onChange={(e) => setFindWord(e.target.value)}
              />
              <input
                className={fieldClass}
                type="text"
                placeholder="Replace with, e.g. the"
                value={replaceWord}
                onChange={(e) => setReplaceWord(e.target.value)}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <label className={checkClass}>
                <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
                Case-sensitive
              </label>
              <label className={checkClass}>
                <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
                Whole word only
              </label>
            </div>
            <div className="mt-3">
              <Button type="button" size="sm" onClick={runReplace}>
                Replace all
              </Button>
            </div>
            <label className={`${labelClass} mt-5`}>Result</label>
            <textarea className={outputClass} readOnly value={replaceOutput} />
            <CopyButton copyKey="replace" activeKey={copiedKey} onCopy={copy} value={replaceOutput} />
          </div>
        )}

        {/* Reverse Text */}
        {activeTab === "reverse" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Reverse Text</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Flip your text by character, by word, or by line.</p>
            <label className={`${labelClass} mt-4`}>Your text</label>
            <textarea
              className={textareaClass}
              placeholder="Type or paste text to reverse…"
              value={reverseInput}
              onChange={(e) => setReverseInput(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => runReverse("chars")}>Reverse characters</Button>
              <Button type="button" size="sm" onClick={() => runReverse("words")}>Reverse word order</Button>
              <Button type="button" size="sm" onClick={() => runReverse("lines")}>Reverse line order</Button>
            </div>
            <label className={`${labelClass} mt-5`}>Result</label>
            <textarea className={outputClass} readOnly value={reverseOutput} />
            <CopyButton copyKey="reverse" activeKey={copiedKey} onCopy={copy} value={reverseOutput} />
          </div>
        )}

        {/* Slug Generator */}
        {activeTab === "slug" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Slug Generator</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Turn a title into a clean, URL-safe slug — updates as you type.
            </p>
            <label className={`${labelClass} mt-4`}>Title or text</label>
            <textarea
              className={`${textareaClass} min-h-[80px]`}
              placeholder="e.g. 10 Tips for Better Blog Titles!"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
            />
            <label className={`${labelClass} mt-5`}>Slug</label>
            <textarea className={`${outputClass} min-h-[60px]`} readOnly value={makeSlug(slugInput)} />
            <CopyButton label="Copy slug" copyKey="slug" activeKey={copiedKey} onCopy={copy} value={makeSlug(slugInput)} />
          </div>
        )}

        {/* Lorem Ipsum */}
        {activeTab === "lorem" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Lorem Ipsum Generator</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Generate placeholder paragraphs for mockups and layouts.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-muted" htmlFor="loremCount">Paragraphs</label>
              <input
                id="loremCount"
                className={`${fieldClass} max-w-[90px] flex-none`}
                type="number"
                min={1}
                max={20}
                value={loremCount}
                onChange={(e) => setLoremCount(e.target.value)}
              />
              <Button type="button" size="sm" onClick={runLorem}>Generate</Button>
            </div>
            <label className={`${labelClass} mt-5`}>Result</label>
            <textarea className={`${outputClass} min-h-[220px]`} readOnly value={loremOutput} />
            <CopyButton copyKey="lorem" activeKey={copiedKey} onCopy={copy} value={loremOutput} />
          </div>
        )}

        {/* Word Frequency */}
        {activeTab === "freq" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Word Frequency Counter</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              See which words show up most — handy for spotting overused words before you publish.
            </p>
            <label className={`${labelClass} mt-4`}>Your text</label>
            <textarea
              className={textareaClass}
              placeholder="Paste an article, essay, or script…"
              value={freqInput}
              onChange={(e) => setFreqInput(e.target.value)}
            />
            <div className="mt-3">
              <Button type="button" size="sm" onClick={runFreq}>Analyze</Button>
            </div>
            {freqResults.length > 0 && (
              <table className="mt-4 w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-border px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Word</th>
                    <th className="border-b border-border px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Frequency</th>
                    <th className="border-b border-border px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {freqResults.map(([word, count]) => (
                    <tr key={word}>
                      <td className="border-b border-border px-2 py-1.5 text-fg">{word}</td>
                      <td className="w-[45%] border-b border-border px-2 py-1.5">
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                          <div
                            className="h-full rounded-full bg-fg"
                            style={{ width: `${Math.round((count / freqMax) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="border-b border-border px-2 py-1.5 text-fg">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Base64 */}
        {activeTab === "base64" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Base64 Encode / Decode</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Encode text to Base64, or decode a Base64 string back to text.</p>
            <label className={`${labelClass} mt-4`}>Input</label>
            <textarea
              className={textareaClass}
              placeholder="Type text to encode, or a Base64 string to decode…"
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => runBase64("encode")}>Encode</Button>
              <Button type="button" size="sm" onClick={() => runBase64("decode")}>Decode</Button>
            </div>
            <label className={`${labelClass} mt-5`}>Result</label>
            <textarea className={outputClass} readOnly value={base64Output} />
            <CopyButton copyKey="base64" activeKey={copiedKey} onCopy={copy} value={base64Output} />
          </div>
        )}

        {/* Palindrome Checker */}
        {activeTab === "palindrome" && (
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Palindrome Checker</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Check whether a word or phrase reads the same backwards, ignoring spaces, punctuation, and case.
            </p>
            <label className={`${labelClass} mt-4`} htmlFor="palindromeInput">Word or phrase</label>
            <input
              id="palindromeInput"
              className={fieldClass}
              type="text"
              placeholder="e.g. A man, a plan, a canal, Panama"
              value={palindromeInput}
              onChange={(e) => setPalindromeInput(e.target.value)}
            />
            {palindromeInput.trim() !== "" && (
              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                  isPalindrome
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                {isPalindrome ? "Yes — that's a palindrome." : "No — not a palindrome."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
