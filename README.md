# Launcher Toolkit

One Windows executable for creating, previewing, checking, and building launcher packs.

- [Documentation](https://emaclab.github.io/launcher-toolkit/)
- [Download](https://github.com/emaclab/launcher-toolkit/releases)
- [Quickstart](https://emaclab.github.io/launcher-toolkit/getting-started/quickstart/)
- [Starters and license](https://emaclab.github.io/launcher-toolkit/getting-started/starters/)

## Get started

Download the Windows x64 toolkit and `SHA256SUMS` from the same release. Verify the hash before
running it, rename it to `launcher-toolkit.exe`, then install for your Windows user:

```powershell
.\launcher-toolkit.exe install
```

The CLI installs into `%USERPROFILE%\.local\bin` without administrator rights. Open a new terminal.

```powershell
launcher-toolkit init my-game
cd my-game
launcher-toolkit dev
launcher-toolkit check
launcher-toolkit build
```

Without arguments, the executable opens a terminal menu. Updates and removal are explicit:

```powershell
launcher-toolkit update --version v0.2.0
launcher-toolkit uninstall
```

## What the release provides

| Asset | Use |
| --- | --- |
| `launcher-toolkit-vX.Y.Z-windows-x64.exe` | Project creation, Studio, simulator, checks, styles, builds, and reference |
| `launcher-starter-minimal-vX.Y.Z.zip` | Small complete project, downloaded by `init` |
| `launcher-starter-complete-vX.Y.Z.zip` | Full example project, downloaded by `init` |
| `SHA256SUMS` | Download integrity checks |
| `THIRD_PARTY_NOTICES.html` | Bundled dependencies' notices |

Starters use plain CSS. No separate Studio or manual Tailwind installation is required.
The toolkit obtains its pinned Tailwind compiler only for projects that use it.
A project's `.toolkit-version` is used by its included Windows CI.

Starter downloads retain the restricted license for EMAC Anti-Cheat-integrated games. Public
availability does not grant unrestricted use. The current game update, anti-cheat status, and game
start are simulated; these controls let you test pack presentation.

## Runnable example

The original small pack remains under [`examples/minimal-pack/`](examples/minimal-pack/).
Run these commands from this repository with the matching toolkit version:

```powershell
launcher-toolkit dev examples/minimal-pack
launcher-toolkit check examples/minimal-pack
launcher-toolkit build examples/minimal-pack --out "$env:TEMP\minimal-pack.zip"
```

## Documentation development

Only editing this documentation needs Node.js 24 LTS and npm:

```sh
npm ci
npm run dev
npm run build
```

Open `http://localhost:4321/launcher-toolkit/`. Keep public guides focused on authoring commands,
pack files, and usable examples. Do not add implementation sources, administrative instructions,
private repository references, or credentials.

## Optional Tailwind notice

The automatically acquired standalone Tailwind CSS CLI retains the MIT License:

```text
MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
