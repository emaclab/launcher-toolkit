---
title: Data
description: Show local data at once, replace it with validated remote copies, and cache them with a TTL.
sidebar:
  order: 4
---

The core knows nothing about news, calendars, or servers: the pack decides where data comes from,
when it refreshes, what it caches, and what a valid document is. The starter's `app/data.js`:

1. reads every `data/*.json` file with `launcher.readJson` before the first render;
2. for each remote source, shows a cached copy that is still fresh, else the local file;
3. fetches the remote document with `launcher.fetchJson`, validates it, caches it, and swaps it in;
4. keeps what is shown when the fetch fails, the document is invalid, or the network is denied.

## Sources

```js
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
```

Each remote document has the schema of the local file with the same name. List every host in
`pack.json` `network_hosts`; `fetchJson` rejects anything else with `notAllowed`.

## Fetch, validate, cache

```js
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
```

Every `fetchJson` failure has an `error.code` (`notAllowed`, `networkDenied`, `timeout`, `status`,
`tooLarge`, `invalidJson`, `network`), so the function treats them all as "no update" and rethrows
only programming errors. The headless check denies the network: a pack that lets that rejection
escape fails `check`.

## Limits

`fetchJson` accepts HTTPS only, a body up to 2 MiB, 4 requests at a time, no redirects, and answers
within 10 s. A cache entry lives 1 s to 30 days, and the cache holds 8 MiB. Use **Offline** in Pack
Studio to see how your UI behaves without network.

## Remote images

Images do not need `fetchJson`: set `<img src>` to an `https://` URL. The core downloads and caches
them; change the URL to change the image. See [remote images](../../reference/documents/#remote-images).
