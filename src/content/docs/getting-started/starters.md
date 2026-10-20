---
title: Starters
description: Choose a minimum or complete starter and create a versioned pack project with the toolkit.
sidebar:
  order: 5
---

Create projects with `launcher-toolkit init`; no separate template repository is required.
The command downloads the starter from the matching [toolkit release](https://github.com/emaclab/launcher-toolkit/releases)
and verifies its checksum. The first creation needs internet access; verified cached downloads can
be reused.

## Choose a starter

| Starter | Use |
| --- | --- |
| `minimal` | A small complete pack for learning the files and building a custom layout |
| `complete` | A working launcher with example pages and widget combinations to customize |

Both use **plain CSS** and include an icon, translations, templates, configuration, content,
restricted license, project version pin, and Windows build workflow.

```powershell
launcher-toolkit init my-game
```

Or supply the values for automation:

```powershell
launcher-toolkit init my-game --template complete --name "My Game" --game-id my-game --non-interactive
```

Use a new or empty destination. `init` must not overwrite an existing customized project.

## Project files

```text
.toolkit-version             toolkit release used by the project and CI
.github/workflows/pack.yml    checks and builds on Windows
LICENSE                      restricted starter license; retain it
README.md                    project instructions
pack/
  pack.json                  game, pages, languages, data, and state
  window.json                main window, splash, and icon
  templates/                 layout and page templates
  styles/app.css             plain stylesheet
  i18n/                      interface translations
  data/                      bundled content
  assets/                    local images and icons
```

Each branch must contain all the files needed by its pack. Do not depend on another starter,
branch, or directory for missing files.

## First changes

- Keep the game ID and name provided for your project stable.
- Replace example domains in `game.allowed_hosts` and `game.links`.
- Replace example data, images, and interface text.
- Change colors and layout in `pack/styles/app.css`.
- Run `launcher-toolkit dev`, then `check` and `build`.

The starters do not update existing projects automatically. Review and apply useful starter
changes deliberately rather than replacing customized files.

## License

Starters are public downloads, **not unrestricted open-source templates**. Their included
`LICENSE` prevails over this summary. Use is restricted to launcher packs for games integrated
with **EMAC Anti-Cheat**. Keep the license and copyright notice when copying or modifying starter
content. Public availability does not grant rights beyond that license.

Third-party images, fonts, tools, and other materials retain their own licenses.
