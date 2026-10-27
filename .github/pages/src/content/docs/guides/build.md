---
title: Build
description: Write the deterministic pack ZIP or its byte-identical folder, and read the build report.
sidebar:
  order: 3
---

```powershell
launcher-toolkit build [project-or-pack] [--out <file.zip>] [--out-dir <dir>]
```

`build` runs the complete [checks](../checks/) on the files it is about to package, then writes
the pack from those same bytes. Errors stop it and **nothing is written**; warnings are shown and
do not block. Without options, the output is `dist/pack.zip` beside the pack folder.

## What goes into the pack

Every file under `pack/` ships, except hidden entries (names starting with `.`), which are left
out and listed in the report. Symbolic links and junctions are refused. Keep notes, README, CI,
and preprocessor input outside `pack/`.

| Limit | Value |
| --- | --- |
| Files | 4096 |
| One file, uncompressed | 32 MiB |
| All files, uncompressed | 128 MiB |
| ZIP | 64 MiB |
| Path | 255 bytes, segments `[A-Za-z0-9][A-Za-z0-9._-]*` |
| Paths that differ only in letter case | Refused |

## Outputs

- **`--out <file.zip>`** writes the ZIP atomically; a failed run leaves no partial file.
- **`--out-dir <dir>`** writes the same files the ZIP holds, byte for byte, plus a `.build-pack`
  marker (a hidden name, so it never ships). An existing folder is replaced only if it is empty or
  carries that marker.

The two outputs must not overlap each other or the pack folder. With `--out-dir` only, no ZIP is
written.

To preview a built folder, copy the pin into it. A pack folder not named `pack` carries its own
pin, and the hidden file never enters the pack:

```powershell
launcher-toolkit build --out-dir dist/preview
Copy-Item .toolkit-version dist/preview/.toolkit-version
launcher-toolkit dev dist/preview
```

## Report

stderr carries the findings and a summary; stdout carries one JSON object:

```text
0 error(s), 0 warning(s)
built example-game (43 files, 111657 bytes, sha256 3e9154f97f17484fa309339db9cb3ebb010246b83d4986591cfa474f3f00ab37)
```

```json
{
  "core_api": 1,
  "excluded": [],
  "files": ["app/data.js", "app/dates.js", "…", "vendor/preact.js", "window.json"],
  "game_id": "example-game",
  "game_name": "Example Game",
  "sha256": "3e9154f97f17484fa309339db9cb3ebb010246b83d4986591cfa474f3f00ab37",
  "size": 111657
}
```
The digest and size above are an example report. Editing any runtime file changes them; use the report from your own build when checking its artifact.


| Field | Meaning |
| --- | --- |
| `core_api` | The core API the pack declares |
| `game_id`, `game_name` | `game.id` and `game.name` of `pack.json` |
| `sha256`, `size` | SHA-256 (lowercase hex) and size of the ZIP |
| `files` | Every path in the pack, sorted |
| `excluded` | Every path left out, sorted |

Save and verify it in PowerShell:

```powershell
New-Item -ItemType Directory -Force dist | Out-Null
launcher-toolkit build --out dist/pack.zip > dist/pack.json
$report = Get-Content dist/pack.json | ConvertFrom-Json
$report.sha256 -eq (Get-FileHash dist/pack.zip -Algorithm SHA256).Hash.ToLowerInvariant()   # True
```

## Reproducible builds

The same files and toolkit version always produce the same ZIP bytes. Keep `.gitattributes`
(`* -text`) so checkouts keep the bytes. To compare two builds file by file:

```powershell
launcher-toolkit build --out-dir dist/a
# change something
launcher-toolkit build --out-dir dist/b
git diff --no-index --stat dist/a dist/b
```

A local build is for review: it does not sign or publish the pack and creates no launcher
executable or installer.
