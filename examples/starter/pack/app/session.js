// The core's update and launch state: launcher.snapshot, one frozen and complete presentation
// per revision, pushed to launcher.subscribe callbacks (launcher.d.ts `Snapshot`):
//   phase: checking | downloading | verifying | blocked | ready | launching | launched | launch_failed
//   progress (0 to 100), installedVersion, clientVersion,
//   checkFailed: a failed check stays in `checking` until retry or repair,
//   blocked: [{ name, pid }] while `blocked`,
//   download: { downloaded, total, speed, eta }, each null when unknown,
//   anticheat: { status: checking | updating | ready | unavailable | error, simulated },
//   message: the last anti-cheat error { title, message, dismissible } until retry, or null.
import { useLayoutEffect, useState } from "../vendor/preact.js";

/** Shown until the first snapshot, if the core has not pushed one before the scripts run. */
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

/** The snapshot, re-rendering on every new one. */
export function useSession() {
  const [session, setSession] = useState(() => launcher.snapshot ?? WAITING);
  useLayoutEffect(() => launcher.subscribe(setSession), []);
  return session;
}

/** Ask the core for `play`, `check`, `retry`, `repair` or `forceClose`. The session checks the
 * request again: accepting the call does not mean it runs. */
export function request(op) {
  launcher.request(op);
}
