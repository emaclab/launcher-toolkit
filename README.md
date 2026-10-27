# Launcher Toolkit

Create your game's launcher interface with HTML, CSS, and JavaScript. **Launcher Toolkit** is one Windows x64 executable for project creation, live preview, simulation, headless checks, and deterministic pack builds.

[Documentation](https://emaclab.github.io/launcher-toolkit/) · [Download](https://github.com/emaclab/launcher-toolkit/releases) · [Quickstart](https://emaclab.github.io/launcher-toolkit/getting-started/quickstart/) · [Starter license](examples/starter/LICENSE)

## Start a project

Download `launcher-toolkit-windows-x64.exe` from a [release](https://github.com/emaclab/launcher-toolkit/releases). **[Verify its SHA-256 and size](https://emaclab.github.io/launcher-toolkit/getting-started/install/#download-and-verify) before running it.** Rename it to `launcher-toolkit.exe` and install it for your Windows user:

```powershell
.\launcher-toolkit.exe install
```

No administrator rights are needed. The executable goes into `%USERPROFILE%\.local\bin`; open a new terminal to use the updated user `PATH`.

```powershell
launcher-toolkit init my-game
cd my-game
launcher-toolkit dev
launcher-toolkit check
launcher-toolkit build
```

The destination for `init` must be empty or absent. To automate project creation:

```powershell
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

No Rust, Node.js, npm, WebView2, or CSS compiler is needed to author a pack. Pack Studio is included in `dev`.

## What you build

A pack is the complete interface of one game: main and splash documents, JavaScript modules, ready-to-use CSS, translations, data, artwork, and bundled libraries. It uses format `1` and core API `1`. The native `launcher` bridge provides session snapshots, launch requests, JSON reads and requests, external links, window controls, and storage.

Your project pins its toolkit release in `.toolkit-version`. Keep that file in source control; local commands and the included Windows workflow use it. Toolkit downloads, including cached downloads, are checked against GitHub's current asset SHA-256 and size.

| Command | Result |
| --- | --- |
| `dev` | Native preview, hot reload, session simulator, log, bridge reference |
| `check --json` | Headless boot and session checks for main and splash, with network denied |
| `build` | Complete checks, then `dist/pack.zip` and a JSON report on stdout |
| `build --out dist/pack.zip --out-dir dist/pack` | ZIP and an inspectable folder containing the same runtime bytes |

A local build does not create a launcher executable or installer, sign content, or publish it. Publishing is connected to an authorized game's repository through provider onboarding. Keep administrative credentials out of pack projects.

## Runnable starter

[`examples/starter/`](examples/starter/) is the complete example project in Preact + htm with plain CSS, Portuguese/English/Spanish translations, and Windows CI:

- **Home:** carousel, scroll-aware artwork, countdown, highlights.
- **News:** search, read state, article selection, Markdown.
- **Updates:** game-client release notes, tabs, pagination, check and repair.
- **Calendar:** month grid, recurring events, event dialogs.
- **Servers:** online/maintenance/offline presentation, remote data and cache.
- **About:** game information, requirements, FAQ, external links.
- **Settings:** validated preferences, language, folder selection, reset confirmation.
- **Splash and launch bar:** session phases, anti-cheat status, blocked processes, recovery actions, native brand placeholder.

With the toolkit release named in `examples/starter/.toolkit-version`, run from this repository's root:

```powershell
launcher-toolkit dev examples/starter
launcher-toolkit check examples/starter --json
launcher-toolkit build examples/starter --out examples/starter/dist/pack.zip
```

The preview simulates update, anti-cheat, and game launch. It does not install game files or run the production SDK/driver. Sample `example.com` URLs are not a provisioned data service; replace them and their host allowlists before distribution.

The starter's [`examples/`](examples/starter/examples/) directory contains a paired polygon JSON/CSS example. All application data and libraries ship inside `pack/`; branches contain complete projects without external inheritance.

## License

The starter is publicly available under a **restricted license for games integrated with EMAC Anti-Cheat**, not an open-source license. Retain [`LICENSE`](examples/starter/LICENSE) in derivative repositories. Preact and htm keep their own licenses under [`pack/vendor/`](examples/starter/pack/vendor/).

## Repository map

| Location | Contents |
| --- | --- |
| [`examples/starter/`](examples/starter/) | Editable launcher project, bridge types, license, workflow, configuration examples |
| [`.github/pages/`](.github/pages/) | Public manual, built with Astro/Starlight |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | Documentation build and GitHub Pages deployment |

For site development, see [the site README](.github/pages/README.md). The toolkit release provides `launcher-toolkit-windows-x64.exe` and `launcher-starter.zip`.
