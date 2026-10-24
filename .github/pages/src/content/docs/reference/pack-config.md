---
title: Pack configuration
description: Complete pack.json field reference, identities, API compatibility, and source layout.
sidebar:
  order: 1
---

`pack/pack.json` configures your game's launcher UI. Use valid JSON without comments or trailing commas. Unknown fields are rejected.

## Source layout

Every branch is a complete, independent source pack at `pack/`:

```text
pack/
  pack.json
  window.json
  templates/
    layout.html
    splash.html
    pages/home.html
  styles/
    app.css
  i18n/
    en.json
  data/
  assets/
    icon.ico
    images/
    fonts/
```

`templates/` names are relative to that directory, not to the repository. For example, the window root is `layout.html`, not `templates/layout.html`. Each name uses lowercase ASCII letters, digits, `_`, `-`, and `/`, and ends in `.html`.

The project root next to `pack/` holds `.toolkit-version`, `LICENSE`, the README, CI, and any preprocessor input; none of it enters the pack. Runtime resources are served only from `assets/` and the stylesheets listed in `styles`. See [resources and restrictions](../restrictions/).

## Identity and compatibility

| Value | Meaning | Change policy |
| --- | --- | --- |
| `format` | Pack file format; currently `1` | Use the format supported by the selected toolkit |
| `core_api` | Minimum renderer/action/widget API used by the pack | The current core offers `1` to `3`; declare the API of the newest feature you use |
| `game.id` | Your project's game ID | Use the ID provided for your project; keep it unchanged for themes |
| `game.client_version` | Positive game client version | Separate from the toolkit version and the pack content |
| Toolkit release `vX.Y.Z` | Version of the authoring tools, pinned in `.toolkit-version` | Pin one release in reproducible workflows |

There is **no top-level `id`, `version`, or `extends`**. Each pack must contain all its own files. Do not add overlay or inheritance fields.

## Top-level fields

Use all the fields below explicitly, including `null` for disabled feed and error reporting. This keeps authored packs unambiguous.

| Field | Type | Contract |
| --- | --- | --- |
| `format` | Integer | Exactly `1` |
| `core_api` | Integer | `1`, `2`, or `3`; API-gated features require the API that added them |
| `game` | Object | Game fields below |
| `languages` | Object | `default` and ordered `available` list |
| `pages` | String array | Nonempty, unique page slugs; first page is the start page |
| `styles` | String array | Ordered paths of existing `styles/*.css` files; only these stylesheets enter the pack |
| `data` | String array | Unique document slugs; each names `data/<name>.json` |
| `feed` | Object or `null` | HTTPS `url`, integer `refresh_minutes >= 1`; `null` disables it. See [feeds](../localization-data/#feed-configuration-and-transport) |
| `error_state` | String or `null` | Name of a declared string state variable **without `values`**, or `null` |
| `state` | Object | State names mapped to declarations; may be empty |

Page and data names use `[a-z0-9-]+`. A page entry permits `navigate()` to that page; your root template must also render the page. A matching HTML filename alone does not register a route.

## Game fields

| Field | Type | Contract |
| --- | --- | --- |
| `id` | String | `[a-z0-9-]{1,64}` |
| `name` | String | Display name, documented limit 1–64 characters; choose a valid Windows folder name |
| `client_version` | Integer | Positive 32-bit integer: the game client version the launcher expects. When an update finishes, it becomes `launcher.installed_version` |
| `allowed_hosts` | String array | Lowercase hostnames (letters, digits, `-`, `.`), without schemes, ports, or paths; empty means no external links |
| `download_size` | Integer, optional | API 2; positive byte count used for the download size when the update is simulated |
| `links` | Object, optional | String keys to HTTPS URL strings, available as `game.links` |
| `requirements` | JSON, optional | Author-defined presentation data, available as `game.requirements` |
| `info` | JSON, optional | Author-defined presentation data, available as `game.info` |

The preferences directory is `%LOCALAPPDATA%\<game.name> Launcher\`. Avoid reserved Windows characters `<>:"/\|?*`, control characters, trailing dots/spaces, and Windows device names. An installed launcher uses a pack only when its `game.id` and `game.name` match the installation, so keep both stable; changing the name also changes the preferences location.

`allowed_hosts` permits an exact hostname **and its subdomains**. `example.com` therefore permits `support.example.com`, but not `example.com.evil.test`. Put hostnames in the list, not URL strings. An HTTPS entry in `links` does not grant permission by itself: `open_url()` still checks the allowlist.

`requirements` and `info` are content, not executable configuration. A hardware table does not enforce hardware requirements. `download_size` only feeds the simulated update; it does not describe a real download.

## Languages

```json
"languages": { "default": "en", "available": ["en", "pt", "es"] }
```

Codes must be unique two-letter lowercase ASCII strings. The default must appear in `available`. Every listed language needs a complete `i18n/<code>.json`; the list order is the language-menu order. Do not use `en-US` or `pt-BR` as pack codes.

## Minimal configuration example

This is a complete `pack.json`, not a complete pack directory. Supply the referenced window, templates, stylesheet, icon, and English translation file before validation.

```json
{
  "format": 1,
  "core_api": 3,
  "game": {
    "id": "example-game",
    "name": "Example Game",
    "client_version": 1,
    "allowed_hosts": ["example.com"],
    "links": { "website": "https://example.com/" }
  },
  "languages": { "default": "en", "available": ["en"] },
  "pages": ["home"],
  "styles": ["styles/app.css"],
  "data": [],
  "feed": null,
  "error_state": "error",
  "state": {
    "error": { "type": "string", "default": "" }
  }
}
```

Use your project's game ID and display name instead of the example values. Start from a starter to keep the required files and translations.

## Validation checklist

1. Run `launcher-toolkit check` after schema, template, or asset changes.
2. If you use a CSS preprocessor, run it and commit the generated stylesheet.
3. Run `launcher-toolkit build` to validate the runtime file set and write the deterministic ZIP.
4. Preview the source and built output, including every page, language, and launcher phase.
5. Confirm the configuration still uses your project's game ID and display name.

