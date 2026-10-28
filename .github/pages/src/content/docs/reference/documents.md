---
title: Documents and runtime
description: How a pack document boots, which files and URLs it may load, execution limits, and the renderer's limits.
sidebar:
  order: 3
---

Each window loads its `entry` from `http://pack.localhost/`. The core renders HTML and CSS with
Blitz and runs JavaScript with Boa. It injects `launcher`, `localStorage`, and `navigator.language`
before your scripts run.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="styles/app.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="app/main.js"></script>
</body>
</html>
```

## Boot

- **Reveal.** The window appears when the script calls `launcher.ready()`. Call it after the first
  render.
- **Boot failure.** An uncaught exception or an unhandled rejection before `ready()`, or 10 s
  without it, fails the boot; the core replaces the document with its own error screen. The time
  counted is when `ready()` is called.
- **After the boot,** JS errors only go to the log.
- **`console.*`** is discarded in the launcher and shown in the Pack Studio **Log** tab.

## Files and scripts

| Kind | Rule |
| --- | --- |
| Entry documents | `.html` files of the pack, up to 2 MiB |
| Scripts | `<script src>`, static `import`, and `import()` of `.js` or `.mjs` pack files, up to 2 MiB each, UTF-8 |
| Stylesheets, fonts, CSS images | Pack files only; `url()` resolves relative to the stylesheet |
| Other files | Anything else; read JSON with `launcher.readJson` |

Query strings and fragments are ignored. A missing file loads empty and is logged; paths outside
the pack, or with `%` escapes or `\`, are refused. Scripts from another host, `file:`, and `data:`
are refused.

The pack brings its own copy of every library it uses; the core provides none. Do not ship an image
of the EMAC LAB mark: the core paints it (see [splash](../splash/)).

## Remote images

`<img src>`, in HTML or set from JS, also accepts an absolute `https://` URL of any host, without
userinfo. CSS and fonts stay pack-only.

- GET with a 10 s timeout, up to 8 MiB, 4 downloads at a time; PNG, JPEG, GIF, or WebP up to 4096 px
  per side that decodes completely.
- A failed or invalid image stays empty, is logged, and is not requested again in that run.
- Images are cached per URL (up to 64 MiB, least recently used first) and appear at once on the
  next start, offline too. The URL is immutable: to change the image, change the URL (`?v=2`).
- Images never delay the reveal.

## No navigation

A document never navigates. `<a href>` does nothing, and `location` and `history` do not change
pages. Render your pages in JS, and open external links with `launcher.openUrl`.

## Execution limits

There is no `fetch` or XHR (use `launcher.fetchJson`), and `import` only loads pack modules.
`eval`, `new Function`, and string timers are allowed. Internal `__blitz_*` globals are out of reach.

| Limit | Value |
| --- | --- |
| Recursion depth | 512 |
| Iterations per loop | 10 000 000 |
| VM stack | 1 MiB |
| UI thread stack | 16 MiB |
| Bridge messages per poll | 64; the rest are dropped and logged |
| One bridge message | 64 KiB |
| Microtasks per checkpoint | 50 000; past that, a JS error and the queue is dropped |

Hitting a limit throws an uncatchable error that ends only the running script, callback, or job. A
long but finite callback freezes the window until it returns: the runtime does not interrupt by
time. The session keeps running on its own thread.

## Renderer limits

Do not rely on `:has`, `:focus-visible`, `:focus-within`, CSS scroll-snap, `position: sticky`,
ellipsis or line-clamp, `mix-blend-mode`, `backdrop-filter`, `filter`, 3D transforms, or the
reduced-motion media query. Implement the behavior in JS and check it in Pack Studio.

- **Focus.** Tab follows DOM order, not positive `tabindex`. Hidden focusable elements still get
  focus: render closed menus and panels conditionally.
- **Visibility.** `visibility: hidden` hides the subtree. Hit testing ignores `clip-path`.
- **Text** renders on the CPU without hinting, with a slight embolden.
- **Line breaks.** In incremental layout, wrappable text measured at its min-content width (for
  example, for the automatic minimum size of a flex item) can keep the line breaks of that
  measurement while the final layout comes from the cache, and the stale break paints over the
  content that follows. Use `white-space: nowrap` on short labels inside flex items.
- **Forms.** There is no `<select>`; build a dropdown with one button per value.
- **Events.** Native keyboard and pointer events bubble through the elements to `window`, never to
  `document`: put global listeners (Escape, focus trap, click outside) on `window`.
- **Checkbox and radio** state exists only after the first layout; a `click()` before it fires the
  events but does not check the control.
- **`unhandledrejection`** does not exist. An unhandled rejection is a JS error and, before
  `ready()`, fails the boot.
