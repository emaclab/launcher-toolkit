---
title: Styles and optional Tailwind
description: Use plain CSS or let the toolkit obtain and run its pinned Tailwind compiler when needed.
sidebar:
  order: 4
---

Both starters use `pack/styles/app.css` directly. Editing that file is enough to customize colors,
fonts, spacing, and layout. **No compiler download is needed for plain CSS.**

## Use Tailwind optionally

If you want Tailwind, create `pack/styles/input.css` with:

```css
@import "tailwindcss" source(none);
@source "../templates";
```

Keep `styles/app.css` listed in `pack.json` `styles`. Never list `styles/input.css` there.
The input is authoring source, not a runtime stylesheet.

```powershell
launcher-toolkit styles
launcher-toolkit styles --watch
```

`styles` writes `styles/app.css`. `--watch` rebuilds after source CSS or template changes; stop it
with Ctrl+C. Preview and build also prepare required Tailwind output when the project has
`styles/input.css`.

## Compiler management

The toolkit downloads its supported Tailwind version from the official release when first needed.
It verifies the SHA-256 before running the compiler and caches the executable under your Windows
Local AppData. Do not download, rename, colocate, or add Tailwind to `PATH` yourself.

The supported compiler is Tailwind **4.3.3**. A verified cached copy can be used offline.
If it is not cached and the download fails, the command reports the problem rather than pretending
that stale CSS is current. Retry with network access. Packs without `styles/input.css` do not
need this download.

The included [project CI](../ci/) restores this managed compiler cache only when
`pack/styles/input.css` exists. It uses the exact toolkit release and checksum as the cache identity;
the CLI still checks the compiler's pinned hash before every execution. Only successful
default-branch pushes save the cache. Plain-CSS projects skip both compiler acquisition and caching.

### CSS-only configuration

JavaScript configuration and plugins (`@config` and `@plugin`) are not supported.
The toolkit rejects them before starting the compiler, including in imported stylesheets.
Use CSS directives such as `@theme` and literal utility classes instead.

`@import` and `@reference` can use the bundled `tailwindcss` styles or explicit relative
`.css` paths such as `./theme.css` and `../styles/shared.css`. Relative stylesheets must stay
inside `pack/`. External URLs, other packages, and paths outside the pack are refused.


## Commit the output

Commit `styles/app.css` alongside `styles/input.css` and template changes. This keeps the pack
self-contained. The generated stylesheet uses paths relative to `styles/`, for example:

```css
@font-face {
  font-family: "Game UI";
  src: url("../assets/fonts/ui.woff2") format("woff2");
}
```

Supply the actual licensed font file before using this rule.

## Class names and supported CSS

Keep Tailwind class names literal in templates. Use complete choices such as
`{{ 'row selected' if selected else 'row' }}` rather than concatenating partial class names.
Style generated Markdown with descendant selectors; its output is not a template source.

Do not import another project's stylesheet or depend on files outside your pack.
Compiled utilities still need to use [supported CSS](../../reference/restrictions/).
For example, `:has()`, sticky positioning, and backdrop filters are not supported by the launcher.
