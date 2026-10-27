// The pack's data: local files in data/, read with launcher.readJson, and remote copies of
// news, calendar and servers. A remote document is fetched with launcher.fetchJson (HTTPS, host
// in pack.json network_hosts) and kept in launcher.cache with a TTL. A cached copy that is still
// fresh is shown at once; without one the local file is shown until a fetch succeeds. A failed
// fetch, an invalid document or a denied network (the headless check) keeps what is shown.
import { useEffect, useState } from "../vendor/preact.js";

const LOCAL = ["slides", "news", "releases", "calendar", "events", "servers", "faq"];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" || isObject(value);
const isDay = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Remote sources. Replace the URLs with your own, and list their hosts in network_hosts. Each
 * document has the schema of the local file with the same name. */
export const REMOTE = {
  news: {
    url: "https://example.com/launcher/news.json",
    ttl: 3600,
    valid: (value) =>
      Array.isArray(value) &&
      value.every(
        (item) => isObject(item) && typeof item.id === "string" && isDay(item.date) && isText(item.title) && isText(item.body),
      ),
  },
  calendar: {
    url: "https://example.com/launcher/calendar.json",
    ttl: 3600,
    valid: (value) =>
      isObject(value) &&
      Array.isArray(value.events) &&
      value.events.every(
        (event) => isObject(event) && typeof event.id === "string" && isDay(event.start) && isDay(event.end) && event.start <= event.end,
      ) &&
      (value.countdown == null || (isObject(value.countdown) && !Number.isNaN(Date.parse(value.countdown.begins)))),
  },
  servers: {
    url: "https://example.com/launcher/servers.json",
    ttl: 300,
    // The status page refetches while the window is open.
    refresh: 300_000,
    valid: (value) =>
      isObject(value) &&
      Array.isArray(value.servers) &&
      value.servers.every((server) => isObject(server) && typeof server.id === "string" && ["online", "maintenance", "offline"].includes(server.state)),
  },
};

export async function loadLocal() {
  const files = await Promise.all(LOCAL.map((name) => launcher.readJson(`data/${name}.json`)));
  return Object.fromEntries(LOCAL.map((name, index) => [name, files[index]]));
}

const cacheKey = (name) => `remote:${name}`;

/** The cached copy of a remote document, when present, unexpired and valid. */
function cached(name) {
  const text = launcher.cache.get(cacheKey(name));
  if (text === null) return null;
  try {
    const value = JSON.parse(text);
    return REMOTE[name].valid(value) ? value : null;
  } catch {
    return null;
  }
}

/** The remote document, or null when the fetch fails (`error.code`: notAllowed, networkDenied,
 * timeout, status, tooLarge, invalidJson or network) or the document is invalid. */
async function fetchRemote(name) {
  const source = REMOTE[name];
  let value;
  try {
    value = await launcher.fetchJson(source.url);
  } catch (error) {
    if (error?.code === undefined) throw error;
    return null;
  }
  if (!source.valid(value)) return null;
  try {
    launcher.cache.put(cacheKey(name), JSON.stringify(value), { ttl: source.ttl });
  } catch (error) {
    // A full cache (8 MiB, nothing is evicted) keeps no copy; the value is still shown.
    if (error?.code !== "quotaExceeded") throw error;
  }
  return value;
}

/** The data documents: the cached remote copies that are still fresh, else the local files,
 * replaced by the remote copies as fetches succeed. */
export function useData(local) {
  const [data, setData] = useState(() => {
    const fresh = { ...local };
    for (const name of Object.keys(REMOTE)) fresh[name] = cached(name) ?? fresh[name];
    return fresh;
  });
  useEffect(() => {
    let live = true;
    const update = (name) =>
      fetchRemote(name).then((value) => {
        if (live && value) setData((current) => ({ ...current, [name]: value }));
      });
    const timers = [];
    for (const [name, source] of Object.entries(REMOTE)) {
      if (data[name] === local[name]) update(name);
      if (source.refresh) timers.push(setInterval(() => update(name), source.refresh));
    }
    return () => {
      live = false;
      timers.forEach(clearInterval);
    };
  }, []);
  return data;
}
