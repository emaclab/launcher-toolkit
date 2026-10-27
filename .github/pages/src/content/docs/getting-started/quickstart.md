---
title: Quickstart
description: Create a project, preview a change, and build a checked pack.
sidebar:
  order: 3
---

[Install the toolkit](../install/) first.

## 1. Create a project

```powershell
launcher-toolkit init my-game
```

Answer the questions for the game name and game ID; type `cancel` at any question to stop without
writing files. Use the values assigned to your game when you have them. For automation:

```powershell
launcher-toolkit init my-game --name "My Game" --game-id my-game --non-interactive
```

`init` downloads the starter of the installed toolkit version, verifies it, and creates the
project. The destination must be empty or absent, and its parent folder must exist.

## 2. Preview

```powershell
cd my-game
launcher-toolkit dev
```

The main window and the Pack Studio panel open. Every saved file reloads the preview:

- change a color in `pack/styles/app.css`;
- change a label in `pack/i18n/en.json`;
- in the panel, press **Fail** while the update runs and watch the launch bar offer **Repair**
  and **Retry**.

See [Pack Studio](../../guides/studio/) for every control.

## 3. Check and build

```powershell
launcher-toolkit check
launcher-toolkit build
```

`check` runs both windows headless through every session state and reports errors and warnings.
`build` runs the same checks, then writes `dist/pack.zip` and prints its JSON report. Errors stop
the build; warnings do not, but fix them too.

## 4. Commit

Commit the whole project, `.toolkit-version` included. The included Windows workflow checks and
builds every push with the pinned toolkit; see [CI](../../guides/ci/).

## Next

- Read the [starter](../starter/) to see where each feature lives.
- [Customize the launcher](../../guides/customize/) with your identity, artwork, content, and authorized hosts.
- Learn the [bridge](../../reference/bridge/): everything a pack can ask of the core.
- Reuse the [patterns](../../patterns/) for launch actions, dialogs, data, and settings.
