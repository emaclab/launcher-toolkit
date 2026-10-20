---
title: scroll
description: Copy a container's scroll offset into float state for scroll-linked styling, and snap to anchors after scrolling stops.
sidebar:
  order: 17
---

`scroll` connects a scrollable container to a `float` state variable. Use that value to fade artwork, pause a carousel, or show a back-to-top button. Configure `data-snap` to snap to anchors after scrolling stops.

| | |
| --- | --- |
| Core API | 1 |
| Element | The scroll container (`overflow-y: auto` or `scroll` with a bounded height) |
| Reads | `data-snap`, `data-snap-offset`, `data-snap-delay` |
| Writes | `data-scroll-state` (`float`) |
| Keyboard | None (the renderer has no keyboard scrolling) |

## Attributes

| Attribute | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `data-scroll-state` | `float` state name | no | — | Receives the vertical scroll offset in CSS px. |
| `data-snap` | comma-separated list | no | — | Snap anchors: `start`, `end`, a number in px, or a CSS selector of a descendant. |
| `data-snap-offset` | number or selector | no | `0` | Subtracted from selector anchors: a number in px, or the layout height of the first element matching the selector (for example a fixed header). |
| `data-snap-delay` | int ms | no | `0` | Idle time after the last movement before snapping. |

## Behaviour

**Scroll-linked value.** The state value follows the container's vertical scroll offset, including smooth and programmatic scrolling.

**Anchors.** Each entry of `data-snap` resolves to an offset clamped to `[0, end]`:

- `start` is 0; `end` is the maximum scroll offset;
- a number is that offset in px;
- a selector is the matched descendant's top inside the scroll content, minus `data-snap-offset`. An anchor whose selector matches nothing is skipped.

**Snap rule.** After the offset has not changed for `data-snap-delay` ms:

1. If the offset is within 0.5 px of an anchor, nothing happens.
2. Otherwise the target is the nearest anchor **in the direction of the last wheel input** (or of the last movement when there was no wheel input), reached with a smooth scroll. Even a small wheel step can leave an anchor this way.
3. New wheel input cancels a snap scroll in progress.

The [`scroll_to`](../../reference/actions/#focus-and-scrolling) action resolves its target exactly like an anchor, including `data-snap-offset`, so buttons can jump to the same positions.

## State

```json title="pack.json (state)"
"home_scroll": { "type": "float", "default": 0, "reset": "page" }
```

The variable must be `float`; an `int` refuses the writes. `reset: "page"` matches the new page, whose container starts at the top.

## Example: two-stop page with snapping

```html title="templates/pages/home.html"
<div id="home-scroll" class="home-scroll" data-widget="scroll" data-scroll-state="home_scroll"
     data-snap="start, .home-details, end" data-snap-offset="20" data-snap-delay="180">
  <section class="hero" style="opacity:{{ [1 - state.home_scroll / 500, 0.35]|max|num }}">
    <h1>{{ game.name }}</h1>
  </section>
  <button class="scroll-hint" data-on-click="scroll_to('#home-scroll', '.home-details')">{{ t("more") }} ↓</button>
  <div class="home-details">
    <p>{{ t("aboutText") }}</p>
    <button class="back-top" data-on-click="scroll_to('#home-scroll', 'start')">{{ t("backTop") }} ↑</button>
  </div>
</div>
```

```css title="styles (excerpt)"
/* The container needs a bounded height and its own overflow. */
.home-scroll { height: 436px; overflow-x: hidden; overflow-y: auto; }
```

```json title="i18n/en.json (strings)"
"more": "More",
"backTop": "Back to top",
"aboutText": "A competitive online game for Windows."
```

Use `|num` for every number written into CSS: it prints the shortest form (`0.35`, `1`) without exponent.

## Example: back-to-top button without snapping

```html title="templates/pages/about.html"
<div class="about-page">
  <div id="about-scroll" class="about-scroll" data-widget="scroll" data-scroll-state="about_scroll">
    …long content…
  </div>
  {%- if state.about_scroll > 160 %}
  <button class="back-top floating" data-key="about-top" data-on-click="scroll_to('#about-scroll', 'start')">{{ t("backTop") }} ↑</button>
  {%- endif %}
</div>
```

The button is rendered conditionally and keyed, so it is not a hidden Tab stop when the page is at the top.

## Composition

- Pause a [`carousel`](../carousel/) once it scrolls away: `data-paused="{{ state.home_scroll >= 200 }}"`.
- A fixed header outside the container is the usual `data-snap-offset` selector (`data-snap-offset=".window-header"`), since `position: sticky` is not available.

## Accessibility

- The renderer has no keyboard scrolling, so give long scroll areas `scroll_to` buttons ("More ↓", "Back to top") or keep all content reachable by focus movement.
- Snapping moves content after the player stops; keep `data-snap-delay` long enough (150–250 ms) that it does not fight slow scrolling.

## Pitfalls

- Without a bounded height and `overflow-y: auto`, the container never scrolls and the state stays 0.
- `data-snap` without `data-scroll-state` is valid; `data-scroll-state` without `data-snap` is valid too.
- Selector anchors must be **inside** the container.

