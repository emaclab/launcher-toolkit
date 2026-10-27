---
title: Patterns
description: Where the starter implements each piece of a launcher, to copy or adapt.
sidebar:
  label: Overview
  order: 1
---

A pack writes its whole UI. The starter implements the common pieces in
Preact + htm under `pack/app/`. Copy them, change them, or replace them with your own library.

| Pattern | Starter files | Page |
| --- | --- | --- |
| Phases, progress, and launch actions | `launch-bar.js`, `session.js`, `pages/updates.js` | [Launch bar](launch-bar/) |
| Modal, dropdown, toast, tooltip, lists, tabs, pagination, scroll | `ui.js` | [Components](components/) |
| Local data, remote copies, and cache | `data.js` | [Data](data/) |
| Markdown without HTML | `markdown.js`, `ui.js` (`Markdown`) | [Markdown](markdown/) |
| Settings and language | `settings.js`, `i18n.js`, `pages/settings.js` | [Storage and language](../reference/storage/) |
| Carousel and countdown | `pages/home.js`, `ui.js` (`Countdown`) | [Components](components/#carousel-and-countdown) |
| Calendar | `pages/calendar.js`, `dates.js` | [Calendar and countdown](calendar/) |
| Splash with the anti-cheat mark | `splash.js` | [Splash](../reference/splash/) |
| News, release notes, servers, highlights, FAQ | `pages/`, `data/` | [Page content examples](content/) |

## App structure

`app/main.js` loads everything first, renders once, then reveals the window:

```js
const [game, translations, local] = await Promise.all([
  launcher.readJson("pack.json").then((manifest) => manifest.game),
  loadTranslations(),
  loadLocal(),
]);
render(html`<${App} game=${game} translations=${translations} local=${local} />`, document.getElementById("app"));
launcher.ready();
```

`App` keeps the page, language, settings, dialogs, and toast in Preact state and shares them with
an `AppContext`; each page reads what it needs with `useApp()`. Pages are components in a map, not
documents: switching pages never navigates.

## Rules that apply everywhere

- Render closed menus, panels, and dialogs **conditionally**, so Tab never reaches them.
- Give conditional siblings a stable `key`.
- Put global keyboard and pointer listeners on `window`; native events never reach `document`.
- Catch the bridge rejections you expect by `error.code` and rethrow the rest.
- Check every state in Pack Studio: `check` fails on a JS error in any snapshot.
