// Languages, translations and formatting. The pack owns them: each i18n/<code>.json holds the
// strings, month and weekday names, date formats and the decimal separator of one language.
// The choice is the saved one, else the first Windows UI language the pack offers
// (navigator.languages), else DEFAULT_LANGUAGE.

export const LANGUAGES = ["pt", "en", "es"];
export const DEFAULT_LANGUAGE = "pt";
const LANGUAGE_KEY = "language";

export function chooseLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (LANGUAGES.includes(saved)) return saved;
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const base = String(tag ?? "").split("-")[0].toLowerCase();
    if (LANGUAGES.includes(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

/** Main window only: the splash reads localStorage but cannot write it. */
export function saveLanguage(code) {
  localStorage.setItem(LANGUAGE_KEY, code);
}

/** Every language file, by code. */
export async function loadTranslations() {
  const files = await Promise.all(LANGUAGES.map((code) => launcher.readJson(`i18n/${code}.json`)));
  return Object.fromEntries(LANGUAGES.map((code, index) => [code, files[index]]));
}

/** NFKD, lowercase, accents removed and whitespace runs collapsed: search ignores case and
 * accents ("Notícias" finds "noticias"). */
export function fold(text) {
  let folded = String(text ?? "");
  try {
    folded = folded.normalize("NFKD");
  } catch {
    // Without Unicode normalization the accents stay; case and spaces still fold.
  }
  return folded
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];

/** Bytes in steps of 1024, as Windows Explorer names them: "1.5 GB". */
export function formatBytes(n, decimals, separator) {
  let unit = 0;
  let value = n;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const render = (value, unit) => value.toFixed(unit === 0 ? 0 : decimals);
  let text = render(value, unit);
  // Rounding can reach 1024 of the unit (1023.96 KB → "1024.0"): use the next unit instead.
  if (unit < BYTE_UNITS.length - 1 && Number(text) >= 1024) {
    value /= 1024;
    unit += 1;
    text = render(value, unit);
  }
  return `${text.replace(".", separator)} ${BYTE_UNITS[unit]}`;
}

/** Whole hours, minutes and seconds of a number of seconds. */
export function splitDuration(total) {
  const seconds = Math.max(0, Math.floor(total));
  return { hours: Math.floor(seconds / 3600), minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}

const pad = (n) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` or `YYYY-MM` formatted with the strftime subset of the date formats:
 * %Y, %m, %d, %-d, %B and %b. */
function formatDay(text, format, file) {
  const [year, month = 1, day = 1] = String(text).split("-").map(Number);
  if (!year || month < 1 || month > 12) return String(text);
  return format.replace(/%(-?)([YmdBb%])/g, (_, bare, code) => {
    switch (code) {
      case "Y":
        return String(year);
      case "m":
        return bare ? String(month) : pad(month);
      case "d":
        return bare ? String(day) : pad(day);
      case "B":
        return file.months[month - 1];
      case "b":
        return file.months_short[month - 1];
      default:
        return "%";
    }
  });
}

/** The translation helpers of one language, with DEFAULT_LANGUAGE as the fallback. */
export function makeI18n(files, lang) {
  const file = files[lang] ?? files[DEFAULT_LANGUAGE];
  const fallback = files[DEFAULT_LANGUAGE];
  const separator = file.decimal_separator ?? ".";
  return {
    lang,
    languages: LANGUAGES.map((code) => ({ code, name: files[code].language_name })),
    weekdays: file.weekdays_short,
    /** A UI string; the key itself when no file has it. */
    t: (key) => file.strings[key] ?? fallback.strings[key] ?? key,
    /** A data value that is a string or an object of translations ({"pt": …, "en": …}). */
    loc: (value) => {
      if (value == null) return "";
      if (typeof value !== "object") return String(value);
      return value[lang] ?? value[DEFAULT_LANGUAGE] ?? Object.values(value)[0] ?? "";
    },
    /** A date in the "short", "long" or "month_year" format of the language. */
    date: (text, style) => formatDay(text, file.date_formats[style] ?? fallback.date_formats[style], file),
    bytes: (n, decimals = 1) => (n == null ? "" : formatBytes(n, decimals, separator)),
  };
}
