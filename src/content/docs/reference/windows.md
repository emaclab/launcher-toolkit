---
title: Windows and splash
description: window.json fields, logical pixels, polygons, splash behavior, and required branding.
sidebar:
  order: 2
---

`pack/window.json` controls the main and splash windows. Unknown fields are rejected. Both windows are borderless, non-resizable, and centered on the current monitor.

## Fields

| Field | Type | Contract |
| --- | --- | --- |
| `icon` | String | Existing pack-relative `.ico` file under `assets/`; shared by both windows |
| `base_color` | String | Exactly an RGB hex color, `#rrggbb`; renderer clear color before and under content |
| `main.title` | String | Main window title |
| `main.template` | String | Existing template name relative to `templates/` |
| `main.width`, `main.height` | Positive integers | Client dimensions in logical pixels |
| `main.polygon` | Array of `[x,y]` or `null` | At least three points, all inside the client bounds; `null` means rectangular |
| `splash.title` | String | Splash title |
| `splash.template` | String | Existing splash root template |
| `splash.width`, `splash.height` | Positive integers | Splash dimensions in logical pixels |
| `splash.polygon` | Array or `null` | Same rules as the main polygon |
| `splash.duration_ms` | Integer | At least `1000`; measured from the first visible splash frame |

Do **not** put `duration_ms` in `main`; that field is rejected there.

```json
{
  "icon": "assets/icon.ico",
  "base_color": "#0f141c",
  "main": {
    "title": "Example Game Launcher",
    "template": "layout.html",
    "width": 1120,
    "height": 630,
    "polygon": null
  },
  "splash": {
    "title": "Example Game",
    "template": "splash.html",
    "width": 640,
    "height": 360,
    "polygon": null,
    "duration_ms": 4000
  }
}
```

These dimensions match the neutral starter. If you change them, update the root layout, splash layout, and positioning CSS together.

## Window controls

The pack must provide any visible controls it needs:

```html
<div class="titlebar" data-on-mousedown="drag()"></div>
<button aria-label="Minimize" data-on-click="minimize()">−</button>
<button aria-label="Close" data-on-click="close()">×</button>
```

For translated UI, replace the labels with `t()` calls and add the keys to all languages. Do not attach drag behavior to the whole page: it conflicts with interactive content. See the [action reference](../actions/).

## Nonrectangular windows

A CSS `clip-path` only affects painting in this renderer; it does not restrict hit testing. Set a matching `polygon` in `window.json` to create the actual Windows input region. Otherwise invisible corners can intercept clicks.

For example, these values describe the same clipped corner shape:

```json
"polygon": [[0, 0], [1096, 0], [1120, 24], [1120, 630], [24, 630], [0, 606]]
```

```css
.launcher {
  width: 1120px;
  height: 630px;
  clip-path: polygon(0 0, 1096px 0, 1120px 24px, 1120px 630px, 24px 630px, 0 606px);
}
```

Use logical pixels for polygon coordinates. Run Studio checks and inspect the shape at multiple Windows display scales.

## Splash behavior

The splash accepts no actions. Set `splash.duration_ms` to its visible duration. Test it with **Open splash** in Studio. The current game launch is simulated; it does not start a game client.

A splash needs an anti-cheat mark placeholder:

```html
<div class="splash">
  <h1>{{ game.name }}</h1>
  <div class="emac-mark" data-widget="anticheat-mark"
       style="width:171px;height:34px"></div>
</div>
```

Supply CSS that keeps the placeholder inside the splash bounds. The core provides the mark itself; do not add an EMAC LAB logo file to your pack.

## Anti-cheat mark restrictions

- Only the first `data-widget="anticheat-mark"` box determines placement.
- Its box must be at least **120 × 24 logical pixels**.
- The entire box must fit inside the window and any polygon, including concave edges.
- The core fits and centers the mark at full opacity above the document. CSS cannot hide, cover, fade, transform, or animate it.
- If the box is missing or invalid, the core draws a **171 × 34** fallback mark, 24 pixels from the bottom/right edges, and logs the reason.
- Put the placeholder in the splash, not the main-window template.

The mark is not a substitute for licensing or actual game integration. Use the starter only under its EMAC Anti-Cheat integration terms, and retain third-party asset licenses.

## Verification

Check the main window's title, icon, control actions, and drag area. Preview the splash, verify the mark remains visible, and confirm it closes on schedule. Inspect polygon corners and display scaling in native Studio, not in a browser: browser rendering is not the launcher contract.

