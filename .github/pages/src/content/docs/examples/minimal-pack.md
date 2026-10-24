---
title: Minimal pack
description: A complete, runnable example pack in this repository - check it, preview it, build it, and read how each file works.
sidebar:
  order: 1
---

`examples/minimal-pack/` is a complete project you can preview, check, and build with the toolkit. It has the same files as the minimal starter of toolkit `v0.3.0`, without the starter's README and CI workflow. Try it before creating your own game repository, or use it to compare a widget's markup with a working example.

Source: [github.com/emaclab/launcher-toolkit/tree/main/examples/minimal-pack](https://github.com/emaclab/launcher-toolkit/tree/main/examples/minimal-pack)

The example retains the [restricted starter license](https://github.com/emaclab/launcher-toolkit/blob/main/examples/minimal-pack/LICENSE).
Use it only for games integrated with EMAC Anti-Cheat.

```text
examples/minimal-pack/
  .toolkit-version            toolkit release the project requires (v0.3.0)
  .gitignore                  ignores dist/, .tools/, and a local launcher-toolkit.exe
  LICENSE                     restricted starter license
  pack/
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

It declares `"core_api": 3`, like both starters. Its launch bar handles all eight launcher phases,
uses `launcher.check_failed` to show recovery after a failed check, lists blocking programs, and
shows the last `anticheat.message`. It offers **Retry**, **Repair files**, and a confirmed
**Close programs** only in the states where the session accepts them; **Play** needs both the
launcher phase and anti-cheat status to be `ready`.

## Run it

Install `launcher-toolkit` from the matching [toolkit release](../../getting-started/release-tools/) as described in [Windows setup](../../getting-started/windows-setup/). The project's `.toolkit-version` must name the installed version.

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

`build` writes nothing when validation fails, refuses to replace a non-empty `--out-dir` folder that it did not create, and prints a JSON report on stdout. Its SHA-256 equals the one of the unmodified minimal starter; see [build](../../guides/build/#report). The outputs go to the temporary folder to keep generated pack files outside the checkout; without `--out`, `build` would write `examples/minimal-pack/dist/pack.zip`, which the example's `.gitignore` ignores. The pack uses plain CSS, so no preprocessor runs.

The repository's `examples/.gitattributes` disables line-ending conversion: packs are hashed byte for byte, and a checkout with converted line endings would build a different ZIP.

## What to try in the preview

| Try | What happens | Behind it |
| --- | --- | --- |
| Wait after opening | The bottom bar goes through **Checking**, **Downloading** with size, speed, and time left, **Verifying**, then **Ready**; **Play** becomes enabled. If the preview starts at **Ready** (for example after an earlier run), use **Check for updates** or the panel's **Launcher** control. | Simulated update; `launcher` fields; `bytes()`, `duration()` |
| Panel: **Block** during `downloading`, then **Close programs** | The bar lists the sample programs and opens a confirmation dialog. Focus starts on **Keep them open**; Escape or a backdrop click closes it. **Close and continue** resumes the simulated download without closing real processes. | `launcher.blocked.processes`; [`modal`](../../widgets/modal/); `force_close()` |
| **Check for updates** (when ready) | A fresh simulated download. | `check()` |
| Panel: **Fail** during `checking`, `downloading`, or `verifying` | The phase stays in `checking` with `launcher.check_failed: true`; the panel shows **(check failed)** and the bar shows **The update failed**, **Repair files**, and **Retry**. Either action starts the check again. | `launcher.check_failed`; `repair()`; `retry()` |
| **Play** | With the launcher and anti-cheat ready, the simulated phase moves to `launching`, then `launched`. Studio logs the launch and keeps the preview open. Open the splash from the panel to see its phase label. | `play()`; [`anticheat-mark`](../../widgets/anticheat-mark/) |
| Hover or Tab to the protection status | A tooltip explains it; Escape hides it. | [`tooltip`](../../widgets/tooltip/), `anticheat` |
| Select an article with a click, or with ↑/↓ and Enter | The article opens and its unread dot disappears; the **Home** badge counts down. The read marks persist. | [`list`](../../widgets/list/), `set` with a `set` variable |
| Links in the article | The `example.com` link is a button; the `example.org` link is plain text. | [`markdown`](../../widgets/markdown/), `allowed_hosts` |
| **Settings → Accent color** | A menu opens; ↓/↑ move, Escape closes and returns focus, a click outside closes it. The accent changes everywhere and persists. | [`dropdown`](../../widgets/dropdown/), root `data-accent` |
| **Download details** switch | Hides or shows the size, speed, and time in the bottom bar. | `toggle()`, `role="switch"` |
| **Choose…** | The Windows folder dialog opens; the chosen path is shown, never used. | `pick_folder()` |
| **Restore defaults** | Every setting returns to its `pack.json` default. | `set(name, null)` |
| Panel: **Error keys** → `linkFailed` | A toast appears, closes after 6 s, on Escape, or with ×. | [`toast`](../../widgets/toast/), `error_state` |
| Panel: **Offline**, then **Official website** | `open_url` reports a browser failure, which writes `linkFailed`. | `open_url()` |
| Panel: **Anti-cheat** → `error` while `ready`, then **Sample message** | The status dot turns red, the bar shows the message, and **Retry** replaces **Play**. Retry clears the message and restores simulated anti-cheat status. | `anticheat.status`; `anticheat.message`; `retry()` |
| Panel: **Fail** during `launching` or `launched` | The bar shows **The game did not start**, **Repair files**, and **Retry**. | `launch_failed`; `repair()`; `retry()` |
| Panel: **Launcher** → `blocked`, `launched`, `launch_failed` | The bar shows each API 3 phase directly, including blocked programs and the recovery actions where applicable. | API 3 launcher phases |

## How the files fit together

### `pack.json`

```json title="examples/minimal-pack/pack/pack.json"
{
  "format": 1,
  "core_api": 3,
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
    "confirm": { "type": "string", "default": "", "values": ["", "force_close"], "reset": "page" },
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

- `client_version: 2` is above the installed version of a fresh profile, so the simulation downloads first. `download_size` (512 MiB) feeds the size, speed, and ETA fields of the simulated update.
- Transient UI state (`confirm`, `tip`, `accent_menu`) resets on navigation and is not persisted. Real preferences (`read`, `accent`, `details`, `folder`) persist.
- `toast` is the `error_state` target, so it is a `string` without `values`. `folder` is written by `pick_folder`, so it also has no `values`.

### `window.json`

```json title="examples/minimal-pack/pack/window.json"
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
6. **Confirm dialog.** Rendered last so the overlay covers the window, and only while files are blocked and the player asks to close the programs that hold them.

```html title="layout.html (excerpt)"
{%- if state.confirm == "force_close" and launcher.phase == "blocked" %}
<div class="overlay" data-key="confirm-force-close" data-widget="modal" data-on-close="set('confirm', '')" data-return-focus="#primary-action">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
    <h2 id="confirm-title">{{ t("forceCloseTitle") }}</h2>
    <p id="confirm-text">{{ t("forceCloseText") }}</p>
    <ul class="dialog-list">
      {%- for process in launcher.blocked.processes %}
      <li data-key="pid-{{ process.pid }}">{{ process.name }} ({{ process.pid }})</li>
      {%- endfor %}
    </ul>
    <div class="dialog-actions">
      <button class="button" autofocus data-on-click="set('confirm', '')">{{ t("keepOpen") }}</button>
      <button class="button danger" data-on-click="force_close(); set('confirm', '')">{{ t("forceCloseConfirm") }}</button>
    </div>
  </div>
</div>
{%- endif %}
```

`data-return-focus="#primary-action"` names the shared **Play**/**Retry** button, the fallback when
the opener is gone. Confirming calls `force_close()` and closes the dialog; in the real launcher
it ends the listed programs, so the text warns about losing unsaved work. If the files become
available first, the phase condition removes the dialog automatically.

### `templates/launch-bar.html`

```html title="launch-bar.html (excerpt)"
{%- set phase = launcher.phase -%}
{%- set failed = launcher.check_failed -%}
{%- set label = t("checkFailed") if failed else t("phase." ~ phase) -%}
{%- set retry = failed or phase in ["blocked", "launch_failed"] or (phase == "ready" and anticheat.status == "error") -%}
{%- set left = duration(launcher.eta) -%}
…
<span class="progress-detail">
  {%- if anticheat.message %}<span class="alert" data-key="alert">{{ anticheat.message.title }}: {{ anticheat.message.message }}</span>
  {%- elif phase == "blocked" %}{{ t("heldBy") }} {% for process in launcher.blocked.processes %}{{ process.name }} ({{ process.pid }}){% if not loop.last %}, {% endif %}{% endfor %}
  {%- elif phase == "ready" %}{{ t("version") }} {{ launcher.client_version }}
  {%- elif state.details and phase == "downloading" and launcher.total is not none %}{{ bytes(launcher.downloaded) }} / {{ bytes(launcher.total) }}
    {%- if launcher.speed is not none %} · {{ bytes(launcher.speed) }}/s{% endif %}
    {%- if left %} · {% if left.hours %}{{ left.hours }}h {% endif %}{{ left.minutes }}m {{ left.seconds }}s{% endif %}
  {%- endif -%}
</span>
```

The label uses `checkFailed` while `launcher.check_failed` is true and `phase.*` otherwise.
**Close programs** appears in `blocked`; **Repair files** after a failed check or launch;
**Check for updates** in `ready`. The primary button becomes **Retry** after a failed check,
blocked update, failed launch, or anti-cheat error in `ready`. Otherwise it shows **Play**,
disabled unless both the launcher and anti-cheat are `ready`. A running check never exposes
recovery controls. See the [launch bar example](../launch-bar/) for a larger version.

### `templates/pages/home.html` and `pages/settings.html`

- Home selects the article from `state.article`, falling back to the newest one: `data.news|selectattr("id", "eq", state.article)|first or data.news|first`. Each row's handler sets the article and adds it to `read` in one call list.
- Settings uses the four setting controls of [template patterns](../../widgets/template-patterns/#settings-controls): a dropdown select, a switch, a folder with a tooltip, and a reset button that writes `null` to each setting.

### `templates/splash.html`

The splash has no state context and accepts no actions. With core API 3, it receives `launcher`
and renders `t("phase." ~ launcher.phase)`, so the text follows the launch through `launching`
and `launched`. Its `.splash-mark` box is 171 × 34 px, inside the window, so the core paints the
EMAC LAB mark there.

### `styles/app.css`

Plain CSS that respects the renderer's limits: `:focus` for focus rings, attribute selectors for state (`[aria-expanded="true"]`, `[aria-checked="true"]`, `[data-status="ready"]`), absolute positioning against `.app` for the overlay and the toast, and descendant selectors for the Markdown output.

### `i18n/en.json` and `data/news.json`

Every `t()` key, including the dynamic ones (`phase.*`, `anticheat.*`, `accent.*`) and the core error keys `linkFailed` and `pickFailed`. The news bodies are Markdown strings with `\n\n` between blocks.

## Adapt it

1. Copy the example project, or create your own with `launcher-toolkit init`, which also adds the README and CI workflow.
2. Replace `game.id` with the ID assigned to your game, and set `game.name`, `client_version`, `download_size`, `allowed_hosts`, and `links` in `pack/pack.json`.
3. Replace `pack/assets/icon.ico` and the titles in `pack/window.json`.
4. Add your languages: list them in `languages.available` and copy `pack/i18n/en.json` for each.
5. Run `launcher-toolkit.exe check` in the project folder until it reports no errors or warnings.

## What the example does not show

In the preview, the update, game launch, and anti-cheat status are **simulated**. No game client is downloaded, installed, or started. See [Start here](../../getting-started/overview/).
