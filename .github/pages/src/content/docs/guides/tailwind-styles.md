---
title: Styles and optional Tailwind
description: Use plain CSS, or generate CSS with Tailwind CSS or another preprocessor that you run yourself, outside the toolkit.
sidebar:
  order: 4
---

Both starters use `pack/styles/app.css` directly. Editing that file is enough to customize colors,
fonts, spacing, and layout. **No compiler is needed for plain CSS.**

The toolkit consumes the stylesheets listed in `pack.json` `styles` exactly as they are in the pack.
`dev`, `check`, and `build` never install, download, or run a CSS compiler, and the starter CI does
not either. A preprocessor is an optional, separate step of your own project.

## Use Tailwind optionally

To use Tailwind CSS, follow its [official CLI installation](https://tailwindcss.com/docs/installation/tailwind-cli)
and its license and download-verification guidance. EMAC does not distribute the compiler.

Keep the input stylesheet **outside** `pack/`, with explicit source detection for the templates.
For example, `styles/input.css` in the project root:

```css
@import "tailwindcss" source(none);
@source "../pack/templates";
```

After installing the version you chose, compile separately:

```powershell
npx @tailwindcss/cli -i ./styles/input.css -o ./pack/styles/app.css --minify
```

The command overwrites the output: move any hand-written rules from `pack/styles/app.css` into the
input first. For a watcher, add `--watch` and run it in another terminal while `launcher-toolkit dev`
is open; the preview reloads when the generated file changes. Run `check` and `build` only after
the output is up to date.

Commit the generated CSS. The toolkit and the CI do not check whether it is current and do not start
the preprocessor. Keep `styles/app.css` listed in `pack.json` `styles`; the input outside `pack/`
never reaches the pack.

## Fonts and images in CSS

Stylesheet URLs resolve relative to the stylesheet, for example:

```css
@font-face {
  font-family: "Game UI";
  src: url("../assets/fonts/ui.woff2") format("woff2");
}
```

Supply the actual licensed font file before using this rule. `check` reports a missing `url()` or
`@import` target as a `resources` error. Stylesheets can only use files of the pack; remote CSS,
fonts, or images in CSS are not loaded.

## Class names and supported CSS

Keep utility class names literal in templates. Use complete choices such as
`{{ 'row selected' if selected else 'row' }}` rather than concatenating partial class names, so
source detection can find them. Style generated Markdown with descendant selectors; its output is
not a template source.

Do not import another project's stylesheet or depend on files outside your pack.
Generated CSS still has to use [supported CSS](../../reference/restrictions/#css-boundaries).
For example, `:has()`, sticky positioning, and backdrop filters are not supported by the launcher.
