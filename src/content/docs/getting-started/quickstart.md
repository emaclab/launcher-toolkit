---
title: Quickstart
description: Install the toolkit, create a project, preview changes, and build a checked pack.
sidebar:
  order: 4
---

You need a Windows x64 computer, a text editor, and internet access for the first downloads.
You do not need Rust, Node.js, npm, or a separate Studio installation.

## 1. Get the toolkit

Download `launcher-toolkit-v0.2.0-windows-x64.exe` and `SHA256SUMS` from the
[toolkit release](https://github.com/emaclab/launcher-toolkit/releases).
[Verify the download](../release-tools/#verify-the-download) before running it, then rename the
executable to `launcher-toolkit.exe`.

Install it for your Windows user:

```powershell
.\launcher-toolkit.exe install
```

The command installs into `%USERPROFILE%\.local\bin` and configures your user `PATH`.
Open a new terminal before using the short command name.

## 2. Create a project

```powershell
launcher-toolkit init my-game
```

Answer the questions for project name, game ID, and starter. Choose **minimal** for a small
starting point or **complete** for the full set of example pages. Use your project's assigned
values when you have them; keep example values for a local experiment.

The command downloads the starter for the installed toolkit version and verifies it before
creating the project. The target folder must be empty or absent. See [starters](../starters/)
for the license and the files included.

For automation, provide all choices explicitly:

```powershell
launcher-toolkit init my-game --template minimal --name "My Game" --game-id my-game --non-interactive
```

## 3. Preview the pack

```powershell
cd my-game
launcher-toolkit dev
```

The preview and Studio panel open. Save edits under `pack/` to update the preview.
Try changing a color in `pack/styles/app.css` and a label in `pack/i18n/en.json`.
Use the panel to select pages, languages, launcher phases, errors, and the splash.

The game download, game start, and anti-cheat status are simulated. Use them to check your UI,
not to configure a real game client.

## 4. Check and build

```powershell
launcher-toolkit check
launcher-toolkit build
```

`check` lists errors and warnings. `build` runs the complete checks before creating `dist/pack.zip`
and its report. Errors stop the build; warnings are shown but do not stop it. Fix warnings too.

Both starters use ordinary CSS. Tailwind is not needed unless you add `styles/input.css`.
If you do use Tailwind, the toolkit manages its download and compilation.

## 5. Keep the tool version with the project

Commit `.toolkit-version` with your pack. The included Windows CI uses that version, so no GitHub
repository variable is required. See [project CI](../../guides/ci/).

Keep compiled CSS and all referenced assets in the project. Do not commit `.tools/`, build
outputs, or credentials.

## Next steps

- Learn [Studio controls](../../guides/studio/).
- Configure [widgets](../../widgets/).
- Read [pack configuration](../../reference/pack-config/).
- Browse [working examples](../../examples/).
