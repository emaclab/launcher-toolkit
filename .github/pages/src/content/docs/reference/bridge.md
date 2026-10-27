---
title: The launcher bridge
description: Every member of the launcher object, the session snapshot, requests, errors, and network rules.
sidebar:
  order: 4
---

`launcher` is a frozen native object, the only way a pack reaches the core. Its exact shape
(names, signatures, types, error codes, and limits) is `launcher.d.ts`, generated from the core and
included in the starter; the Pack Studio **Reference** tab shows the same file. When this page and
the `.d.ts` differ, the `.d.ts` wins.

## Members per window

What a document does not offer is absent from the object.

| Member | Main | Splash |
| --- | --- | --- |
| `snapshot`, `subscribe(cb)` | ✓ | ✓ |
| `ready()` | ✓ | ✓ |
| `request(op)` | ✓ | — |
| `openUrl(url)` → `Promise<void>` | ✓ | — |
| `pickFolder(start?)` → `Promise<string \| null>` | ✓ | — |
| `window.drag()`, `window.minimize()`, `window.close()` | ✓ | — |
| `readJson(path)` → `Promise` | ✓ | ✓ |
| `fetchJson(url)` → `Promise` | ✓ | — |
| `localStorage` | read and write | read only |
| `cache.put`, `cache.get`, `cache.delete` | ✓ | `get` only |

## Snapshot

`launcher.snapshot` is the session's presentation: a frozen, complete object, new at every
revision. `subscribe(cb)` calls `cb` with each new snapshot and returns the function that
unsubscribes. The snapshot may be absent before the core's first push, so keep an initial state of
your own. Main window and splash see the same revision.

```ts
type Snapshot = {
  phase: "checking" | "downloading" | "verifying" | "blocked" | "ready" | "launching" | "launched" | "launch_failed";
  progress: number;          // 0 to 100, never goes back within one sync
  installedVersion: number;
  clientVersion: number;
  checkFailed: boolean;      // a failed check or sync: stays in `checking` until retry or repair
  blocked: { name: string; pid: number }[];   // only while `blocked`
  download: { downloaded: number | null; total: number | null; speed: number | null; eta: number | null };
  anticheat: { status: "checking" | "updating" | "ready" | "unavailable" | "error"; simulated: boolean };
  message: { title: string; message: string; dismissible: boolean } | null;   // last anti-cheat error, until retry
};
```

- `ready` alone does not allow Play: the anti-cheat must be `ready` too.
- `download` fields are `null` outside `downloading` and `blocked`, or when the size is unknown. In
  `blocked`, `speed` is `0` and `eta` is `null`. `speed` is bytes per second (an exponential
  average); `eta` is seconds.
- `anticheat.simulated` is true only in a simulated anti-cheat scenario of Pack Studio.
- Without a game update configured, the session shows illustrative `checking`, `downloading`, and
  `verifying` phases by time, then `ready`.

## Requests

`launcher.request(op)` only asks. The session revalidates every request against the phase and the
anti-cheat; accepting the call does not mean it runs. An unknown op throws a `TypeError`.

| Op | Accepted when |
| --- | --- |
| `play` | `ready` with anti-cheat `ready`; opens the splash and starts the game |
| `check` | `ready`; runs the check again |
| `retry` | `checkFailed`; `blocked` (try again without closing programs); `launch_failed`; or `ready` with anti-cheat `error` (restarts the anti-cheat and clears `message`) |
| `repair` | `ready`, `launch_failed`, or `checkFailed`; verifies every game file, ignoring the cache |
| `forceClose` | Only `blocked`; closes the listed programs and tries again |

Show each action only in the state that accepts it; see the [launch bar pattern](../../patterns/launch-bar/).

## Links, folders, and the window

- **`openUrl(url)`** opens an HTTPS URL without userinfo whose host is in `allowed_hosts`, or a
  subdomain of one, in the browser. It rejects with `notAllowed` or `browserFailed`; show the error
  yourself.
- **`pickFolder(start?)`** opens the Windows folder dialog, one at a time, starting at `start` when
  it is an existing folder. It resolves with the path, or `null` on Cancel, and rejects with
  `dialogFailed`. The pack gets only the path, not access to the folder; save it in `localStorage`
  if you need it.
- **`window.drag()`** works only inside a primary-button `pointerdown` listener.
- **`window.close()`** is a request; the core refuses it while a launch runs.

## Data and network

- **`readJson(path)`** reads a pack file by relative path (no `..`, drive, scheme, `\`, or `%`), up
  to 2 MiB, and resolves with its parsed JSON. Validate the shape yourself.
- **`fetchJson(url)`** sends an HTTPS GET to a host in `network_hosts`, or a subdomain of one, off
  the UI thread: 10 s timeout, body up to 2 MiB, 4 requests at a time, no redirects. It resolves
  with the parsed JSON of a 2xx response. Only the main window has network.

Your script decides what to fetch, when, and what to cache. See the
[data pattern](../../patterns/data/).

## Errors

Every error the bridge throws or rejects with has `error.code`:

| Code | Cause |
| --- | --- |
| `invalidArgument` | Wrong argument type or shape: unknown op, path outside the pack, TTL out of range |
| `notAllowed` | URL that is not HTTPS, has userinfo, or is outside `allowed_hosts` / `network_hosts` |
| `notFound` | `readJson` of a missing file |
| `tooLarge` | File or body over 2 MiB, folder path over 1024 characters |
| `invalidJson` | File or response that is not JSON |
| `networkDenied` | No network in this document (the headless check) |
| `timeout`, `status`, `network` | `fetchJson`: no answer in 10 s, a non-2xx status (in `error.status`), or a connection failure |
| `browserFailed` | `openUrl`: the browser did not open |
| `dialogFailed` | `pickFolder`: the dialog failed or another one is open |
| `quotaExceeded` | `cache.put` with the 8 MiB quota full |
| `readOnly` | A write in the splash |

The class follows the cause: `TypeError` for `invalidArgument`, `notAllowed`, and `readOnly`;
`RangeError` for `tooLarge` and `quotaExceeded`; `Error` otherwise. Handle the codes you expect
and let the others surface.

From the starter's `app/pages/settings.js`:

```js
launcher
  .pickFolder(settings.screenshots_dir || undefined)
  .then((path) => {
    // Cancel resolves null and keeps the current folder.
    if (path !== null) changeSettings({ screenshots_dir: path });
  })
  .catch((error) => {
    // `dialogFailed` (or another dialog is open) and `tooLarge` (a path over 1024 characters).
    if (error?.code === undefined) throw error;
    showToast("pickFailed");
  });
```
