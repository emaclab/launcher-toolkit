---
title: Page content examples
description: Edit the starter's news reader, release notes, server status, home highlights, and FAQ using the actual data files and page modules.
sidebar:
  order: 6
---

The starter is one complete example pack. Its seven pages share the application context from `app/main.js`; data schemas belong to the page modules, not to the core. Paths below are relative to `pack/`.

## Home highlights

**Files:** `app/pages/home.js`, `data/slides.json`, `data/news.json`, `data/calendar.json`.

Replace the slide artwork, localized headings, text, and destinations in `slides.json`. Keep each artwork file under `assets/` and resolve its path from the document. The home page combines those slides with recent news and the calendar's featured countdown.

The carousel advances every seven seconds, pausing while hovered, while focus is inside, after 200 pixels of scrolling, or when the player's motion setting is disabled. The scroll offset also controls the artwork fade. Test both automatic and manual changes in Pack Studio; do not replace this with CSS scroll-snap.

## News reader

**Files:** `app/pages/news.js`, `app/settings.js`, `app/markdown.js`, `data/news.json`.

A minimal article follows this shape:

```json
[
  {
    "id": "welcome",
    "date": "2026-10-29",
    "title": {"pt": "Boas-vindas", "en": "Welcome", "es": "Bienvenidos"},
    "body": {"pt": "O jogo está pronto.", "en": "The game is ready.", "es": "El juego está listo."}
  }
]
```

The reader selects articles by ID, folds case and accents for search, and stores read IDs under `read` in `localStorage`. Opening an article marks it read; that state drives the unread badge. Keep article IDs unique and stable rather than using array positions.

The body is [Markdown rendered to nodes](../markdown/), not raw HTML. External links use `launcher.openUrl` and require an allowed host. The same document shape is used by the remote news source in `app/data.js`; a failed fetch keeps the displayed local or cached content.

**Review:** search with accents and mixed case, no matching results, a long article, switching language, read/unread behavior, and a rejected external link.

## Game-client release notes

**Files:** `app/pages/updates.js`, `data/releases.json`, `app/ui.js`.

The page owns its tabs, selected page, release filtering, and note rendering. Edit the existing records in `releases.json`, retaining their field names and localized content. These records describe your game client, not the toolkit or pack format.

`Pagination` receives a bounded page number, total pages, and a callback. The page is responsible for keeping selection valid when the filter or document changes. The Updates page also offers `check` and `repair` only when the session permits them; publication content does not grant launch permissions.

**Review:** each tab, first/last page, a filter with no records, long Markdown, and update actions outside `ready`.

## Server status

**Files:** `app/pages/servers.js`, `app/data.js`, `data/servers.json`.

The document is an object containing `servers`. Each server has a stable string `id` and a `state` of `online`, `maintenance`, or `offline`. Follow the existing file for its display fields and timestamp. This is JSON presentation data; the pack does not probe game ports.

`REMOTE.servers` uses a five-minute cache TTL and refresh interval. A fresh cached document appears immediately; otherwise the local document appears until a valid fetch succeeds. Invalid JSON shape, network denial, and fetch failures keep the current document. The status page shows data age, so a retained document must not be mistaken for a live network check.

**Review:** all three states, missing/invalid timestamp, stale data, offline mode, and a valid remote update. Add the JSON endpoint's host to `network_hosts`, not only `allowed_hosts`.

## About and FAQ

**Files:** `app/pages/about.js`, `data/faq.json`, `pack.json`.

Edit `game.info`, `game.requirements`, and `game.links` for your game's information, minimum/recommended requirements, and website destinations. Edit `faq.json` for questions and Markdown answers. Use the existing localized fields as the schema reference.

FAQ answers render conditionally when expanded so controls inside a closed answer cannot receive Tab focus. Keep external destinations HTTPS and explicitly permitted by `allowed_hosts`.

**Review:** expanding and collapsing answers by keyboard, a long answer, an unknown link host, and each language.

## Calendar and settings

See the dedicated [calendar and countdown](../calendar/) example and [storage and language](../../reference/storage/) reference. Both consume the same application context as the pages above.

## Verify changes

```powershell
launcher-toolkit dev
launcher-toolkit check --json
launcher-toolkit build
```

The headless check exercises document boot and session snapshots, not every page interaction. Inspect content and keyboard behavior in the native preview as well. The core provides no news, FAQ, server, or calendar service; your project owns the documents and any remote endpoints.
