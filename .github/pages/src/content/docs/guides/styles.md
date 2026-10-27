---
title: Styles
description: Plain CSS, the CSS the launcher renderer supports, fonts and images, and CSS preprocessors.
sidebar:
  order: 4
---

Each document links its own stylesheets with `<link rel="stylesheet">`. The starter uses one plain
`pack/styles/app.css`; editing it is enough to change colors, fonts, spacing, and layout. The
toolkit never installs or runs a CSS compiler.

## Fonts and images

`url()` resolves relative to the stylesheet, and CSS can only load files of the pack:

```css
@font-face {
  font-family: "Game UI";
  src: url("../assets/fonts/ui.woff2") format("woff2");
}
```

A missing `url()` or `@import` target is a `resources` error in `check`. Only `<img>` accepts
remote `https://` images; see [documents](../../reference/documents/#remote-images).

## Supported CSS

The renderer is not a full browser. Do not rely on `:has`, `:focus-visible`, `:focus-within`, CSS
scroll-snap, `position: sticky`, ellipsis or line-clamp, `mix-blend-mode`, `backdrop-filter`,
`filter`, 3D transforms, or the reduced-motion media query. Implement such behavior in JS, as the
starter does for scroll snapping, and check the result in Pack Studio. Text renders without
hinting and does not match browser pixels exactly. See [renderer limits](../../reference/documents/#renderer-limits).

## CSS preprocessors

EMAC does not distribute a preprocessor. If you use one, keep its input **outside** `pack/` and
write its output to `pack/styles/`. Preprocessors usually overwrite their output: move hand-written
rules into the input first. For live work, run its watcher in another terminal while
`launcher-toolkit dev` runs. Keep class names literal in your modules
(`selected ? "row selected" : "row"`, not concatenated fragments) so a class scanner finds them.
The generated CSS still has to stay within the [supported CSS](#supported-css).

Commit the generated CSS. Neither the toolkit nor the CI runs the preprocessor or checks that its
output is current.
