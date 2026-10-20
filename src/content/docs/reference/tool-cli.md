---
title: Command-line tools
description: The Windows toolkit commands for project creation, preview, checks, styles, builds, installation, and explicit updates.
sidebar:
  order: 7
---

Download one executable from a [toolkit release](https://github.com/emaclab/launcher-toolkit/releases).
It contains the complete authoring interface. It does not include administrative publication commands.

## Command summary

```text
launcher-toolkit
launcher-toolkit init [destination] [--template minimal|complete]
                     [--name <name>] [--game-id <id>] [--non-interactive]
launcher-toolkit dev [project-or-pack] [--data-dir <dir>]
launcher-toolkit check [project-or-pack] [--json] [--data-dir <dir>]
launcher-toolkit build [project-or-pack] [--out <file.zip>] [--out-dir <dir>]
                      [--data-dir <dir>]
launcher-toolkit styles [project-or-pack] [--watch]
launcher-toolkit reference [--out <file.md>]
launcher-toolkit install
launcher-toolkit uninstall
launcher-toolkit update [--version vX.Y.Z]
launcher-toolkit version
launcher-toolkit help
```

Pass option values as the next argument, not `--out=file.zip`. Quote paths containing spaces.
Duplicate or unsupported options are errors. Project commands accept a project root or its pack
folder and default to the current directory. Keep `.toolkit-version` in the project root.

| Exit code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Operational, validation, download, or check failure |
| `2` | Incorrect invocation |

## Terminal menu

Without arguments, the executable offers **Create project**, **Open project**, **Help**, and **Exit**.
The menu requires an interactive terminal. Scripts must specify a command.

## init

Creates a complete project from the starter in the same toolkit release. It verifies the download,
extracts into staging, and publishes the complete project only after preparation succeeds.
An existing nonempty destination is refused.

```powershell
launcher-toolkit init my-game
launcher-toolkit init my-game --template complete --name "My Game" --game-id my-game --non-interactive
```

The interactive form asks for missing values. Type `cancel` to stop. Automation should provide
its choices explicitly and use `--non-interactive`. Starters are `minimal` and `complete`; both use
plain CSS and include the restricted license and a Windows CI workflow.

## dev

Opens Studio preview and the simulator panel. Saves reload the preview. An invalid change leaves
the last working preview visible and reports the findings. Use `--data-dir` for a separate profile.

```powershell
launcher-toolkit dev
launcher-toolkit dev C:\Games\my-game --data-dir C:\Temp\my-game-preview
```

See [Studio](../../guides/studio/) and the [state simulator](../../guides/state-simulator/).

## check

Runs every Studio check once. Errors return `1`; warnings alone do not fail the command.
`--json` prints `errors` and `warnings` arrays with finding fields `check`, `file`, `line`, and `message`.

```powershell
launcher-toolkit check
launcher-toolkit check --json
```

See [Studio checks](../../guides/studio-checks/).

## build

Prepares any required Tailwind output and runs the complete checks before creating the pack.
Errors prevent output. Warnings are printed without blocking a successful build.

```powershell
launcher-toolkit build
launcher-toolkit build --out dist/custom.zip --out-dir dist/preview
```

Without output options, the ZIP is `dist/pack.zip` beside the pack folder. With `--out-dir` only,
no default ZIP is added. Output paths must not overlap. A nonempty output folder is replaceable
only when marked by a prior build.

Stderr contains findings and progress. Stdout contains one JSON build report with `core_api`,
`excluded`, `files`, `game_id`, `game_name`, `sha256`, and `size`. Save it explicitly when needed:

```powershell
New-Item -ItemType Directory -Force dist | Out-Null
launcher-toolkit build > dist/pack.json
```

See [build](../../guides/build/) and [validation errors](../../guides/validation-errors/).

## styles

Compiles optional `styles/input.css` into `styles/app.css`. The CLI obtains and verifies the pinned
Tailwind compiler itself. `--watch` recompiles after input/template changes until Ctrl+C.

```powershell
launcher-toolkit styles
launcher-toolkit styles --watch
```

Plain-CSS starters do not need this command. See [styles](../../guides/tailwind-styles/).

## reference

Prints the supported widgets, actions, template helpers, configuration keys, and data schemas.
No project path is needed. Use the output matching your installed version:

```powershell
launcher-toolkit reference --out widget-reference.md
```

## install, uninstall, and update

`install` places the executable in `%USERPROFILE%\.local\bin` and configures the user `PATH`.
It needs no administrator rights. Open a new terminal afterwards.

`uninstall` removes the managed tool without deleting projects or other programs in that folder.

`update` is always explicit. Use `--version vX.Y.Z` for a specific release, or omit it to request the
latest release. Update the project's pin deliberately after validating compatibility; there is no
silent project upgrade. See [download and install](../../getting-started/release-tools/).

## Version and help

`version`, `--version`, and `-V` print the tool version. `help`, `--help`, and `-h` print the command list.
