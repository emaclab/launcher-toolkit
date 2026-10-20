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
2. Run `launcher-toolkit init my-game` and choose the minimal or complete starter.
3. Open the new project and run `launcher-toolkit dev`.
4. Save your edits, then run `launcher-toolkit build`.

The [quickstart](../quickstart/) gives the full commands. No separate template repository,
Studio installation, Node.js, npm, or Rust installation is needed.

## Commands to learn

| Command | Use |
| --- | --- |
| `init` | Create a project from a verified versioned starter |
| `dev` | Open the preview and simulator panel |
| `check` | Check configuration, templates, widgets, assets, and translations |
| `build` | Run complete checks and generate the pack ZIP |
| `styles` | Compile optional Tailwind input; the toolkit manages the compiler |
| `reference` | Read or export the supported widget and template reference |

Open the executable without arguments to use the terminal menu.

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
| `.toolkit-version` | Project/CI tool version; change it explicitly when upgrading |

Keep each pack complete. Do not depend on files in another branch or starter.
Both starters use ordinary CSS; Tailwind is optional.

## Check presentation

Visit every page and language. Try keyboard navigation, empty content, long text, errors,
launcher phases, and the splash. The current game download, game start, and anti-cheat status
are **simulated**. They do not install or start a game client.

A selected folder is a stored preference, not permission for the pack to read or write its files.
See [restrictions](../../reference/restrictions/) for supported HTML, CSS, and asset paths.

## Useful terms

| Term | Meaning |
| --- | --- |
| Source pack | The complete folder you edit |
| Built pack | ZIP or output folder created by `build` |
| Core API | Pack feature level declared in `core_api`; current examples use `2` |
| State | Declared values used by templates, widgets, actions, and settings |
| Widget | Behavior configured through `data-widget` and documented attributes |

Read the [starter license](../starters/#license) before using starter content for a game.
