---
title: Command line
description: Every launcher-toolkit command, option, and exit code.
sidebar:
  order: 7
---

```text
launcher-toolkit                                    terminal menu
launcher-toolkit init [destination]
                     [--name <name>] [--game-id <id>] [--non-interactive]
launcher-toolkit dev [project-or-pack] [--data-dir <dir>]
launcher-toolkit check [project-or-pack] [--json]
launcher-toolkit build [project-or-pack] [--out <file.zip>] [--out-dir <dir>]
launcher-toolkit install
launcher-toolkit uninstall
launcher-toolkit update [--version vX.Y.Z]
launcher-toolkit version
launcher-toolkit help
```

Pass option values as the next argument (`--out dist/pack.zip`, not `--out=dist/pack.zip`) and
quote paths with spaces. Duplicate or unknown options are errors.

`dev`, `check`, and `build` take a project folder or its `pack/` folder, default to the current
folder, and require the project's `.toolkit-version` to name the running version. They never change
the pin or download a toolkit.

| Exit code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Operation, check, or download failed |
| `2` | Invalid invocation |

Errors print as `launcher-toolkit: <message>`; an invalid invocation also prints the command list.

## Terminal menu

Without arguments, in an interactive terminal: **Create project**, **Open project** (runs `dev` on
a folder), **Help**, **Exit**.

## init

Creates a project from `launcher-starter.zip` of the same release, verified against the release
metadata. It writes the game name and ID into `pack/pack.json`, the window titles into
`pack/window.json`, and the tag into `.toolkit-version`, and publishes the project only once all of
that succeeded. The destination must be empty or absent, and its parent must exist.

Interactive runs ask for missing values; `cancel` stops without writing. With `--non-interactive`,
the name defaults to the destination folder name and the ID to a slug of the name. The ID must
match `[a-z0-9-]{1,64}` and the name must be a valid [game name](../pack-json/#game-name).

## dev

Opens [Pack Studio](../../guides/studio/). `--data-dir` replaces the Studio's data root for
throwaway runs.

## check

Runs the [checks](../../guides/checks/) once. Errors exit with `1`; warnings alone do not.
`--json` prints `{"errors":[...],"warnings":[...]}`, each finding with `check`, `file`, `line`,
and `message`.

## build

Checks, then writes the [build](../../guides/build/) outputs: `--out` for the ZIP, `--out-dir` for
the same files in a folder, `dist/pack.zip` beside the pack folder by default. Findings and
progress go to stderr; the JSON report goes to stdout.

## install, uninstall, update

- `install` copies the running executable to `%USERPROFILE%\.local\bin\launcher-toolkit.exe` and
  adds the folder to the user `PATH`, without administrator rights. It refuses to replace a file
  there that it did not install.
- `uninstall` removes only that executable and the `PATH` entry `install` added.
- `update` downloads `--version vX.Y.Z`, or the latest release without it, verifies its SHA-256 and
  size, and replaces the executable you ran. Project pins never change by themselves.

Downloads are cached under `%LOCALAPPDATA%\EMAC LAB\Launcher Toolkit\cache\` and verified again
against fresh release metadata before each use.

## version, help

`version`, `--version`, and `-V` print the version; `help`, `--help`, and `-h` print the command
list. `--help` or `-h` after any other command (`launcher-toolkit check --help`) prints the same
list and exits with `0` without running the command; after `--`, it is read as a path.
