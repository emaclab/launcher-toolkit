---
title: Pack Studio
description: Preview a pack in the launcher's own renderer with hot reload, and use every launcher-toolkit command, including the generated widget reference.
sidebar:
  order: 1
---

Open Pack Studio with `launcher-toolkit dev`. The preview and its control panel are part of the
Windows toolkit; there is no separate Studio executable to install.

## Commands

```text
launcher-toolkit dev [project-or-pack] [--data-dir <dir>]                       preview + control panel
launcher-toolkit check [project-or-pack] [--json] [--data-dir <dir>] [--feed <feed.json>]  complete checks
launcher-toolkit build [project-or-pack] [--out <file.zip>] [--out-dir <dir>] [--data-dir <dir>]
launcher-toolkit reference [--out <file.md>]                                    the widget reference
```

| Command | Page |
| --- | --- |
| `launcher-toolkit dev` | This page and the [state simulator](../state-simulator/) |
| `launcher-toolkit check` | [Studio checks](../studio-checks/) |
| `launcher-toolkit build` | [build](../build/) |
| `launcher-toolkit reference` | [Below](#generate-the-widget-reference) |

`project-or-pack` is the project folder (with `pack/pack.json`) or the pack folder itself; it
defaults to the current folder. The project's `.toolkit-version` must name the running toolkit
version. `--data-dir` selects an isolated Studio profile; use it for throwaway runs.
Exit codes are `0` for success, `1` for a failed operation or check, and `2` for incorrect usage.
The [command-line reference](../../reference/tool-cli/) lists every option.

## Preview

```powershell
launcher-toolkit.exe dev pack
```

The **preview** shows your pack at the size, shape, colors, and styles configured in its files,
with the launcher's own renderer. The **control panel** has four tabs:

| Tab | Content |
| --- | --- |
| Simulator | Page, language, launcher phase and progress, scenarios, state variables, anti-cheat status and message, feed, offline mode, error keys, fixed time, splash, reload. See [state simulator](../state-simulator/) |
| Checks | The errors and warnings of the last reload, with file and line. The tab title shows their counts |
| Log | Actions with effects outside the preview, the render log, and the live state as JSON |
| Reference | The widget, action, function, context, schema-key, and data-document reference of this core version |

Pack Studio refuses a folder without `pack.json`. The preview opens only when the pack passes
every error check; until then the panel lists the errors.

## Hot reload

The toolkit watches the whole pack folder and reloads 150 ms after the last change; temporary files
and names that start with `.` are ignored. Save a template, stylesheet, translation, data, or asset
file to update the preview. A reload runs the same checks as `launcher-toolkit check` and replaces
the preview only after the new pack renders with the current values.

Compatible state values, the selected page, and the selected language stay in place.
If a declaration no longer accepts a state value, its default applies.
If you remove the selected page or language, the configured fallback is used.

If a change fails validation or rendering, the preview keeps its last working pack, values, page,
language, launcher state, and splash. Open **Checks** and **Log**, fix the reported file and line,
then save again. Preference writes and feed changes are applied only after a successful reload.

### Changes that reopen the preview

These changes open a new preview window, built before the old one closes, while retaining its
page, language, and compatible state:

- `window.json` `width`, `height`, or `base_color`;
- an image or font that a stylesheet `url()` names.

A changed main `polygon` or title applies to the open window. An open splash reopens when its
`window.json` entry or `base_color` changed.

### Generated CSS

The toolkit does not run CSS preprocessors. If you generate `styles/app.css` with Tailwind CSS or
another tool, run its watcher in a separate terminal; the preview reloads when the generated file
changes. See [styles and optional Tailwind](../tailwind-styles/).

## What the preview does not do

- Actions with effects outside the preview are logged in the panel's **Log** tab instead:
  `open_url` (after the allowed-host check), `play` (the preview stays open), `minimize` and
  `close`. A panel switch makes `open_url` open the browser for real. `pick_folder` opens the
  real folder dialog, and `drag` moves the preview window.
- Launcher requests (`play`, `check`, `retry`, `repair`, `force_close`) change only the simulated
  launcher; the log records whether each was accepted. No game files are checked or downloaded, no
  process is closed, and no anti-cheat runs.
- Studio keeps its preview data separate from installed launcher settings.
- Saving a file changes only your local preview.

## Generate the widget reference

```powershell
launcher-toolkit.exe reference --out reference.md
```

Without `--out`, the Markdown goes to stdout. `reference` takes no project path and does not
need a `.toolkit-version`. Use this reference to check the features supported by your installed
tool version. The first line identifies the core API:

```text
# Pack reference (core API 3)
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

The generated file lists the items a pack declaring the current core API can use; actions removed
in core API 3 (`pause`, `resume`, `cancel`) are not listed. The panel's **Reference** tab shows the
same entries. Use it when you add an element, and keep the generated file next to the tools of the
same release. These docs explain the same items in [widgets](../../widgets/),
[actions](../../reference/actions/) and [templates](../../reference/templates/).
