---
title: window.json
description: Sizes, titles, icon, shape, and entry document of the main window and the splash.
sidebar:
  order: 2
---

`window.json` is required. Unknown fields are errors.

```json
{
  "icon": "assets/icon.ico",
  "base_color": "#0f141c",
  "main": {
    "title": "Example Game Launcher",
    "entry": "index.html",
    "width": 1120,
    "height": 630,
    "polygon": null
  },
  "splash": {
    "title": "Example Game",
    "entry": "splash.html",
    "width": 640,
    "height": 360,
    "polygon": null,
    "duration_ms": 4000
  }
}
```

| Field | Rule |
| --- | --- |
| `icon` | A `.ico` file of the pack, used by both windows |
| `base_color` | `#rrggbb`, the color behind the document |
| `main.title`, `splash.title` | Native window title |
| `main.entry`, `splash.entry` | The `.html` document the window opens, up to 2 MiB |
| `width`, `height` | Positive integers, in logical pixels |
| `polygon` | `null`, or at least 3 `[x, y]` points inside the window |
| `splash.duration_ms` | Required, ≥ 1000; how long Pack Studio shows the splash |

`main` does not accept `duration_ms`. The splash duration is a preview setting: in the launcher,
the session decides when the splash closes.

Windows are borderless, not resizable, and open centered. Draw your own title bar, and move the
window with [`launcher.window.drag()`](../bridge/#links-folders-and-the-window).

## Shaped windows

`polygon` becomes the Win32 window region. Give the document's root element the same shape with
`clip-path`: the region does the real clipping, while `clip-path` only paints, and hit testing
ignores it. Points are rounded to the display's DPI. From the starter's
`examples/window-polygon.json` and `examples/polygon.css`:

```json
"polygon": [[0, 0], [1106, 0], [1120, 14], [1120, 630], [14, 630], [0, 616]]
```

```css
.app {
  clip-path: polygon(0 0, 1106px 0, 1120px 14px, 1120px 630px, 14px 630px, 0 616px);
}
```

`check` warns when the first element covering the window with a `clip-path` does not resolve to the
same vertices in the same cyclic order (0.5 px tolerance), when a polygon has no `clip-path`, or
when a `clip-path` exists with `polygon: null`.
