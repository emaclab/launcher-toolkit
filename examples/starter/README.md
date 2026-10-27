# Launcher starter

A complete launcher interface for a game integrated with **EMAC Anti-Cheat**, written in HTML, CSS, and JavaScript with [Preact](https://preactjs.com/) + [htm](https://github.com/developit/htm). The main window is 1120 × 630; the splash is 640 × 360. The project includes seven pages, Portuguese/English/Spanish translations, local data, remote data with cache, and Windows CI. No JavaScript or CSS build step is required.

> **Restricted use.** This is not open-source software. Use it only for games integrated with EMAC Anti-Cheat and retain [`LICENSE`](LICENSE) in derivative repositories. That license governs the starter; third-party licenses in `pack/vendor/` govern Preact and htm.

## Open this project

Use Windows x64 and the toolkit release named in [`.toolkit-version`](.toolkit-version). Download `launcher-toolkit-windows-x64.exe` from the corresponding [public release](https://github.com/emaclab/launcher-toolkit/releases), [verify its SHA-256 and size](https://emaclab.github.io/launcher-toolkit/getting-started/install/#download-and-verify), and rename it to `launcher-toolkit.exe`.

Install it for your Windows user, without administrator rights:

```powershell
.\launcher-toolkit.exe install
```

Open a new terminal and run from this project's root:

```powershell
launcher-toolkit version
launcher-toolkit dev
launcher-toolkit check --json
launcher-toolkit build --out dist/pack.zip
```

`dev` opens the interface and the Pack Studio control panel. `check` boots both documents headless, denies network access, and exercises the session phases and anti-cheat statuses. `build` runs those checks and packages the validated files. It produces a review ZIP, not an executable, installer, signature, or publication.

To create a separate project instead, run this command in a parent directory with an empty or absent `my-game` destination:

```powershell
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

Do not run `init` over this extracted project. It already contains all project files.

## Files and responsibilities

| File or directory | Responsibility |
| --- | --- |
| `.toolkit-version` | Toolkit release used locally and by CI |
| `launcher.d.ts` | Generated reference for the native `launcher` bridge |
| `.github/workflows/pack.yml` | Verified toolkit download, Windows build, review artifact |
| `pack/pack.json` | Format `1`, core API `1`, game identity, hosts, links, requirements |
| `pack/window.json` | Window entries, titles, dimensions, icon, region, splash duration |
| `pack/index.html`, `pack/splash.html` | Entry documents with their own stylesheet and module script |
| `pack/app/main.js` | Application context, navigation, dialogs, language, toasts |
| `pack/app/session.js`, `pack/app/launch-bar.js` | Snapshot subscription and state-dependent launch actions |
| `pack/app/splash.js` | Launch presentation and native anti-cheat mark placeholder |
| `pack/app/pages/` | Home, News, Updates, Calendar, Servers, About, Settings |
| `pack/app/ui.js` | Modal, dropdown, tooltip, toast, keyboard lists, tabs, pagination, scroll, countdown |
| `pack/app/data.js` | Local documents, remote validation, cache, refresh |
| `pack/app/settings.js`, `pack/app/i18n.js` | Validated preferences, language choice, translations, formatting |
| `pack/app/dates.js`, `pack/app/markdown.js` | Calendar rules and safe Markdown rendering |
| `pack/styles/app.css` | Ready-to-use CSS |
| `pack/data/`, `pack/i18n/`, `pack/assets/` | Content, translations, icon, images |
| `pack/vendor/` | Bundled Preact + htm and their licenses |
| `examples/` | Optional polygon configuration; not part of the runtime ZIP |

Everything under `pack/` ships, apart from hidden entries. Keep editor settings, notes, CI, credentials, and preprocessor inputs outside it. Preserve `.gitattributes` for byte-exact checkouts. Packs are complete sources; there is no external base or overlay.

## Customize the launcher

1. Set the assigned `game.id` and final `game.name` in `pack/pack.json`. The name selects `%LOCALAPPDATA%/<game.name> Launcher/`; choose it before distribution.
2. Set native window titles in `pack/window.json` and replace the icon and game artwork. Let the core paint the EMAC LAB mark; do not ship your own copy.
3. Replace example content in `pack/data/` and the texts in all three `pack/i18n/` files.
4. Replace `example.com` in `game.links`, data links, `allowed_hosts`, `network_hosts`, and the `REMOTE` URLs in `pack/app/data.js`. `allowed_hosts` authorizes external browser links; `network_hosts` authorizes JSON requests.
5. Adjust the ready-to-use stylesheet and the page modules. Libraries belong in `pack/vendor/`, together with their notices.
6. In Pack Studio, inspect each page, keyboard navigation, dialogs, offline content, every phase, failed checks, blocked processes, launch failure, and every anti-cheat status. Run `check` and `build` before committing.

The preview simulates update, anti-cheat, and launch. It does not synchronize game files, run the SDK/driver, or prove production onboarding.

## Content examples

| Page | Edit | Behavior |
| --- | --- | --- |
| Home | `data/slides.json`, `data/calendar.json`, `app/pages/home.js` | Carousel, scroll-aware artwork, countdown, highlights |
| News | `data/news.json`, `app/pages/news.js` | Search, selected article, read state, Markdown |
| Updates | `data/releases.json`, `app/pages/updates.js` | Tabs, pagination, game-client release notes, check and repair |
| Calendar | `data/calendar.json`, `data/events.json`, `app/pages/calendar.js` | Month grid, recurrence, selected day, event dialog |
| Servers | `data/servers.json`, `app/pages/servers.js` | Online/maintenance/offline states, data age, refresh |
| About | `data/faq.json`, `pack.json`, `app/pages/about.js` | Requirements, game information, FAQ, external links |
| Settings | `app/settings.js`, `app/pages/settings.js` | Accent, density, motion, badges, text size, saved folder, reset |

The schemas are owned by the application modules, not by the core. Follow each existing JSON document when replacing content. Keep stable content IDs for news read state and calendar detail lookup. Localized content accepts a string or an object such as `{"pt":"Notícias","en":"News","es":"Noticias"}`.

`app/i18n.js` chooses the saved language, then the first supported Windows language, then `pt`. Add a language by adding a complete translation file and including its code in `LANGUAGES`. The splash reads the language saved by the main window.

`app/data.js` shows fresh cached remote data or local content immediately. A successful, valid remote document replaces it; network denial, invalid data, or fetch failure keeps the current content. News and calendar cache for one hour; servers cache for five minutes and refresh every five minutes. The `example.com` endpoints are sample addresses, not a provisioned service.

## Runtime rules

- Call `launcher.ready()` after the first render in each document. An uncaught exception, unhandled rejection, or 10 seconds without `ready()` fails boot.
- Use `launcher.snapshot` and `launcher.subscribe` for session state. `ready` permits Play only when anti-cheat is also `ready`; the core revalidates every request.
- Show `retry`/`forceClose` in `blocked`, with confirmation before closing the listed processes. Show `retry`/`repair` for failed checks or launches. Use `retry` for an anti-cheat error in `ready`.
- Use `launcher.readJson`, `launcher.fetchJson`, and `launcher.openUrl`. There is no browser `fetch` or XHR; anchors do not navigate. Handle expected bridge failures by `error.code`.
- Render closed menus and dialogs conditionally. Put global input listeners on `window`, not `document`. Tab follows DOM order.
- Main can write `localStorage` and `launcher.cache`; splash can only read them. Validate stored values. `pickFolder` returns a path, not disk access.
- Keep a `data-anticheat-mark` box in the splash, at least 120 × 24 logical pixels and completely inside its window and polygon, in every state. The main window does not use that placeholder.

See [`launcher.d.ts`](launcher.d.ts) and the [runtime reference](https://emaclab.github.io/launcher-toolkit/reference/documents/) for capabilities, limits, and supported renderer behavior.

## Polygon example

`examples/window-polygon.json` and `examples/polygon.css` are a paired example. In a disposable copy of this project, replace `pack/window.json` with that JSON and append the CSS to `pack/styles/app.css`. Run `check`, then inspect the main window and splash in `dev`.

Both root `clip-path` values must match their window polygons. The native region handles actual clipping and pointer hit testing. Changing dimensions requires changing both geometries; keep the mark inside the splash polygon.

## CI and publication

The included workflow reads `.toolkit-version`, verifies the selected public executable's SHA-256 and size, builds on Windows, and uploads `dist/` for review. It needs no publishing credentials. Keep the starter `LICENSE` and all bundled third-party notices.

A game's repository represents one complete pack per branch. Seasonal branches hold complete content and remain drafts until deliberately promoted to the default branch. Publication requires the provider's onboarding, authorized repository, and active registration; local build does not provision that service. Never add administrative signing or hosting credentials to this project.

[Public manual](https://emaclab.github.io/launcher-toolkit/) · [Releases](https://github.com/emaclab/launcher-toolkit/releases)
