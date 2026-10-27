---
title: Pack Studio
description: Preview a pack with hot reload and drive the simulated session from the control panel.
sidebar:
  order: 1
---

```powershell
launcher-toolkit dev [project-or-pack] [--data-dir <dir>]
```

`dev` opens your main window in the launcher's own runtime, plus a **control panel** window. The
preview opens once the pack passes every schema check; until then the panel lists the errors.

## Hot reload

The toolkit watches the whole project and reloads 150 ms after the last change; directories and
temporary dotfiles are ignored. A reload builds a **new document from scratch** (there is no HMR):

- `localStorage` and `launcher.cache` of the preview survive reloads;
- the panel reapplies phase, anti-cheat, and clock, so the new document gets the same snapshot;
- the new main window and splash boot hidden and replace the old ones only after `ready()`;
- if the new boot fails (schema error, uncaught error, unhandled rejection, or 10 s without
  `ready()`), the previous document stays and the panel shows the error.

Run a CSS preprocessor's watcher in another terminal; the preview reloads when its output changes.

## Control panel

| Tab | Content |
| --- | --- |
| **Simulator** | Session, anti-cheat, network, clock, splash, and reload controls |
| **Checks** | Errors and warnings of the last reload, with check code, file, and line |
| **Log** | Actions with effects outside the preview, the render log with `console.*` and JS errors, and the current snapshot as JSON |
| **Reference** | The `launcher.d.ts` of this toolkit version |

### Session

The session runs on its own, as in a launcher without game sync: `checking`, `downloading`,
`verifying`, then `ready`. The download total comes from `game.download_size`.

- **Phase chips** freeze the session in that phase, with the values typed in the fields
  (`progress`, `installed`, `client`, `downloaded`, `total`, `speed`, `eta`). With all four
  download fields empty, the simulated values stay.
- **Freeze with these values** applies the fields to the current phase; **Resume** unfreezes.
- **Next phase** freezes the following phase.
- **Block** holds the files of a running download with sample processes (`blocked`).
- **Fail** fails a check, a download, or a launch. A failed check stays in `checking` with
  `checkFailed: true`.

Your main window's `launcher.request()` calls act on this simulation and are accepted or refused
by the same rules as the real session: Play only in `ready` with anti-cheat `ready`, `forceClose`
only in `blocked`, and so on (see [requests](../../reference/bridge/#requests)). The **Log** tab
records each decision.

### Anti-cheat

Chips set the status: `checking`, `updating`, `ready`, `unavailable`, `error`, or **simulated**
(back to the simulation). **Sample message** toggles an anti-cheat error message in the snapshot.
`retry` in `ready` with anti-cheat `error` clears the message and restarts the simulated anti-cheat.

### Network and clock

- **Offline** makes `launcher.fetchJson` and remote image downloads fail; the cache and images
  already stored stay. A failed image is requested again on the next reload.
- **Open URLs in the browser** lets `launcher.openUrl` open the browser; otherwise the panel only
  logs the URL after the host check.
- **Fix time** sets the documents' clock to a UTC time such as `2026-10-31T18:00:00Z`. A later
  time fires the timers due until then; an earlier one only moves `Date` back. **System** returns
  to the system clock.

### Splash and reload

**Open splash** shows the splash document with the current snapshot; **Reload now** reloads
without a file change.

## What the preview does not do

It never checks or downloads game files, closes processes, starts the anti-cheat, or launches a
game. `launcher.pickFolder` opens the real dialog and `launcher.window.drag()` moves the preview
window; minimize and close are logged.

The preview keeps its own data under `%LOCALAPPDATA%\EMAC LAB\Launcher Toolkit\Studio\packs\<game.id>\`:
`localStorage`, cache, and remote images, apart from any installed launcher. `--data-dir` selects
another root for throwaway runs.
