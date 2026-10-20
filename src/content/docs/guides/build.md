---
title: build
description: Validate a source pack and write its deterministic ZIP or byte-identical folder with launcher-toolkit build, and read its report.
sidebar:
  order: 5
---

`launcher-toolkit build` validates a complete source pack and creates its built output.
It needs no credentials and runs on Windows x64.

```text
launcher-toolkit build [<pack-dir>] [--out <file.zip>] [--out-dir <dir>]
```

```powershell
launcher-toolkit.exe build pack --out dist/pack.zip       # build a pack ZIP
launcher-toolkit.exe build pack --out-dir dist/pack       # the exact files of that ZIP
```

The default pack folder is `pack/`; the default output is `dist/pack.zip`. Use explicit outputs when needed.

## Before building

The command prepares optional Tailwind styles and runs the complete Studio checks before writing
the pack. Errors stop the build; warnings are displayed without blocking it.
Unsupported paths and symbolic links are rejected. Excluded files are listed in the report.

**No pack output is written when reading or validation fails.** Tailwind can update source `styles/app.css` before another check fails.

## What goes into the pack

| Path | Included when |
| --- | --- |
| `pack.json`, `window.json` | Always; both are required |
| `templates/**/*.html` | Template names of lowercase letters, digits, `_`, `-` and `/` |
| `styles/<file>.css` | Listed in `pack.json` `styles`. `styles/input.css` never is |
| `i18n/<code>.json` | The code is in `languages.available`; every listed code needs its file |
| `data/<name>.json` | The name is in `pack.json` `data`; every listed name needs its file |
| `assets/**` | Always |

Everything else stays out and is listed: `styles/input.css`, notes, editor and repository files.
Names starting with `.` are skipped; a skipped folder is listed with a trailing `/`:

```text
excluded: .vscode/
excluded: README.md
excluded: styles/input.css
```

Check the `excluded` list after you add files: a file listed there does not reach players.

## Outputs

### `--out <file.zip>`

A successful run creates the ZIP. A failed run does not leave a partial output file.

### `--out-dir <dir>`

The folder receives the files read back from the ZIP, so the folder and the ZIP hold the same
files byte for byte. Use it to inspect the exact built files, preview them in Pack Studio, or
compare two builds.

- The folder also gets a marker file `.build-pack`. Names that start with `.` never enter a
  pack, so the marker never ships.
- An existing folder is replaced only if it is empty or has the marker. Any other existing
  folder is refused and stays unchanged:

  ```text
  error: dist/pack: the folder is not empty and was not written by build
  ```

- `--out` and `--out-dir` must not overlap, for example a ZIP inside the output folder:

  ```text
  usage error: --out and --out-dir must not overlap
  ```

To preview a built folder, copy the source project's version pin into that folder first.
The pin is development metadata and is deliberately absent from the runtime ZIP:

```powershell
launcher-toolkit build pack --out-dir dist/preview
Copy-Item .toolkit-version dist/preview/.toolkit-version
launcher-toolkit dev dist/preview
```

## Report

stderr carries human-readable lines; stdout carries exactly one JSON object:

```text
0 error(s), 0 warning(s)
built minimal-example (11 files, 28398 bytes, sha256 5f4204ceb210459acff23e9d27c57fd863bd612a7ebabd8af4f8059565470b04)
```

```json
{
  "core_api": 2,
  "excluded": [],
  "files": ["assets/icon.ico", "data/news.json", "i18n/en.json", "pack.json", "styles/app.css", "templates/launch-bar.html", "templates/layout.html", "templates/pages/home.html", "templates/pages/settings.html", "templates/splash.html", "window.json"],
  "game_id": "minimal-example",
  "game_name": "Minimal Example",
  "sha256": "5f4204ceb210459acff23e9d27c57fd863bd612a7ebabd8af4f8059565470b04",
  "size": 28398
}
```

This example is from the unmodified minimal starter's `pack/` folder. The actual JSON output
is one line; game metadata and `excluded` change with your project.

| Field | Meaning |
| --- | --- |
| `core_api` | The core API the pack declares |
| `game_id`, `game_name` | `pack.json` `game.id` and `game.name` |
| `sha256`, `size` | SHA-256 (lowercase hex) and byte size of the ZIP |
| `files` | Every path in the pack, sorted |
| `excluded` | Every path of the folder left out of the pack, sorted |

Save the report and read it in PowerShell. The redirection needs the `dist` folder to exist:

```powershell
New-Item -ItemType Directory -Force dist | Out-Null
launcher-toolkit.exe build pack --out dist/pack.zip > dist/pack.json
$report = Get-Content dist/pack.json | ConvertFrom-Json
$report.sha256 -eq (Get-FileHash dist/pack.zip -Algorithm SHA256).Hash.ToLowerInvariant()   # True
```

Validation warnings appear on stderr as `warning [category] ...` lines and do not fail the build.
The command runs the same complete checks as [`launcher-toolkit check`](../studio-checks/).

## Compare builds

The same input files and the same tool version produce identical ZIP bytes.
Keep the template's `.gitattributes` (`* -text`) to prevent automatic line-ending conversion.
Excluded files do not affect the output. A change to an included file changes its SHA-256.

To compare two builds file by file:

```powershell
launcher-toolkit.exe build pack --out-dir dist/a
# change something, then
launcher-toolkit.exe build pack --out-dir dist/b
git diff --no-index --stat dist/a dist/b
```

## Limits

| Limit | Value |
| --- | --- |
| ZIP size | 64 MiB |
| Entries | 4096 |
| One file, uncompressed | 32 MiB |
| All files, uncompressed | 128 MiB |
| Path length | 255 bytes |
| Path segment | `[A-Za-z0-9][A-Za-z0-9._-]*` |
| Paths that differ only in letter case | Refused |


## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Built; outputs written |
| `1` | Reading, validation or writing failed; see [validation errors](../validation-errors/) |
| `2` | Invalid invocation or unsafe output paths, such as overlapping `--out` and `--out-dir` |

