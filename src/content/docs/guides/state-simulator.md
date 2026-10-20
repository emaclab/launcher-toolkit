---
title: State simulator
description: Drive every page, language, launcher phase, anti-cheat status, state value, feed, error, clock and splash of a pack from the Pack Studio control panel.
sidebar:
  order: 2
---

The **Simulator** tab of the Pack Studio control panel puts the preview into any situation that
players can meet, without a game client, a network failure or a real anti-cheat. Every control
goes through the runtime's normal entry points: state writes are coerced and validated as in the
launcher, and feed bodies go through the normal feed merge.

## Controls

| Section | Controls | Effect |
| --- | --- | --- |
| Page | One button per entry of `pack.json` `pages` | Runs `navigate(page)`, so `reset: "page"` variables reset as in the launcher |
| Language | One button per language | Runs `set_language(code)`, but the choice is not saved |
| Launcher | One button per phase: `checking`, `downloading`, `paused`, `verifying`, `ready`, `cancelled`, `launching`; fields progress, installed, client, downloaded, total, speed, eta; **Freeze with these values**, **Resume** | Freezes the simulated launcher in that phase with those values, or resumes the simulation |
| State | One button per declared variable, showing its type and value; a value field with **Set** and **Default**, or **Add** and **Remove** for a `set` | Writes the variable through the same coercion as the launcher. A refused value shows the coercion error |
| Anti-cheat | `checking`, `updating`, `ready`, `unavailable`, `error`, `simulated` | Sets `anticheat.status` with `simulated: false` in the preview and the splash, or returns to the simulation |
| Feed | A JSON file path with **Apply**; **Pack defaults**; **Fetch now** | Applies the file as a feed body (schema errors are shown), restores the pack's data files, or fetches the pack's feed now |
| Simulation | **Offline**; **Open URLs in the browser** | Offline: feed fetches fail and the current data stays, and `open_url` reports a browser failure (`linkFailed`). The second switch makes `open_url` open the real browser |
| Error keys | `linkFailed`, `pickFailed` | Writes that core error key into the pack's `error_state` variable |
| Time | An RFC 3339 time such as `2026-10-31T18:00:00Z`; **Fix time**, **System** | Overrides `now` and `today` for calendars, `countdown` and `age()`, or returns to the system clock |
| Splash, reload | **Open splash** / **Reopen splash**; **Reload now** | Opens the splash window with the current overrides; reloads the pack from disk |

## The launcher fields

- **progress** is 0 to 100. **installed** and **client** set `launcher.installed_version` and
  `launcher.client_version`; empty fields keep the current values.
- **downloaded**, **total** (bytes), **speed** (bytes per second) and **eta** (seconds) set the
  download fields. With all four empty, the simulated values stay: `game.download_size` ×
  progress. Otherwise empty ones are absent (`none`), so you can test a template with an unknown
  size or speed.
- A frozen launcher stays frozen across reloads and across a reopened preview, until you click
  **Resume**.

Outside the preview, in the real launcher of today, these values come from the simulated update.
See [Start here](../../getting-started/overview/) for the preview limitations.

## Log tab

The **Log** tab shows:

- **Actions**: the actions whose effects are outside the preview: `open_url` (after the
  allowed-host check), `play`, `minimize` and `close`.
- **Render log**: the runtime's diagnostics of the preview and the splash, such as
  `ERROR template` lines, missing resources and `t()` fallbacks to the default language. Each
  distinct line shows once per reload; repeats count in place (`line ×N`).
- **Live state**: every declared state value as JSON.

## Check your pack before building

1. Visit every page in every language.
2. For each page, click every launcher phase, then `ready` and **Open splash**.
3. Click every anti-cheat status, including `error`, which the simulation never produces.
4. Freeze `downloading` with empty download fields and with explicit values, including a large
   `total` and an empty `speed`.
5. Toggle **Offline** and use a link; click both error keys and check how your `error_state`
   element shows them.
6. If the pack has a feed or time-based content, apply a feed file with edge cases and fix the
   time before and after your events.
7. Set each settings variable to every allowed value, then **Default**.
8. Keep the **Log** tab's render log empty, and run [`launcher-toolkit check`](../studio-checks/).

