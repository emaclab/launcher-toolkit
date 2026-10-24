---
title: Quickstart
description: Install the toolkit, create a project, preview changes, and build a checked pack.
sidebar:
  order: 4
---

You need a Windows x64 computer, a text editor, and internet access for the first downloads.
You do not need Rust, Node.js, npm, a CSS compiler, or a separate Studio installation.

## 1. Get the toolkit

Download `launcher-toolkit-windows-x64.exe` from the
[toolkit release](https://github.com/emaclab/launcher-toolkit/releases) and
[verify its SHA-256 and size](../release-tools/#verify-the-download) before running it. The script
on that page saves it as `.tools\launcher-toolkit.exe`.

Install it for your Windows user:

```powershell
.\.tools\launcher-toolkit.exe install
```

The command installs into `%USERPROFILE%\.local\bin` and configures your user `PATH`.
Open a new terminal before using the short command name.

## 2. Create a project

```powershell
launcher-toolkit init my-game
```

Answer the questions for the game name and game ID. The single starter includes every widget
and all example pages. Use your project's assigned values when you have them; keep the defaults
for a local experiment. Type `cancel` at any question to stop without writing files.

The command downloads the starter of the installed toolkit version, verifies it, and creates the
project. The target folder must be empty or absent, and its parent folder must exist. See
[starters](../starters/) for the license and the files included.

For automation, provide all choices explicitly:

```powershell
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

## 3. Preview the pack

```powershell
cd my-game
launcher-toolkit dev
```

The preview and the Pack Studio panel open. Save edits under `pack/` to update the preview.
Try changing a color in `pack/styles/app.css` and a label in `pack/i18n/en.json`.
Use the panel to select pages, languages, launcher phases, errors, and the splash.

The preview simulates the game update, the anti-cheat status, and the game start. Use them to check
your UI; they do not install or start a game client.

## 4. Check and build

```powershell
launcher-toolkit check
launcher-toolkit build
```

`check` lists errors and warnings. `build` runs the complete checks before creating
`dist/pack.zip` and printing its JSON report. Errors stop the build; warnings are shown but do not
stop it. Fix warnings too.

The starter uses ordinary CSS, and the toolkit uses the CSS files in the pack as they are. If you
generate CSS with a preprocessor, run it yourself before these commands; see
[styles](../../guides/tailwind-styles/).

## 5. Keep the tool version with the project

Commit `.toolkit-version` with your pack. Every project command checks that it matches the
executable, and the included Windows CI uses the same version, so no GitHub repository variable is
required. See [project CI](../../guides/ci/).

Keep the CSS and all referenced assets in the project. Do not commit `.tools/`, `dist/`, or
credentials; the starter's `.gitignore` already excludes the first two.

## Next steps

- Learn the [Pack Studio controls](../../guides/studio/).
- Configure [widgets](../../widgets/).
- Read [pack configuration](../../reference/pack-config/).
- Browse [working examples](../../examples/).
