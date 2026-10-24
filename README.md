# Launcher Toolkit

One Windows x64 executable for creating, previewing, checking, and building launcher packs.

- [Documentation](https://emaclab.github.io/launcher-toolkit/)
- [Download](https://github.com/emaclab/launcher-toolkit/releases)
- [Quickstart](https://emaclab.github.io/launcher-toolkit/getting-started/quickstart/)
- [Starters and license](https://emaclab.github.io/launcher-toolkit/getting-started/starters/)

## Get started

Download `launcher-toolkit-windows-x64.exe` from a release. Before running it, compare its SHA-256
with the digest that GitHub shows for that asset, as described in
[Download and install](https://emaclab.github.io/launcher-toolkit/getting-started/release-tools/#verify-the-download).
Rename it to `launcher-toolkit.exe`, then install it for your Windows user:

```powershell
.\launcher-toolkit.exe install
```

The CLI installs into `%USERPROFILE%\.local\bin` and updates your user `PATH`, without administrator
rights. Open a new terminal.

```powershell
launcher-toolkit init my-game
cd my-game
launcher-toolkit dev
launcher-toolkit check
launcher-toolkit build
```

Without arguments, the executable opens a terminal menu. Updates and removal are explicit:

```powershell
launcher-toolkit update --version vX.Y.Z
launcher-toolkit uninstall
```

## What the release provides

| Asset | Use |
| --- | --- |
| `launcher-toolkit-windows-x64.exe` | Project creation, preview and simulator, checks, builds, and reference |
| `launcher-starter-minimal.zip` | Small complete project, downloaded by `init --template minimal` |
| `launcher-starter-complete.zip` | Full example project, downloaded by `init --template complete` |

The toolkit verifies every download it makes, including cached ones, against the SHA-256 digest and
size that GitHub publishes for the release asset. There is no separate Studio executable.

Starters use plain CSS. The toolkit consumes the CSS files in the pack and does not install or run a
CSS compiler; an optional preprocessor such as Tailwind CSS runs separately, under its own license.
A project's `.toolkit-version` selects the toolkit release used by its commands and by the included
Windows CI.

Starter downloads retain the restricted license for EMAC Anti-Cheat-integrated games. Public
availability does not grant unrestricted use. The toolkit preview simulates the game update,
anti-cheat status, and game start; these controls let you test pack presentation.

## Runnable example

[`examples/minimal-pack/`](examples/minimal-pack/) is a project with the same files as the minimal
starter: `.toolkit-version`, the restricted `LICENSE`, and a complete `pack/`. Run these commands
from this repository with the toolkit version named in its `.toolkit-version`:

```powershell
launcher-toolkit dev examples/minimal-pack
launcher-toolkit check examples/minimal-pack
launcher-toolkit build examples/minimal-pack --out "$env:TEMP\minimal-pack.zip"
```
