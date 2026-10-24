---
title: Start here
description: Create, preview, check, and build a launcher pack with one Windows toolkit executable.
sidebar:
  order: 1
---

A **pack** is your game's launcher UI: templates, widgets, CSS, translations, JSON content,
images, and fonts. Use `launcher-toolkit.exe` to create and develop the project.

## Start a project

1. [Download and install](../release-tools/) the Windows toolkit.
2. Run `launcher-toolkit init my-game` to create the complete example with every widget.
3. Open the new project and run `launcher-toolkit dev`.
4. Save your edits, then run `launcher-toolkit build`.

The [quickstart](../quickstart/) gives the full commands. No separate template repository,
Studio installation, CSS compiler, Node.js, npm, or Rust installation is needed.

## Commands to learn

| Command | Use |
| --- | --- |
| `init` | Create a project from the verified starter of the same toolkit release |
| `dev` | Open the preview and the Pack Studio panel, with hot reload |
| `check` | Check configuration, templates, renders, widgets, assets, and translations |
| `build` | Run complete checks and generate the pack ZIP and its report |
| `reference` | Print or export the widget, action, function, and context reference |
| `install`, `update`, `uninstall` | Manage the per-user installation explicitly |

Open the executable without arguments to use the terminal menu. See
[command-line tools](../../reference/tool-cli/) for every option.

## Files to edit

| Files | Changes |
| --- | --- |
| `pack/pack.json` | Game details, pages, languages, content documents, and settings |
| `pack/window.json` | Titles, dimensions, icon, shape, and splash duration |
| `pack/templates/` | Layout, widget markup, page content, and actions |
| `pack/styles/app.css` | Colors, typography, spacing, and layout |
| `pack/i18n/` | Interface translations |
| `pack/data/` | News, slides, events, server status, and other bundled content |
| `pack/assets/` | Local images, fonts, and icons |
| `.toolkit-version` | Toolkit release required by the project and its CI; change it explicitly when upgrading |

Keep each pack complete. Do not depend on files in another branch or starter.
The starter uses ordinary CSS; preprocessors are optional and run outside the toolkit.

## Check presentation

Visit every page and language. Try keyboard navigation, empty content, long text, errors,
launcher phases, and the splash. In the preview, the game update, game start, and anti-cheat status
are **simulated**. They do not install or start a game client.

A selected folder is a stored preference, not permission for the pack to read or write its files.
See [restrictions](../../reference/restrictions/) for supported HTML, CSS, and resource paths.

## Useful terms

| Term | Meaning |
| --- | --- |
| Project | The folder with `.toolkit-version`, `LICENSE`, CI, and the `pack/` folder |
| Source pack | The complete `pack/` folder you edit |
| Built pack | ZIP or output folder created by `build` |
| Core API | Pack feature level declared in `core_api`; the current core and starter use `3` |
| State | Declared values used by templates, widgets, actions, and settings |
| Widget | Behavior configured through `data-widget` and documented attributes |

Read the [starter license](../starters/#license) before using starter content for a game.
