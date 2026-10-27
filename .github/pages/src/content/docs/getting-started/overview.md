---
title: Overview
description: What a launcher pack is, how the launcher runs it, and how the toolkit fits into your work.
sidebar:
  order: 1
---

A **launcher pack** is the complete interface of one game's launcher: HTML documents, JavaScript
modules, CSS, data, translations, and assets. The launcher core opens two borderless windows, the
**main window** and the **splash**, and runs one pack document in each. The pack owns its DOM, its
pages, its UI state, its translations, and its language.

The core owns everything else: policy, file and network I/O, the Win32 windows, the update and
launch session, and the EMAC LAB anti-cheat mark. A pack reaches the core only through one typed
object, [`launcher`](../../reference/bridge/).

```text
pack/
  pack.json        game identity and allowed hosts
  window.json      window sizes, titles, icon, and each window's entry document
  index.html       main window document
  splash.html      splash document
  app/             your ES modules
  vendor/          libraries the pack brings, such as Preact
  styles/          ready-to-use CSS
  i18n/, data/     JSON the pack reads with launcher.readJson
  assets/          icon and images
```

Only `pack.json`, `window.json`, and the two entry documents are required. `app/`, `i18n/`,
`data/`, and `vendor/` are conventions of the starter, not folders the core knows.

## How a window runs

1. The core loads the window's entry from `http://pack.localhost/`. The document declares its own
   stylesheets and scripts, classic or `type="module"`.
2. Your script reads its data, renders, and calls `launcher.ready()`. The window appears only then.
3. `launcher.snapshot` holds the session state (phase, progress, download, anti-cheat), and
   `launcher.subscribe` delivers every new snapshot.
4. The main window asks the session for actions with `launcher.request("play")` and the other
   [requests](../../reference/bridge/#requests). The session decides whether they run.

There are no `fetch`, XHR, or page navigation. Remote JSON comes through `launcher.fetchJson`, and
links open in the browser through `launcher.openUrl`, each restricted to the hosts listed in
`pack.json`.

## The toolkit

`launcher-toolkit` is one Windows x64 executable:

| Command | Use |
| --- | --- |
| `init` | Create a project from the starter of the same release |
| `dev` | Pack Studio: live preview with hot reload and a simulator panel |
| `check` | Run the pack headless and report errors and warnings |
| `build` | Check, then write the deterministic `pack.zip` and its report |
| `install`, `update`, `uninstall` | Manage the executable for your Windows user |

The [starter](../starter/) is a complete launcher written with Preact and htm, without a build step.
Start from it, or bring another library: a pack ships its own copy of every library it uses.

## Terms

| Term | Meaning |
| --- | --- |
| Project | A folder with `pack/`, `.toolkit-version`, README, license, and CI |
| Pack | The `pack/` folder; every file in it ships to players |
| Built pack | The `pack.zip` that `build` writes |
| Bridge | The `launcher` object the core gives each document |
| Snapshot | The frozen session state in `launcher.snapshot` |
| Session | The core's update and launch state machine, which revalidates every request |
| Pack Studio | The preview and simulator opened by `launcher-toolkit dev` |
