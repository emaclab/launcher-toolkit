---
title: Customize a launcher
description: Turn the complete starter into your game's launcher, from identity and artwork to content, host permissions, and review.
sidebar:
  order: 1.5
---

Start with a project created by [`init`](../../getting-started/quickstart/), or the extracted starter ZIP. Keep its `LICENSE`, `.toolkit-version`, `.gitattributes`, and bundled library notices. Work on the complete project, not only its `pack/` directory.

## 1. Set the game identity

Edit `pack/pack.json` with the `game.id` assigned during onboarding and the final `game.name`. The installed game and the pack must agree on both. The name selects the player's data directory, so choose it before distribution.

Set `main.title` and `splash.title` in `pack/window.json`. Replace `assets/icon.ico` with your Windows icon and `assets/images/logo.svg` with your game's artwork. Do not include your own EMAC LAB mark: the core draws that mark in the splash's placeholder.

`game.client_version` is the game client's integer version. It is not a pack version. Packs have no version or ID of their own.

## 2. Replace sample destinations

Search your project for `example.com`. It appears in several places with different responsibilities:

| Location | Change |
| --- | --- |
| `game.links` in `pack.json` | Your HTTPS website, community, and support URLs |
| `game.allowed_hosts` | Hosts the external browser may open, including links in Markdown |
| `game.network_hosts` | Hosts that may serve JSON to `launcher.fetchJson` |
| `REMOTE` in `app/data.js` | News, calendar, and server JSON endpoints |
| `data/` documents | Article, event, and highlight links |

A permitted host includes its subdomains, but not similarly named domains. Browser permissions and JSON permissions are separate. They do not grant arbitrary scripts, fonts, or stylesheets network access.

The sample endpoints are addresses to replace, not hosted services. Keep local documents so the launcher can render without a working remote source. If you choose local-only data, remove the corresponding source from `REMOTE` and its now-unused JSON host permission.

## 3. Edit content and translations

Follow the [content examples](../../patterns/content/) and [calendar example](../../patterns/calendar/). Retain stable IDs when editing an existing article or event: read state and detail lookup depend on them.

Change all supported translation files under `i18n/`. UI labels live in `strings`; dates, weekdays, language names, and decimal formatting live alongside it. A data field can be plain text or a map of language codes to text. The [language pattern](../../reference/storage/#language) describes language selection.

## 4. Adjust the interface

The main document loads `app/main.js`, which chooses page modules through the `PAGES` map. Add a page by creating its module, registering it in that map, adding its navigation entry and translations, and supplying its content. Internal navigation is application state; anchors and `location` do not change documents.

Edit `styles/app.css` directly. If using a preprocessor, keep the input outside `pack/`, compile separately, and commit the output. See [styles](../styles/) for runtime limitations.

Use the starter's [components](../../patterns/components/) for dialogs, menus, and keyboard interaction. Render closed controls conditionally and keep global input listeners on `window`.

## 5. Review main and splash

Run `launcher-toolkit dev` and inspect:

- every page in every supported language, including long titles and empty content;
- keyboard navigation, dropdown closure, modal focus return, and destructive-action confirmation;
- offline local content, cached content, and invalid remote data;
- all session phases, failed check, blocked programs, and launch failure;
- every anti-cheat status, especially `ready` with anti-cheat `error` or `unavailable`;
- the splash and its native mark before, during, and after simulated launch;
- the selected window geometry, especially if applying the polygon example.

Pack Studio is a simulator, not a production SDK or file synchronization test. A browser rendering your HTML is not proof that the native renderer supports its layout.

## 6. Build for review

From the project root:

```powershell
launcher-toolkit check --json
launcher-toolkit build --out dist/pack.zip --out-dir dist/pack
```

Errors block output; warnings need review. The built folder contains the same runtime bytes as the ZIP, plus its hidden build marker. Do not place documentation, preprocessor inputs, or credentials in `pack/`.

Commit the complete project. Its [Windows workflow](../ci/) builds a review artifact with the pinned public toolkit. Publishing requires provider onboarding and an authorized, active game repository; generating a ZIP does not configure that service.
