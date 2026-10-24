---
title: anticheat-mark
description: Add the required anti-cheat mark placeholder to your splash template and check its size and placement.
sidebar:
  order: 21
---

Add an empty `anticheat-mark` element to reserve space for the EMAC LAB mark in your splash. Do not add a logo image file to the pack.

| | |
| --- | --- |
| Core API | 1 |
| Element | One empty element in the splash template |
| Reads | The element's layout box |
| Writes | Nothing |
| Keyboard | None |

## Rules

1. The splash template must contain one `data-widget="anticheat-mark"` element. Only the layout box of the **first** one counts.
2. The box must be at least **120 × 24** logical px.
3. The box must lie entirely inside the window, and inside `window.json` `splash.polygon` when there is one: all four corners inside or on the boundary, no polygon edge entering the box, and no polygon vertex strictly inside it.
4. The mark is centered inside the box at full opacity. Do not try to hide, fade, cover, transform, or animate it.
5. If the placeholder is missing, has no box (for example `display: none`), or breaks rule 2 or 3, the core paints the mark at 171 × 34 logical px in the bottom-right corner, 24 px from both edges, and logs the reason.

A placeholder in the main window is ignored with a log line. The pack must **not** contain the EMAC LAB mark image itself.

## Example

```html title="templates/splash.html"
<main class="splash" lang="{{ lang }}">
  <h1 class="splash-title">{{ game.name }}</h1>
  <p class="splash-status">{{ t("splashStarting") }}</p>
  <div class="splash-protection">
    <span>{{ t("protectedBy") }}</span>
    <div class="splash-mark" data-widget="anticheat-mark"></div>
  </div>
</main>
```

```css title="styles (excerpt)"
.splash { position: relative; width: 100%; height: 100%; }
.splash-protection { position: absolute; right: 24px; bottom: 20px; display: flex; align-items: center; }
/* 171 x 34 is the mark's natural size; anything from 120 x 24 works. */
.splash-mark { width: 171px; height: 34px; margin-left: 10px; }
```

```json title="i18n/en.json (strings)"
"splashStarting": "Starting the game…",
"protectedBy": "Protected by"
```

An inline style works as well: `<div data-widget="anticheat-mark" style="width:171px;height:34px"></div>`.

## Design notes

- The mark is the light horizontal logo with a transparent background. Place it on a dark, calm area of the splash.
- Keep the box's aspect ratio near 5:1; the mark is fitted with "contain", so a taller box leaves empty space above and below.
- The splash has no actions, so the mark is not interactive.

## Checking

`launcher-toolkit check` runs the `mark` check against rules 1–3 and warns on a violation. Open the splash from Studio's panel to see the result. See [windows and splash](../../reference/windows/) for the splash lifecycle.

