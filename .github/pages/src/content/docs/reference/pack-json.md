---
title: pack.json
description: Game identity, core API, and the hosts a pack may open or fetch.
sidebar:
  order: 1
---

`pack.json` is required. Unknown fields are errors.

```json
{
  "format": 1,
  "core_api": 1,
  "game": {
    "id": "demo",
    "name": "Demo",
    "client_version": 1,
    "allowed_hosts": ["example.com"],
    "network_hosts": []
  }
}
```

| Field | Rule |
| --- | --- |
| `format` | `1` |
| `core_api` | `1`, the API this core offers |
| `game.id` | `[a-z0-9-]{1,64}`, assigned at onboarding |
| `game.name` | 1–64 characters, a valid Windows folder name (see below) |
| `game.client_version` | Integer ≥ 1: the version of the game client, not of the pack |
| `game.allowed_hosts` | Lowercase hosts that `launcher.openUrl` may open, each with its subdomains |
| `game.network_hosts` | Lowercase hosts that `launcher.fetchJson` may request, each with its subdomains |
| `game.links` | Optional map of HTTPS URLs |
| `game.requirements`, `game.info` | Optional free JSON your script reads from `pack.json` |
| `game.download_size` | Optional; bytes of the download that Pack Studio simulates |

`allowed_hosts` and `network_hosts` are required, and may be empty. A host also allows its
subdomains: `example.com` covers `news.example.com`.

The pack has no ID or version of its own. The installed game and the pack must agree on
`game.id` and `game.name`.

## Game name

The name sets the player's data folder, `%LOCALAPPDATA%\<game.name> Launcher\`, so changing it
loses saved settings. It must not:

- contain control characters or `<>:"/\|?*`;
- start with a space or end with a dot or space, or be only whitespace;
- be a reserved device name before its first dot, in any letter case: `CON`, `PRN`, `AUX`, `NUL`,
  `COM1`–`COM9`, `LPT1`–`LPT9`, `CONIN$`, `CONOUT$`, `COM¹`–`COM³`, `LPT¹`–`LPT³`. `NUL.txt` and
  `CON .txt` are invalid.

Accents and inner spaces are fine.

## Reading your own fields

Your scripts read `pack.json` like any pack file:

```js
const { game } = await launcher.readJson("pack.json");
document.title = game.name;
```

The starter shows `game.links`, `game.requirements`, and `game.info` on its About page.
