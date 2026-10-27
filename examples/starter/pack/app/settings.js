// Preferências e notícias lidas ficam no localStorage (strings, 5 MiB por jogo).
// A main lê e grava; o splash somente lê. Valores ausentes ou inválidos usam
// os padrões do pack para preservar o boot.

const SETTINGS_KEY = "settings";
const READ_KEY = "read";

export const ACCENTS = ["blue", "green", "orange", "purple"];
export const DENSITIES = ["comfortable", "compact"];
export const ARTICLE_SIZE = { min: 12, max: 18 };

export const DEFAULTS = Object.freeze({
  accent: "blue",
  density: "comfortable",
  motion: true,
  badges: true,
  launch_details: true,
  article_size: 14,
  screenshots_dir: "",
});

const valid = {
  accent: (value) => ACCENTS.includes(value),
  density: (value) => DENSITIES.includes(value),
  motion: (value) => typeof value === "boolean",
  badges: (value) => typeof value === "boolean",
  launch_details: (value) => typeof value === "boolean",
  article_size: (value) => Number.isInteger(value) && value >= ARTICLE_SIZE.min && value <= ARTICLE_SIZE.max,
  screenshots_dir: (value) => typeof value === "string",
};

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorage ${key}: ${error}`);
  }
}

export function loadSettings() {
  const saved = readJson(SETTINGS_KEY) ?? {};
  const settings = {};
  for (const [name, fallback] of Object.entries(DEFAULTS)) {
    settings[name] = valid[name](saved[name]) ? saved[name] : fallback;
  }
  return settings;
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
}

/** Ids of the news the player opened. */
export function loadRead() {
  const saved = readJson(READ_KEY);
  return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
}

export function saveRead(ids) {
  write(READ_KEY, ids);
}
