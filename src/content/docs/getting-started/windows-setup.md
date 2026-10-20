---
title: Windows setup
description: Install the toolkit in your user directory, configure an editor, and manage project versions.
sidebar:
  order: 2
---

The toolkit supports **Windows x64**. No Rust toolchain, Node.js, npm, WebView2, or separate Studio
installation is needed for pack development.

## Install once

Follow [Download and install](../release-tools/) to verify the executable, then run:

```powershell
.\launcher-toolkit.exe install
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

Opening the toolkit without arguments provides the terminal menu. An existing project needs a
complete pack, usually under `pack/`, and its `.toolkit-version` file.

## Project version

New starters include `.toolkit-version`. Commit it with the project. Updating the CLI is explicit;
changing a project's pin is also an explicit change. Check and build the project after a version
change, then commit the pin and any required fixes together. The included CI reads this file.

## Editor encoding and filenames

Save text as **UTF-8 without BOM**. Windows PowerShell 5.1 writes a BOM with
`Set-Content -Encoding UTF8` and `Out-File`; use an editor or an explicitly BOM-free writer.
A BOM at the beginning of JSON can cause `expected value at line 1 column 1`.

Keep the starter's `.gitattributes` so Git does not convert line endings. Pack filenames use
ASCII letters, digits, `.`, `_`, and `-`; each path segment starts with a letter or digit.
Do not create filenames that differ only in letter case.

## Styles

Both starters use plain `styles/app.css`. No style compiler is needed for them.
If you choose Tailwind later, add `styles/input.css`; the toolkit obtains and verifies its pinned
compiler when needed. You do not download, rename, or install the compiler yourself.
See [Tailwind styles](../../guides/tailwind-styles/).

## Preview data

Studio keeps its preview profile separate from installed launcher settings. Use the command's
`--data-dir` option for an isolated preview or check run. Reset only a profile you intend to remove;
never delete a game's installed data to reset a development preview.
