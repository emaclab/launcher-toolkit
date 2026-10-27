---
title: Launch bar
description: Show the session phase and progress, and offer each launch action only where the session accepts it.
sidebar:
  order: 2
---

The launch bar is the part of the main window players use most. The starter's `app/launch-bar.js`
renders every phase, the download details, the programs that block an update, and the anti-cheat
status, and offers exactly the actions the session accepts.

## Follow the snapshot

`app/session.js` re-renders on every snapshot and keeps a waiting state until the first one:

```js
const WAITING = Object.freeze({
  phase: "checking",
  progress: 0,
  installedVersion: 0,
  clientVersion: 0,
  checkFailed: false,
  blocked: [],
  download: { downloaded: null, total: null, speed: null, eta: null },
  anticheat: { status: "checking", simulated: false },
  message: null,
});

export function useSession() {
  const [session, setSession] = useState(() => launcher.snapshot ?? WAITING);
  useLayoutEffect(() => launcher.subscribe(setSession), []);
  return session;
}
```

## Actions per state

| State | Actions |
| --- | --- |
| `blocked` | **Close programs** (after a confirmation listing `snapshot.blocked`) and **Retry** |
| `checkFailed` or `launch_failed` | **Repair** and **Retry** |
| `ready`, anti-cheat `ready` | **Check for updates** and **Play** |
| `ready`, anti-cheat `error` | **Check for updates**, and **Retry** in place of Play |
| `ready`, other anti-cheat status | **Check for updates**, Play disabled |
| Any other phase | Play disabled |

```js
const { phase, checkFailed: failed, progress, anticheat } = session;
const retry = failed || phase === "blocked" || phase === "launch_failed" || (phase === "ready" && anticheat.status === "error");
return html`
  <div class="launch-actions">
    ${phase === "blocked" &&
    html`<button key="force-close" class="secondary" onClick=${() => openDialog({ type: "forceClose" })}>${t("forceClose")}</button>`}
    ${phase !== "blocked" &&
    (failed || phase === "launch_failed") &&
    html`<button class="secondary" key="repair" onClick=${() => request("repair")}>${t("repair")}</button>`}
    ${phase === "ready" &&
    !failed &&
    html`<button class="secondary" key="check" onClick=${() => request("check")}>${t("checkUpdates")}</button>`}
    ${retry
      ? html`<button key="retry" class="play" onClick=${() => request("retry")}>${t("retry")}</button>`
      : html`<button key="play" class="play" disabled=${phase !== "ready" || anticheat.status !== "ready"} onClick=${() => request("play")}>${t("play")}</button>`}
  </div>`;
```

The session still checks every request. Hiding an action is about clarity, not safety: a stale
click is simply refused.

## Progress and details

- `checking`, `verifying`, and `launching` have no meaningful percentage: show an indeterminate
  bar. In `downloading` and `blocked`, show `progress`.
- With `checkFailed`, the phase stays `checking`: label it as a failure, not as a running check.
- In `downloading`, `download.downloaded`, `total`, `speed` (bytes per second), and `eta`
  (seconds) may each be `null`; show only what is known.
- In `blocked`, list `snapshot.blocked` by `name`.
- Show `snapshot.message.message` while it is set; it stays until a `retry` is accepted.

## Closing programs

`forceClose` ends the listed programs, which may lose unsaved work. The starter asks first, in a
`Modal` that lists them, and shows that dialog only while the phase is still `blocked`:

```js
const Dialog = dialog && (dialog.type !== "forceClose" || session.phase === "blocked") ? DIALOGS[dialog.type] : null;
```

## Try every state

In Pack Studio, pick each phase chip, press **Block** during a download and **Fail** during a
check or launch, and set each anti-cheat status. `launcher-toolkit check` sends all of these states
to your windows and fails on any JS error.
