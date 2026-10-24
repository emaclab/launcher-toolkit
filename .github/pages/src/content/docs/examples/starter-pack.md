---
title: Starter pack
description: The single runnable starter with every widget, seven pages, and three languages.
sidebar:
  order: 1
---

`examples/starter/` is the complete starter project for toolkit `v0.3.0`. It demonstrates every
available widget, with Home, News, Updates, Calendar, Servers, About, and Settings pages in
Portuguese, English, and Spanish. This is the same project distributed as `launcher-starter.zip`
and used by `launcher-toolkit init`; there is no minimal variant or template selection.

Source: [github.com/emaclab/launcher-toolkit/tree/main/examples/starter](https://github.com/emaclab/launcher-toolkit/tree/main/examples/starter)

The example retains the [restricted starter license](https://github.com/emaclab/launcher-toolkit/blob/main/examples/starter/LICENSE).
Use it only for games integrated with EMAC Anti-Cheat.

## Run it

Install the toolkit version named in `.toolkit-version` from the matching
[toolkit release](../../getting-started/release-tools/).

```powershell
git clone https://github.com/emaclab/launcher-toolkit.git
Set-Location launcher-toolkit
launcher-toolkit check examples/starter
launcher-toolkit dev examples/starter
launcher-toolkit build examples/starter --out "$env:TEMP\starter-pack.zip"
```

`check` runs every Studio check. `build` repeats those checks before writing a deterministic ZIP,
prints a JSON report, and produces no output when validation fails. Plain CSS needs no preprocessor.
The project's `.gitattributes` preserves file bytes in Git so line-ending conversion cannot change
the built pack.

To create a customized project instead of copying the example:

```powershell
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

## Project files

| Path | Content |
| --- | --- |
| `.toolkit-version` | Toolkit release required by project commands and CI |
| `.github/workflows/pack.yml` | Verified toolkit download and Windows check/build |
| `LICENSE`, `.gitattributes`, `.gitignore` | Restricted license and project Git settings |
| `pack/pack.json` | Game identity, pages, languages, data documents, and declared state |
| `pack/window.json` | 1120 × 630 main window, splash, titles, and icon |
| `pack/templates/` | Layout, launch bar, dialogs, splash, and seven pages |
| `pack/styles/app.css` | Ready-to-use plain CSS |
| `pack/i18n/` | Portuguese, English, and Spanish interface translations |
| `pack/data/` | Slides, news, releases, calendar, events, servers, and FAQ |
| `pack/assets/` | Icon and local images |
| `examples/` | Feed, matching window polygon/CSS, and preferences outside the runtime pack |

## Every widget

| Widget | Working example |
| --- | --- |
| [`carousel`](../../widgets/carousel/) | Home highlights, automatic advancement, pause, and slide selection |
| [`scroll`](../../widgets/scroll/) | Home snapping and About scrolling |
| [`countdown`](../../widgets/countdown/) | Home event clock, calendar, and server freshness |
| [`list`](../../widgets/list/) | News, release rows, calendar grid, events, and FAQ |
| [`pagination`](../../widgets/pagination/) | Updates release history |
| [`tabs`](../../widgets/tabs/) | Updates client/server notes |
| [`markdown`](../../widgets/markdown/) | News, release notes, FAQ answers, and event descriptions |
| [`dropdown`](../../widgets/dropdown/) | Language menu and settings selectors |
| [`modal`](../../widgets/modal/) | Event details, settings reset, and blocked-program confirmation |
| [`tooltip`](../../widgets/tooltip/) | Anti-cheat status and folder preference help |
| [`toast`](../../widgets/toast/) | Core error messages, timeout, and Escape dismissal |
| [`anticheat-mark`](../../widgets/anticheat-mark/) | Required splash placeholder painted by the core |

New widgets must be demonstrated in this starter as well. The toolkit's
`starter_renders_every_available_widget` test compares the public widget catalog with the rendered
pages and splash, including the modal and toast states.

## Try the preview

- Visit every page and switch between all three languages.
- On Home, change slides and scroll to the details; the carousel pauses when it scrolls away.
- Search News and select an article; read marks persist and the navigation badge updates.
- On Updates, page through releases and switch between client/server notes.
- On Calendar, change the month, select a day, and open an event dialog.
- On About, expand FAQ answers and return to the top.
- In Settings, change accent, density, motion, article size, and the stored screenshot folder;
  confirm a reset to restore the defaults.
- In the panel, simulate blocked files, failed checks, launch failures, anti-cheat errors, and a
  `linkFailed` toast. Open the splash and inspect the required anti-cheat mark.

The launch bar implements core API `3`: all eight phases, `launcher.check_failed`,
`launcher.blocked.processes`, `anticheat.message`, and state-appropriate recovery actions.
**Play** requires both launcher and anti-cheat to be `ready`; closing blocking programs requires
confirmation. See [launcher actions](../../reference/actions/#launcher-actions).

## Adapt it

Keep the complete project in each branch. Replace the assigned game identity, example domains,
content, icon, images, and text; edit the CSS, then run `check` and `build`. Keep every referenced
file, translation, license notice, and the project pin. Existing projects are not automatically
replaced when the starter changes.

In the preview, updates, game launch, and anti-cheat status are **simulated**; no game client is
downloaded, installed, or started. See [Start here](../../getting-started/overview/).
