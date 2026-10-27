---
title: Starter
description: The single starter project, its files, the first changes to make, and its restricted license.
sidebar:
  order: 4
---

`launcher-toolkit init` creates every project from `launcher-starter.zip` of the same release. The
same project is [`examples/starter/`](https://github.com/emaclab/launcher-toolkit/tree/main/examples/starter)
in this repository.

The starter is a complete launcher for a 1120 × 630 window: Home, News, Updates, Calendar,
Servers, About, and Settings pages, a launch bar, and a splash, in Portuguese, English, and
Spanish. It is written with [Preact](https://preactjs.com/) and [htm](https://github.com/developit/htm),
uses plain CSS, and needs no build step. It declares format `1` and core API `1`.

## Project files

```text
.toolkit-version              toolkit release used by the project and its CI
.github/workflows/pack.yml    checks and builds on Windows
.gitattributes, .gitignore    byte-exact checkouts; ignores dist/ and .tools/
LICENSE                       restricted starter license; retain it
README.md                     project instructions
launcher.d.ts                 types of the launcher bridge, for your editor
examples/                     window polygon sample, outside the pack
pack/
  pack.json, window.json      identity, hosts, windows
  index.html, splash.html     the two entry documents
  app/main.js                 main window: title bar, navigation, pages, dialogs, toast
  app/splash.js               splash, with the anti-cheat mark placeholder
  app/launch-bar.js           phases, progress, and launch actions
  app/session.js              snapshot subscription and requests
  app/pages/                  one module per page
  app/ui.js                   Modal, Dropdown, Toast, tooltip, List, Tabs, Pagination, ScrollArea
  app/data.js                 local data and remote copies with cache
  app/i18n.js, app/settings.js  language and saved preferences
  app/markdown.js, app/dates.js Markdown to Preact nodes; calendar dates
  vendor/preact.js            Preact + htm, with their licenses
  styles/app.css              plain stylesheet
  i18n/                       pt, en, es texts
  data/                       slides, news, releases, calendar, events, servers, faq
  assets/                     icon and images
```

`launcher.d.ts` is generated from the core. Reference it from your modules, for example with
`/// <reference path="../../launcher.d.ts" />`, to get completion and type checks in your editor.

## First changes

1. Keep the game ID and name assigned to your game. The name sets the player's data folder,
   `%LOCALAPPDATA%\<game.name> Launcher\`.
2. Replace `example.com` in `pack.json` (`allowed_hosts`, `network_hosts`, `links`), in `data/`,
   and in the `REMOTE` URLs of `app/data.js`.
3. Replace the images, data, and texts; change colors and layout in `styles/app.css`.
4. Run `launcher-toolkit dev`, then `check` and `build`.

`init` creates a complete project in an empty destination. It never edits an existing project.

## License

The starter is a public download, **not open-source software**. Use is restricted to launcher
packs for games integrated with **EMAC Anti-Cheat**. Keep `LICENSE` and its copyright notice in
every copy or derivative. The included `LICENSE` prevails over this summary; public availability
grants no rights beyond it. Preact, htm, and other third-party material keep their own licenses.
