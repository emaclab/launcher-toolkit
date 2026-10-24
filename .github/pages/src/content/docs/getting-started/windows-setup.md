---
title: Windows setup
description: Install the toolkit in your user directory, configure an editor, and manage project versions.
sidebar:
  order: 2
---

The toolkit supports **Windows x64**. No Rust toolchain, Node.js, npm, WebView2, CSS compiler, or
separate Studio installation is needed for pack development.

## Install once

Follow [Download and install](../release-tools/) to verify the executable, then run:

```powershell
.\.tools\launcher-toolkit.exe install
```

The toolkit uses `%USERPROFILE%\.local\bin`. It updates only your user `PATH`; administrator
rights and system-wide changes are not needed. Open a new terminal afterwards.

```powershell
launcher-toolkit version
launcher-toolkit help
```

You can also run a portable copy with its full path. Do not install several versions under
competing folders in `PATH`.

## Create or open a project

```powershell
launcher-toolkit init my-game
cd my-game
launcher-toolkit dev
```

Opening the toolkit without arguments provides the terminal menu. Project commands accept the
project folder or its `pack/` folder and default to the current folder. An existing project needs
a complete pack, usually under `pack/`, and its `.toolkit-version` file next to that folder.

## Project version

New starters include `.toolkit-version`, for example `v0.3.0`. Commit it with the project.
`dev`, `check`, and `build` refuse to run when the pin differs from the executable's version and
name the `launcher-toolkit update --version <pin>` command to run; they never change the pin or
download a toolkit themselves.

Updating the CLI is explicit, and changing a project's pin is also an explicit change. Check and
build the project after a version change, then commit the pin and any required fixes together.
The included CI reads this file.

## Editor encoding and filenames

Save text as **UTF-8 without BOM**. Windows PowerShell 5.1 writes a BOM with
`Set-Content -Encoding UTF8` and `Out-File`; use an editor or an explicitly BOM-free writer.
A BOM at the beginning of JSON can cause `expected value at line 1 column 1`.

Keep the starter's `.gitattributes` so Git does not convert line endings. Pack filenames use
ASCII letters, digits, `.`, `_`, and `-`; each path segment starts with a letter or digit.
Do not create filenames that differ only in letter case.

## Styles

The starter uses plain `styles/app.css`. The toolkit uses the CSS files listed in `pack.json` as
they are: it does not install, download, or run a CSS compiler. If you choose Tailwind CSS or
another preprocessor, install and run it yourself, keep its input outside `pack/`, and commit the
generated CSS. See [styles and optional Tailwind](../../guides/tailwind-styles/).

## Preview data

Pack Studio keeps its preview profile separate from installed launcher settings, under
`%LOCALAPPDATA%\EMAC LAB\Launcher Toolkit\Studio\`. Use the command's `--data-dir` option for an
isolated preview or check run. Reset only a profile you intend to remove; never delete a game's
installed data to reset a development preview.
