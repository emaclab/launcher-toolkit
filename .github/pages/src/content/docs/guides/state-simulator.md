---
title: State simulator
description: Drive every page, language, launcher phase, scenario, anti-cheat status, state value, feed, error, clock and splash of a pack from the Pack Studio control panel.
sidebar:
  order: 2
---

The **Simulator** tab of the Pack Studio control panel puts the preview into any situation that
players can meet, without a game client, a network failure or a real anti-cheat. Every control
goes through the runtime's normal entry points: state writes are coerced and validated as in the
launcher, and feed bodies go through the normal feed merge and render check.

## Controls

| Section | Controls | Effect |
| --- | --- | --- |
| Page | One button per entry of `pack.json` `pages` | Runs `navigate(page)`, so `reset: "page"` variables reset as in the launcher |
| Language | One button per language | Switches the language like `set_language(code)`, but the choice is not saved |
| Launcher | One button per phase: `checking`, `downloading`, `verifying`, `blocked`, `ready`, `launching`, `launched`, `launch_failed`; fields progress, installed, client, downloaded, total, speed, eta; **Freeze with these values**, **Resume** | Freezes the simulated launcher in that phase with those values, or resumes the simulation |
| Scenarios | **Next phase**, **Block**, **Fail** | **Next phase** freezes the following phase. **Block** turns a running download into `blocked`, held by sample processes. **Fail** during a check or update sets `checking` with `launcher.check_failed: true`; during a launch it sets `launch_failed` |
| State | One button per declared variable, showing its type and value; a value field with **Set** and **Default**, or **Add** and **Remove** for a `set` | Writes the variable through the same coercion as the launcher. A refused value shows the coercion error |
| Anti-cheat | `checking`, `updating`, `ready`, `unavailable`, `error`, `simulated`; **Sample message** | Fixes `anticheat.status` (with `simulated: false`) in the preview and the splash, or returns to the status simulated from the launcher phase. **Sample message** sets or clears a sample `anticheat.message` |
| Feed | A JSON file path with **Apply**; **Pack defaults**; **Fetch now** | Applies the file as a feed body (rejections are shown), restores the pack's data files, or fetches the pack's feed now |
| Simulation | **Offline**; **Open URLs in the browser** | Offline: feed fetches and remote image downloads fail while cached data and images stay, and `open_url` reports a browser failure (`linkFailed`). The second switch makes `open_url` open the real browser |
| Error keys | `linkFailed`, `pickFailed` | Writes that core error key into the pack's `error_state` variable |
| Time | An RFC 3339 time such as `2026-10-31T18:00:00Z`; **Fix time**, **System** | Overrides `now` and `today` for calendars, `countdown` and `age()`, or returns to the system clock |
| Splash, reload | **Open splash** / **Reopen splash**; **Reload now** | Opens the splash window with the current overrides; it closes after `window.json` `splash.duration_ms`. **Reload now** reloads the pack from disk |

The phase buttons always list the core API 3 phases. A pack that declares `"core_api": 1` or `2`
sees `blocked` as `downloading`, `launched` as `launching`, and `launch_failed` as `ready`.

## The simulated launcher

Without a freeze, the preview runs the same simulated update as a launcher without a configured
game sync: `checking` for 1.8 s, then `downloading` (about 12 s from 0 to 100%) when the installed
version is below `game.client_version`, `verifying` for 1.6 s, and `ready`, which records
`client_version` as installed. A fresh profile starts below the client version, so it downloads
first.

Launcher actions in the preview change only this simulation, and the **Log** tab records each
outcome, for example `repair(): ready → checking` or `check(): refused in downloading`:

| Action | Accepted in the preview | Result |
| --- | --- | --- |
| `play()` | `ready` with anti-cheat `ready` | `launching`, then `launched` after 2 s; the preview stays open |
| `check()` | `ready` | A new check that ends in a simulated download |
| `repair()` | `ready`, `launch_failed`, `checking` with `launcher.check_failed: true` | Clears the failed-check flag and starts a new simulated check and download |
| `retry()` | `blocked`, `launch_failed`, `ready` with anti-cheat `error`, `checking` with `launcher.check_failed: true` | `blocked` continues the download; `launch_failed` returns to `ready`; an anti-cheat error stays in `ready`; a failed check clears the flag and starts again. An accepted retry clears `anticheat.message`. Retrying an anti-cheat error in `ready` or `launch_failed` also clears the panel's `error` override and restores simulated status |
| `force_close()` | `blocked` | Continues the download; no process is closed |

Use **Block** during `downloading` and **Fail** during `checking`, `downloading`, `verifying`,
`launching`, or `launched` to reach the error paths. A failed check or update stays in `checking`
with `launcher.check_failed: true`; the **Launcher** heading shows **(check failed)**. It waits
there until an accepted `retry()` or `repair()` clears the flag and starts the check again.
The panel reports when a scenario does not apply to the current phase.

The preview evaluates launcher requests using the displayed anti-cheat status, including a panel
override. **Play** needs both the phase and `anticheat.status` to be `ready`; that status stands
in for the real launcher's handshake. Keep the pack's **Play** button disabled until both are
ready, as in the starter.

## The launcher fields

- **progress** is 0 to 100. **installed** and **client** set `launcher.installed_version` and
  `launcher.client_version`; empty fields keep the current values.
- **downloaded**, **total** (bytes), **speed** (bytes per second) and **eta** (seconds) set the
  download fields. With all four empty, the simulated values stay: `game.download_size` ×
  progress. Otherwise empty ones are absent (`none`), so you can test a template with an unknown
  size or speed.
- A frozen launcher stays frozen across reloads and across a reopened preview, until you click
  **Resume**.

In the real launcher, these values come from the game sync configured for the game, or from the
same simulated update phases when no game sync is configured. The anti-cheat status there is real.

## Log tab

The **Log** tab shows:

- **Actions**: the actions whose effects are outside the preview (`open_url` after the
  allowed-host check, `play`, `minimize` and `close`) and the outcome of each launcher request.
- **Render log**: the runtime's diagnostics of the preview and the splash, such as
  `ERROR template` lines, missing resources, `t()` fallbacks to the default language, and
  `Pack warning: pause() was removed in core API 3 and does nothing`. Each distinct line shows once
  per reload; repeats count in place (`line ×N`).
- **Live state**: every declared state value as JSON.

## Check your pack before building

1. Visit every page in every language.
2. For each page, click every launcher phase, then `ready` and **Open splash**.
3. Click every anti-cheat status, and toggle **Sample message** if the pack shows
   `anticheat.message`.
4. Freeze `downloading` with empty download fields and with explicit values, including a large
   `total` and an empty `speed`.
5. Use **Block** and **Fail**, then your pack's `retry()`, `repair()`, and `force_close()` buttons.
   In `checking`, confirm that **Fail** shows **(check failed)** and only then exposes recovery
   controls. In `ready`, set anti-cheat to `error`, add a sample message, and test **Retry**.
6. Toggle **Offline** and use a link; click both error keys and check how your `error_state`
   element shows them.
7. If the pack has a feed or time-based content, apply a feed file with edge cases and fix the
   time before and after your events.
8. Set each settings variable to every allowed value, then **Default**.
9. Keep the **Log** tab's render log empty, and run [`launcher-toolkit check`](../studio-checks/).
