---
title: Checks
description: What launcher-toolkit check runs, how to read its findings, and how to fix common errors.
sidebar:
  order: 2
---

```powershell
launcher-toolkit check [project-or-pack] [--json]
```

`check` validates the files, then runs the main window and the splash **headless**, with the
network denied, through every session state. `build` runs the same checks before it writes
anything, and publication runs them again on the built pack. Errors exit with `1`; warnings alone
do not fail.

## Output

```text
Script boot failed: ready() not called within 10 s
error [boot] index.html: main `index.html`: ready() not called within 10 s
error [mark] splash.html: splash `splash.html`: the anticheat-mark placeholder is missing; the core would paint the mark at its fallback position
2 error(s), 0 warning(s)
```

Each finding has a check code, the file, and the line when the message names them. `--json`
prints the same findings as one object:

```json
{
  "errors": [
    {
      "check": "boot",
      "file": "index.html",
      "line": null,
      "message": "main `index.html`: ready() not called within 10 s"
    }
  ],
  "warnings": []
}
```

## What runs

The runtime checks start only after the files and the schema pass.

| Code | Severity | Checks |
| --- | --- | --- |
| `zip` | error | Paths, file count and sizes, symbolic links and junctions; hidden entries are left out |
| `pack` | error | `pack.json`, `window.json`, entry documents, icon, and `core_api`, as the core validates them |
| `boot` | error | Each window must call `launcher.ready()` within 10 s, without an uncaught error or unhandled rejection before it |
| `js` | error | Every snapshot below reaches each window; any JS error is reported with the window and the snapshot |
| `resources` | error / warning | A stylesheet, `@import`, applied `url()`, or image the document loads must exist in the pack; a URL outside the pack, other than an `https://` image, is a warning |
| `polygon` | warning | The root `clip-path` must match `window.json` `polygon` (same vertices, cyclic order, 0.5 px tolerance) |
| `mark` | error | The splash needs a valid `data-anticheat-mark` placeholder, rechecked after every snapshot |
| `timeout` | error | The whole run has 30 s of wall time |
| `headless` | error | The check itself could not run, for example its temporary folder |

### The snapshots

Each window receives every phase; `checking` with `checkFailed`; the five anti-cheat statuses in
`ready`, with a message in `error`; `blocked` with processes; and `launch_failed` with a message.
Progress is 50 in `downloading`, `blocked`, and `verifying` and 100 in `ready`, `launching`, and
`launched`, with matching download metrics. Each snapshot advances virtual time by 3 s and fires
the timers due in that interval.

### The network is denied

`launcher.fetchJson` rejects with `networkDenied`, `launcher.openUrl` rejects, and `https://`
images are not downloaded. That is a finding only if your code leaves the rejection unhandled.
`localStorage` and the cache live in a temporary folder, and the splash reads the main window's
copy, as in the launcher.

## Common errors

| Message | Fix |
| --- | --- |
| `missing field ...` / `unknown field ...` in `pack.json` or `window.json` | Both schemas are strict; compare with the [pack.json](../../reference/pack-json/) and [window.json](../../reference/window-json/) references |
| `core_api 2 needs a newer core (this core: 1)` | Declare `"core_api": 1` |
| `expected value at line 1 column 1` | The JSON starts with a BOM; save as UTF-8 without BOM |
| `ready() not called within 10 s` | Call `launcher.ready()` after the first render, also when data fails to load |
| Boot: unhandled rejection | Catch the rejections of `readJson`, `fetchJson`, `openUrl`, and `pickFolder` you expect, by `error.code` |
| JS error in a snapshot | Your UI does not handle that state; reproduce it with the panel's phase and anti-cheat chips |
| Missing resource | Add the file to the pack, or fix the relative path (CSS `url()` resolves from the stylesheet) |
| Mark missing or outside the rules | Keep exactly one `data-anticheat-mark` element of at least 120 × 24 px inside the splash window and polygon in every state |
| Timeout | A long synchronous callback blocks the thread; split the work or shorten it |

An endless loop stops at the runtime's iteration limit and becomes a JS error (`boot` or `js`).
