---
title: Storage and language
description: localStorage, launcher.cache, where they live, and how a pack picks its language.
sidebar:
  order: 5
---

The player's data folder is `%LOCALAPPDATA%\<game.name> Launcher\`. A pack has two stores there,
both plain-text files per game.

## localStorage

The standard Web Storage API (`getItem`, `setItem`, `removeItem`, `clear`, `key`, `length`), with
strings only and a 5 MiB quota counted as browsers do (UTF-16 bytes of keys and values). Exceeding
it throws a `DOMException` `QuotaExceededError`.

- Kept in `local-storage.json`, written atomically 1 s after the last change and when the window
  closes.
- Read-only in the splash: writes throw a `TypeError` with code `readOnly`. The splash gets a copy
  as it was when it opened, for example the language chosen in the main window.

## launcher.cache

Strings with a time to live, in `cache.json`, apart from `localStorage`:

```js
launcher.cache.put("remote:news", JSON.stringify(document), { ttl: 3600 });
const text = launcher.cache.get("remote:news");   // null when absent or expired
launcher.cache.delete("remote:news");
```

- `ttl` is required, in seconds, from 1 to 2 592 000 (30 days).
- The quota is 8 MiB, counting key, value, and 64 bytes per entry. When full, `put` throws a
  `RangeError` with code `quotaExceeded`; nothing is evicted.
- Expired entries count as absent and are deleted on load.
- The splash may only `get`.

## Validate what you read

A value may be missing, from an older pack version, or edited by hand. Fall back to your defaults
for anything absent or invalid, so a new pack version never breaks the boot. The starter's
`app/settings.js` does this for every preference.

## Language

The language belongs to the pack. The core exposes the Windows interface languages as
`navigator.language` and `navigator.languages` (`en` when none). The starter's `app/i18n.js`:

1. uses the language saved in `localStorage`, if the pack offers it;
2. else the first of `navigator.languages` that the pack offers;
3. else its default, `pt`;

then loads `i18n/<code>.json` with `launcher.readJson`. To add a language, create the file with the
same keys and add its code to `LANGUAGES`.

## Pack Studio and the check

Pack Studio uses its own `localStorage`, cache, and image cache, apart from any installed launcher;
reloads keep them. `launcher-toolkit check` uses a temporary folder that it deletes afterwards.
