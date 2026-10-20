---
title: Pack Studio
description: Preview a pack in the launcher's own renderer with hot reload, and use every launcher-toolkit command, including the generated widget reference.
sidebar:
  order: 1
---

Open Pack Studio with `launcher-toolkit dev`. The preview and control panel are included in the
Windows toolkit; there is no separate Studio executable to install.

## Commands

```text
launcher-toolkit dev [<pack-dir>] [--data-dir <dir>]         preview + control panel
launcher-toolkit check [<pack-dir>] [--json] [--data-dir <dir>]  complete checks
launcher-toolkit styles [<pack-dir>] [--watch]               optional Tailwind styles
launcher-toolkit reference [--out <file.md>]                   the widget reference
```

| Command | Page |
| --- | --- |
| `launcher-toolkit dev pack` | This page and the [state simulator](../state-simulator/) |
| `launcher-toolkit check pack` | [Studio checks](../studio-checks/) |
| `launcher-toolkit styles pack` | [Tailwind styles](../tailwind-styles/) |
| `launcher-toolkit reference` | [Below](#generate-the-widget-reference) |

`<pack-dir>` defaults to `pack/`. `--data-dir` selects an isolated Studio profile; use it for throwaway runs.
Exit codes are `0` for success, `1` for a failed operation or check, and `2` for incorrect usage.
The [command-line reference](../../reference/tool-cli/) lists every option.

## Preview

```powershell
launcher-toolkit.exe dev pack
```

The **preview** shows your pack at the size, shape, colors, and styles configured in its files.
The **control panel** has four tabs:

| Tab | Content |
| --- | --- |
| Simulator | Page, language, launcher phase and progress, state variables, anti-cheat status, feed, offline mode, error keys, fixed time, splash, reload. See [state simulator](../state-simulator/) |
| Checks | The errors and warnings of the last reload, with file and line. The tab title shows their counts |
| Log | Actions with effects outside the preview, the render log, and the live state as JSON |
| Reference | The widget, action, function and context reference of this core version |

Pack Studio refuses a folder without `pack.json`. The preview opens only when the pack passes
every error check; until then the panel lists the errors.

## Hot reload

Save a template, stylesheet, translation, data, or asset file to update the preview.
Compatible state values, the selected page, and the selected language stay in place.
If a declaration no longer accepts a state value, its default applies.
If you remove the selected page or language, the configured fallback is used.

If a change fails validation, the preview keeps its last working appearance.
Open **Checks** and **Log**, fix the reported file and line, then save again.

### Changes that reopen the preview

These changes reopen the preview while retaining its page, language, and compatible state:

- `window.json` `width`, `height` or `base_color`;
- an image or font that a stylesheet `url()` names.

A changed main `polygon` or title applies to the open window. An open splash reopens when its
`window.json` entry or `base_color` changed.

### Tailwind in the preview

If `styles/input.css` exists, the toolkit obtains its pinned Tailwind compiler and recompiles
styles when input or templates change. No compiler download is needed for plain CSS packs.
See [Tailwind styles](../tailwind-styles/).

## What the preview does not do

- Actions with effects outside the preview are logged in the panel's **Log** tab instead:
  `open_url` (after the allowed-host check), `play` (the preview stays open), `minimize` and
  `close`. A panel switch makes `open_url` open the browser for real. `pick_folder` opens the
  real folder dialog, and `drag` moves the preview window.
- Studio keeps its preview data separate from installed launcher settings.
- Saving a file changes only your local preview.

## Generate the widget reference

```powershell
launcher-toolkit.exe reference --out reference.md
```

Without `--out`, the Markdown goes to stdout. Use this reference to check the features supported
by your installed tool version. The first line identifies the supported API:

```text
# Pack reference (core API 2)
```

and has these sections:

| Section | Content |
| --- | --- |
| Widgets | Each `data-widget` name with the core API that added it, its attributes (type, required, meaning), the state it reads and writes, keyboard behavior, notes and an example |
| Actions | Each action for `data-on-*` attributes |
| Functions and filters | Each template function and filter |
| Context | The template context fields |
| Schema keys | `pack.json` and language-file keys added after core API 1, such as `game.download_size` |
| Data documents | Data documents with a fixed schema, such as `servers` |

The panel's **Reference** tab shows the same content. Use it when you add an element, and keep
the generated file next to the tools of the same release. These docs explain the same items in
[widgets](../../widgets/), [actions](../../reference/actions/) and
[templates](../../reference/templates/).

