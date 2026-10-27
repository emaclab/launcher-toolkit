---
title: Splash and anti-cheat mark
description: When the splash shows, what it may do, and the rules for the required EMAC LAB mark.
sidebar:
  order: 6
---

## The splash

An accepted `play` opens the splash and hides the main window. A failed launch closes the splash
and restores the main window. While the session is in `launching` or `launched`, the launcher
refuses to close any window, Alt+F4 included; the session ends with the game window, a failure,
or a timeout.

The splash has no launch actions, no network, and no `launcher.window`. It reads the snapshot,
pack files with `readJson`, and read-only copies of `localStorage` and the cache. Show the phase
and `snapshot.message`, as the starter's `app/splash.js` does:

```js
function Splash({ name, i18n }) {
  const { t, lang } = i18n;
  const session = useSession();
  const message = session.message;
  return html`
    <main class="splash" lang=${lang}>
      <img class="splash-logo" src="assets/images/logo.svg" alt="" width="88" height="88" draggable="false" />
      <h1 class="splash-title">${name}</h1>
      <p class="splash-status">${t(`phase.${session.phase}`)}</p>
      ${message && html`<p class="splash-alert" role="alert">${message.message}</p>`}
      <div class="splash-protection">
        <span>${t("protectedBy")}</span>
        <div class="splash-mark" data-anticheat-mark></div>
      </div>
    </main>`;
}
```

## The mark

The core paints the EMAC LAB mark above the splash document, at full opacity. Neither CSS nor JS
can hide it; your document only reserves its box.

- The box is the **first** element with the `data-anticheat-mark` attribute, in document order.
  Its opacity, visibility, transforms, and animations are ignored.
- The box must be at least **120 × 24** logical pixels and lie entirely inside the window and its
  polygon. Touching the edge is fine; a concave notch crossing the box invalidates it.
- The mark is centered and scaled to fit the box.
- Without a valid box, the core paints it at 171 × 34 px in the bottom-right corner with a 24 px
  margin and logs why.

The rule applies in every phase, failures included, and does not depend on the anti-cheat status.
`check` validates the box at boot, after every snapshot, and after timers run, and reports a `mark`
error. In the main window the placeholder is ignored.
