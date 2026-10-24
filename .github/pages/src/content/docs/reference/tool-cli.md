---
title: Command-line tools
description: The Windows toolkit commands for project creation, preview, checks, builds, the reference, installation, and explicit updates.
sidebar:
  order: 7
---

Download `launcher-toolkit-windows-x64.exe` from a [toolkit release](https://github.com/emaclab/launcher-toolkit/releases).
It contains the complete authoring interface. It does not include administrative publication commands.

## Command summary

```text
launcher-toolkit
launcher-toolkit init [destination]
                     [--name <name>] [--game-id <id>] [--non-interactive]
launcher-toolkit dev [project-or-pack] [--data-dir <dir>]
launcher-toolkit check [project-or-pack] [--json] [--data-dir <dir>] [--feed <feed.json>]
launcher-toolkit build [project-or-pack] [--out <file.zip>] [--out-dir <dir>]
                      [--data-dir <dir>]
launcher-toolkit reference [--out <file.md>]
launcher-toolkit install
launcher-toolkit uninstall
launcher-toolkit update [--version vX.Y.Z]
launcher-toolkit version
launcher-toolkit help
```

Pass option values as the next argument, not `--out=file.zip`. Quote paths containing spaces.
Duplicate or unsupported options are errors. Project commands (`dev`, `check`, `build`) accept a
project root or its pack folder, default to the current directory, and require the project's
`.toolkit-version` to name the running version. Keep `.toolkit-version` in the project root, next
to `pack/`.

| Exit code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Operational, validation, download, or check failure |
| `2` | Incorrect invocation |

Errors are printed as `launcher-toolkit: <message>`; an incorrect invocation also prints the
command list.

## Terminal menu

Without arguments, the executable offers **Create project**, **Open project**, **Help**, and **Exit**.
**Open project** asks for a folder and runs `dev` on it. The menu requires an interactive terminal.
Scripts must specify a command.

## init

Creates a complete project with every available widget from `launcher-starter.zip`
of the same toolkit release. It verifies the download against the release metadata, extracts into
a staging folder beside the destination, sets the game name and ID in `pack/pack.json`, the window
titles in `pack/window.json`, and the release tag in `.toolkit-version`, and publishes the complete
project only after preparation succeeds. A nonempty destination is refused, and the parent folder
must exist.

```powershell
launcher-toolkit init my-game
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

The interactive form asks for missing values (destination, game name, game ID). Type
`cancel` to stop. Automation should provide its choices explicitly and use `--non-interactive`;
the name defaults to the destination folder name and the ID to a slug of the name.
The game name must be a valid Windows folder name of 1–64 characters and the ID
must match `[a-z0-9-]{1,64}`. The single starter uses plain CSS and includes the restricted license
and a Windows CI workflow.

## dev

Opens the Pack Studio preview and its control panel. Saves reload the preview. An invalid change
leaves the last working preview visible and reports the findings. Use `--data-dir` for a separate
profile.

```powershell
launcher-toolkit dev
launcher-toolkit dev C:\Games\my-game --data-dir C:\Temp\my-game-preview
```

See [Pack Studio](../../guides/studio/) and the [state simulator](../../guides/state-simulator/).

## check

Runs every Studio check once. Errors return `1`; warnings alone do not fail the command.
`--json` prints `errors` and `warnings` arrays with finding fields `check`, `file`, `line`, and
`message`. `--feed <file>` runs every check with the pack's data merged with that feed body, as the
launcher merges a feed response; an unreadable or non-JSON file returns `1`.

```powershell
launcher-toolkit check
launcher-toolkit check --json
launcher-toolkit check --feed examples/feed.json
```

See [Studio checks](../../guides/studio-checks/).

## build

Runs the complete checks on the pack files and writes the pack from exactly those bytes. Errors
prevent output. Warnings are printed without blocking a successful build.

```powershell
launcher-toolkit build
launcher-toolkit build --out dist/custom.zip --out-dir dist/preview
```

Without output options, the ZIP is `dist/pack.zip` beside the pack folder. With `--out-dir` only,
no default ZIP is added. Output paths must not overlap each other or the pack folder. A nonempty
output folder is replaceable only when marked by a prior build.

Stderr contains findings and progress. Stdout contains one JSON build report with `core_api`,
`excluded`, `files`, `game_id`, `game_name`, `sha256`, and `size`. Save it explicitly when needed:

```powershell
New-Item -ItemType Directory -Force dist | Out-Null
launcher-toolkit build > dist/pack.json
```

See [build](../../guides/build/) and [validation errors](../../guides/validation-errors/).

## reference

Prints the widgets, actions, template functions, context fields, schema keys, and data schemas
that the installed version offers. No project path or pin is needed. Use the output matching your
installed version:

```powershell
launcher-toolkit reference --out widget-reference.md
```

## install, uninstall, and update

`install` copies the running executable to `%USERPROFILE%\.local\bin\launcher-toolkit.exe` and adds
that folder to the user `PATH`. It needs no administrator rights. Open a new terminal afterwards.
It refuses to replace an existing `launcher-toolkit.exe` there that it did not install.

`uninstall` removes the managed executable and the `PATH` entry that `install` added, without
deleting projects, other programs in that folder, or unmanaged `PATH` entries.

`update` is always explicit. Use `--version vX.Y.Z` for a specific release, or omit it to request
the latest release. It downloads `launcher-toolkit-windows-x64.exe`, verifies its SHA-256 and size
against the release metadata, and replaces the executable you ran. Update the project's pin
deliberately after validating compatibility; there is no silent project upgrade. See
[download and install](../../getting-started/release-tools/).

Downloads are cached under `%LOCALAPPDATA%\EMAC LAB\Launcher Toolkit\cache\`; a cached file is
verified again against fresh release metadata before each use.

## Version and help

`version`, `--version`, and `-V` print the tool version. `help`, `--help`, and `-h` print the command list.
