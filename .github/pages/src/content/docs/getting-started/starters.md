---
title: Starter
description: Create a versioned pack project from the single complete example with every widget.
sidebar:
  order: 5
---

Create projects with `launcher-toolkit init`; no separate template repository is required.
The command downloads `launcher-starter.zip` from the
[toolkit release](https://github.com/emaclab/launcher-toolkit/releases) of the same version as the
executable, and verifies its SHA-256 and size against the release metadata. The first creation
needs internet access; a verified cached starter is reused.

## One complete example

The single starter demonstrates every available widget in a working launcher with Home, News,
Updates, Calendar, Servers, About, and Settings pages in Portuguese, English, and Spanish.
It uses **plain CSS**, pack format `1`, and `"core_api": 3`. It includes an icon, translations,
templates, configuration, content, the restricted license, the project version pin, and a Windows
build workflow. There is no template selection.

```powershell
launcher-toolkit init my-game
```

Or supply the values for automation:

```powershell
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

Without `--name`, the game name defaults to the destination folder name; without `--game-id`, the
ID is derived from the name. `init` writes the name and ID into `pack/pack.json`, the window titles
into `pack/window.json`, and the release tag into `.toolkit-version`.

Use a new or empty destination whose parent folder exists. `init` refuses a destination that is not
empty and never overwrites a customized project. If you already extracted a starter ZIP, that
folder is already a project; do not run `init` over it.

## Project files

```text
.toolkit-version              toolkit release used by the project and CI
.github/workflows/pack.yml    checks and builds on Windows
.gitattributes                keeps file bytes unchanged in Git
.gitignore                    ignores dist/, .tools/, and a local launcher-toolkit.exe
LICENSE                       restricted starter license; retain it
README.md                     project instructions
pack/
  pack.json                   game, pages, languages, data, and state
  window.json                 main window, splash, and icon
  templates/                  layout and page templates
  styles/app.css              plain stylesheet
  i18n/                       interface translations
  data/                       bundled content
  assets/                     local images and icons
```

The starter also has `examples/` outside the pack: a feed body (`feed.json`), a window
polygon with its matching CSS (`window-polygon.json`, `polygon.css`), and a sample
`preferences.json`. They are not part of the built pack.

Each branch must contain all the files needed by its pack. Do not depend on another starter,
branch, or directory for missing files.

## Starter and the current core API

The starter uses core API 3. Its launch bar handles all eight phases, shows
`launcher.blocked.processes` and `anticheat.message`, and uses `launcher.check_failed` to distinguish
a failed check from a running one. **Retry** and **Repair** appear after a failed check or launch;
**Retry** also handles blocked files and an anti-cheat error in `ready`. Closing programs requires
confirmation, and **Play** is enabled only when the launcher and anti-cheat are both `ready`.
See [launcher actions](../../reference/actions/#launcher-actions) and the
[launch bar example](../../examples/launch-bar/).

## First changes

- Keep the game ID and name provided for your project stable; the name determines the player's
  data folder.
- Replace example domains in `game.allowed_hosts`, `game.links`, and the data.
- Replace example data, images, and interface text.
- Change colors and layout in `pack/styles/app.css`.
- Run `launcher-toolkit dev`, then `check` and `build`.

The starter does not update existing projects automatically. Review and apply useful starter
changes deliberately rather than replacing customized files.

## License

The starter is a public download, **not an unrestricted open-source template**. Its included
`LICENSE` prevails over this summary. Use is restricted to launcher packs for games integrated
with **EMAC Anti-Cheat**. Keep the license and copyright notice when copying or modifying starter
content. Public availability does not grant rights beyond that license.

Third-party images, fonts, tools, and other materials retain their own licenses.
