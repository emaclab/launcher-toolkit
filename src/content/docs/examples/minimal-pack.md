---
title: Minimal pack
description: A complete, runnable example pack in this repository - check it, preview it, build it, and read how each file works.
sidebar:
  order: 1
---

`examples/minimal-pack/` is a complete pack you can preview, check, and build with the toolkit. Try it before creating your own game repository, or use it to compare a widget's markup with a working example.

Source: [github.com/emaclab/launcher-toolkit/tree/main/examples/minimal-pack](https://github.com/emaclab/launcher-toolkit/tree/main/examples/minimal-pack)

The example retains the [restricted starter license](https://github.com/emaclab/launcher-toolkit/blob/main/examples/minimal-pack/LICENSE).
Use it only for games integrated with EMAC Anti-Cheat.

```text
examples/minimal-pack/
  .toolkit-version          matching author CLI version
  LICENSE                   restricted starter license
  pack.json                 game, one language, two pages, one data document, state
  window.json               960 x 560 main window, 560 x 315 splash, icon
  templates/
    layout.html             title bar, navigation, page, launch bar, toast, confirm dialog
    launch-bar.html         anti-cheat status + tooltip, progress, launcher actions
    splash.html             splash with the anti-cheat mark placeholder
    pages/home.html         news list (list) + article (markdown) + website link
    pages/settings.html     accent select (dropdown), switch, folder (pick_folder + tooltip), reset
  styles/app.css            plain CSS, no build step
  i18n/en.json              every string the templates use
  data/news.json            two articles with Markdown bodies
  assets/icon.ico           neutral icon generated for this example
```

It declares `"core_api": 2`, because it uses `markdown`, `tooltip`, `pick_folder`, `bytes()`, `duration()`, `anticheat`, and the download fields.

## Run it

Install `launcher-toolkit` from the matching [toolkit release](../../getting-started/release-tools/) as described in [Windows setup](../../getting-started/windows-setup/).

```powershell
git clone https://github.com/emaclab/launcher-toolkit.git
Set-Location launcher-toolkit

# Every Studio check once: exit code 0 when there are no errors
launcher-toolkit.exe check examples/minimal-pack

# Live preview with the control panel; edits reload on save
launcher-toolkit.exe dev examples/minimal-pack

# Validate the pack and build its ZIP
launcher-toolkit.exe build examples/minimal-pack --out "$env:TEMP\minimal-pack.zip"

# The exact built files, for inspection or a preview of the built output
launcher-toolkit.exe build examples/minimal-pack --out-dir "$env:TEMP\minimal-pack-built"
Copy-Item examples/minimal-pack/.toolkit-version "$env:TEMP\minimal-pack-built\.toolkit-version"
launcher-toolkit.exe dev "$env:TEMP\minimal-pack-built"
```

`build` writes nothing when validation fails, refuses to replace a non-empty `--out-dir` folder that it did not create, and prints a JSON report on stdout. See [build](../../guides/build/). The outputs go to the temporary folder because this repository's `dist/` is the documentation site's build output. The pack has no `styles/input.css`, so `launcher-toolkit styles` is not needed.

The repository's `examples/.gitattributes` disables line-ending conversion: packs are hashed byte for byte, and a checkout with converted line endings would build a different ZIP.

## What to try in the preview

| Try | What happens | Behind it |
| --- | --- | --- |
| Wait after opening | The bottom bar goes through **Checking**, **Downloading** with size, speed, and time left, **Verifying**, then **Ready**; **Play** becomes enabled. If the preview starts at **Ready** (for example after an earlier run), use **Check for updates** or the panel's **Launcher** control. | Simulated update; `launcher` fields; `bytes()`, `duration()` |
| **Pause**, **Resume** | The phase switches; speed drops to 0 while paused. | `pause()`, `resume()` |
| **Cancel** | A dialog asks first; focus starts on **Keep downloading**; Escape or a click on the dark backdrop closes it. | [`modal`](../../widgets/modal/), `cancel()` |
| Confirm the cancel, then **Retry** | The update starts over. | `retry()` |
| **Check for updates** (when ready) | A fresh simulated download. | `check()` |
| **Play** | Studio logs the launch in the panel and keeps the preview open; open the splash from the panel to see it. | `play()`; [`anticheat-mark`](../../widgets/anticheat-mark/) |
| Hover or Tab to the protection status | A tooltip explains it; Escape hides it. | [`tooltip`](../../widgets/tooltip/), `anticheat` |
| Select an article with a click, or with ↑/↓ and Enter | The article opens and its unread dot disappears; the **Home** badge counts down. The read marks persist. | [`list`](../../widgets/list/), `set` with a `set` variable |
| Links in the article | The `example.com` link is a button; the `example.org` link is plain text. | [`markdown`](../../widgets/markdown/), `allowed_hosts` |
| **Settings → Accent color** | A menu opens; ↓/↑ move, Escape closes and returns focus, a click outside closes it. The accent changes everywhere and persists. | [`dropdown`](../../widgets/dropdown/), root `data-accent` |
| **Download details** switch | Hides or shows the size, speed, and time in the bottom bar. | `toggle()`, `role="switch"` |
| **Choose…** | The Windows folder dialog opens; the chosen path is shown, never used. | `pick_folder()` |
| **Restore defaults** | Every setting returns to its `pack.json` default. | `set(name, null)` |
| Panel: **Error keys** → `linkFailed` | A toast appears, closes after 6 s, on Escape, or with ×. | [`toast`](../../widgets/toast/), `error_state` |
| Panel: **Offline**, then **Official website** | `open_url` reports a browser failure, which writes `linkFailed`. | `open_url()` |
| Panel: **Anti-cheat** → `error` | The status dot turns red; the simulation never produces this state. | `anticheat.status` |

## How the files fit together

### `pack.json`

```json title="examples/minimal-pack/pack.json"
{
  "format": 1,
  "core_api": 2,
  "game": {
    "id": "minimal-example",
    "name": "Minimal Example",
    "client_version": 2,
    "download_size": 536870912,
    "allowed_hosts": ["example.com"],
    "links": {
      "website": "https://example.com/"
    }
  },
  "languages": { "default": "en", "available": ["en"] },
  "pages": ["home", "settings"],
  "styles": ["styles/app.css"],
  "data": ["news"],
  "feed": null,
  "error_state": "toast",
  "state": {
    "toast": { "type": "string", "default": "" },
    "confirm": { "type": "string", "default": "", "values": ["", "cancel_download"], "reset": "page" },
    "tip": { "type": "string", "default": "", "reset": "page" },
    "article": { "type": "string", "default": "" },
    "read": { "type": "set", "default": [], "persist": true },
    "accent": { "type": "string", "default": "blue", "values": ["blue", "green", "orange"], "persist": true },
    "accent_menu": { "type": "bool", "default": false, "reset": "page" },
    "details": { "type": "bool", "default": true, "persist": true },
    "folder": { "type": "string", "default": "", "persist": true }
  }
}
```

- `client_version: 2` is above the installed version of a fresh profile, so the simulation downloads first. `download_size` (512 MiB) feeds the size, speed, and ETA fields.
- Transient UI state (`confirm`, `tip`, `accent_menu`) resets on navigation and is not persisted. Real preferences (`read`, `accent`, `details`, `folder`) persist.
- `toast` is the `error_state` target, so it is a `string` without `values`. `folder` is written by `pick_folder`, so it also has no `values`.

### `window.json`

```json title="examples/minimal-pack/window.json"
{
  "icon": "assets/icon.ico",
  "base_color": "#11161f",
  "main": {
    "title": "Minimal Example Launcher",
    "template": "layout.html",
    "width": 960,
    "height": 560,
    "polygon": null
  },
  "splash": {
    "title": "Minimal Example",
    "template": "splash.html",
    "width": 560,
    "height": 315,
    "polygon": null,
    "duration_ms": 3000
  }
}
```

Both windows are rectangular (`polygon: null`), so the root elements have no `clip-path`. `base_color` equals the CSS background, so nothing flashes before the first paint. See [windows and splash](../../reference/windows/).

### `templates/layout.html`

The root carries `lang`, `data-page`, and `data-accent`, so CSS can theme by attribute. In order it renders:

1. **Title bar.** The game name sits inside the `drag()` element, so dragging the name moves the window; the window buttons are siblings.
2. **Navigation.** One button per page with `aria-current="page"` on the active one, and an unread badge computed from the persisted `read` set.
3. **Page.** `{% include "pages/" ~ page ~ ".html" %}` inside a section keyed by the page.
4. **Launch bar.** `{% include "launch-bar.html" %}`.
5. **Toast.** Rendered from `state.toast`, keyed by the message so a new message restarts the 6 s timeout.
6. **Confirm dialog.** Rendered last so the overlay covers the window, and only while the download can still be cancelled.

```html title="layout.html (excerpt)"
{%- if state.confirm == "cancel_download" and launcher.phase in ["downloading", "paused"] %}
<div class="overlay" data-key="confirm-cancel" data-widget="modal" data-on-close="set('confirm', '')" data-return-focus="#primary-action">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
    …
    <button class="button" autofocus data-on-click="set('confirm', '')">{{ t("keepDownloading") }}</button>
    <button class="button danger" data-on-click="cancel(); set('confirm', '')">{{ t("cancelDownload") }}</button>
  </div>
</div>
{%- endif %}
```

`data-return-focus="#primary-action"` matters after a confirmed cancel: the **Cancel** button that opened the dialog disappears with the phase change, so focus moves to the **Retry** button, which has the same id as **Play**.

### `templates/launch-bar.html`

```html title="launch-bar.html (excerpt)"
{%- set phase = launcher.phase -%}
{%- set transfer = phase in ["downloading", "paused"] -%}
{%- set left = duration(launcher.eta) -%}
…
<span class="progress-detail">
  {%- if phase == "ready" %}{{ t("version") }} {{ launcher.client_version }}
  {%- elif state.details and transfer and launcher.total is not none %}{{ bytes(launcher.downloaded) }} / {{ bytes(launcher.total) }}
    {%- if launcher.speed is not none %} · {{ bytes(launcher.speed) }}/s{% endif %}
    {%- if left %} · {% if left.hours %}{{ left.hours }}h {% endif %}{{ left.minutes }}m {{ left.seconds }}s{% endif %}
  {%- endif -%}
</span>
```

The action buttons follow the phase: **Pause** or **Resume**, then **Cancel** or **Check for updates**, then **Play** (disabled until `ready`) or **Retry** after a cancel. The core would refuse an action in the wrong phase anyway; hiding and disabling makes the state visible.

### `templates/pages/home.html` and `pages/settings.html`

- Home selects the article from `state.article`, falling back to the newest one: `data.news|selectattr("id", "eq", state.article)|first or data.news|first`. Each row's handler sets the article and adds it to `read` in one call list.
- Settings uses the four setting controls of [template patterns](../../widgets/template-patterns/#settings-controls): a dropdown select, a switch, a folder with a tooltip, and a reset button that writes `null` to each setting.

### `templates/splash.html`

The splash has no state or launcher context and accepts no actions. Its `.splash-mark` box is 171 × 34 px, inside the window, so the core paints the EMAC LAB mark there.

### `styles/app.css`

Plain CSS that respects the renderer's limits: `:focus` for focus rings, attribute selectors for state (`[aria-expanded="true"]`, `[aria-checked="true"]`, `[data-status="ready"]`), absolute positioning against `.app` for the overlay and the toast, and descendant selectors for the Markdown output.

### `i18n/en.json` and `data/news.json`

Every `t()` key, including the dynamic ones (`phase.*`, `anticheat.*`, `accent.*`) and the core error keys `linkFailed` and `pickFailed`. The news bodies are Markdown strings with `\n\n` between blocks.

## Adapt it

1. Copy the folder into your game repository as `pack/`.
2. Replace `game.id` with the id EMAC assigned, and set `game.name`, `client_version`, `download_size`, `allowed_hosts`, and `links`.
3. Replace `assets/icon.ico` and the titles in `window.json`.
4. Add your languages: list them in `languages.available` and copy `i18n/en.json` for each.
5. Run `launcher-toolkit.exe check pack` until it reports no errors or warnings.

## What the example does not show

The update, game launch, and anti-cheat status are **simulated**. No game client is downloaded, installed, or started. See [Start here](../../getting-started/overview/).

