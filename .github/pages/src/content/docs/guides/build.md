---
title: build
description: Validate a source pack and write its deterministic ZIP or byte-identical folder with launcher-toolkit build, and read its report.
sidebar:
  order: 5
---

`launcher-toolkit build` validates a complete source pack and creates its built output.
It needs no credentials and runs on Windows x64.

```text
launcher-toolkit build [project-or-pack] [--out <file.zip>] [--out-dir <dir>] [--data-dir <dir>]
```

```powershell
launcher-toolkit.exe build pack --out dist/pack.zip       # build a pack ZIP
launcher-toolkit.exe build pack --out-dir dist/pack       # the exact files of that ZIP
```

The default is the current folder (a project with `pack/`, or a pack folder). Without `--out` and
`--out-dir`, the output is `dist/pack.zip` beside the pack folder, so `dist/pack.zip` in the
project root. With `--out-dir` only, no ZIP is written. The project's `.toolkit-version` must name
the running toolkit version.

## Before building

The command runs the complete Studio checks on the files it is about to package, then writes the
pack from those same bytes. Errors stop the build; warnings are displayed without blocking it.
Unsupported paths and symbolic links are rejected. Excluded files are listed in the report.

**No pack output is written when reading or validation fails.** The toolkit never modifies your
source files; CSS produced by a preprocessor must already be in the pack. See
[styles](../tailwind-styles/).

## What goes into the pack

| Path | Included when |
| --- | --- |
| `pack.json`, `window.json` | Always; both are required |
| `templates/**/*.html` | Template names of lowercase letters, digits, `_`, `-` and `/` |
| `styles/<file>.css` | Listed in `pack.json` `styles` |
| `i18n/<code>.json` | The code is in `languages.available`; every listed code needs its file |
| `data/<name>.json` | The name is in `pack.json` `data`; every listed name needs its file |
| `assets/**` | Always |

Everything else in the pack folder stays out and is listed: notes, unlisted stylesheets, editor
and repository files. Names starting with `.` are skipped; a skipped folder is listed with a
trailing `/`:

```text
excluded: .vscode/
excluded: README.md
excluded: styles/draft.css
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
  launcher-toolkit: dist/pack: the folder is not empty and is not a generated pack output
  ```

- `--out` and `--out-dir` must not overlap, for example a ZIP inside the output folder, and
  neither may overlap the pack folder:

  ```text
  launcher-toolkit: artifact destinations must not overlap
  ```

To preview a built folder, copy the source project's version pin into that folder first.
The pin is development metadata and is deliberately absent from the runtime ZIP:

```powershell
launcher-toolkit build pack --out-dir dist/preview
Copy-Item .toolkit-version dist/preview/.toolkit-version
launcher-toolkit dev dist/preview
```

## Report

stderr carries the findings and the progress lines (`excluded: …` for each excluded path, then a
`built …` summary); stdout carries exactly one JSON object:

```text
0 error(s), 0 warning(s)
built minimal-example (11 files, 28992 bytes, sha256 d1c1cee65c517ae46d74e931c7b1849712a4017b810a37476d563adc5b651c78)
```

```json
{
  "core_api": 3,
  "excluded": [],
  "files": ["assets/icon.ico", "data/news.json", "i18n/en.json", "pack.json", "styles/app.css", "templates/launch-bar.html", "templates/layout.html", "templates/pages/home.html", "templates/pages/settings.html", "templates/splash.html", "window.json"],
  "game_id": "minimal-example",
  "game_name": "Minimal Example",
  "sha256": "d1c1cee65c517ae46d74e931c7b1849712a4017b810a37476d563adc5b651c78",
  "size": 28992
}
```

This example is from the unmodified minimal starter's `pack/` folder (and from
`examples/minimal-pack` in this repository, which has the same files). The actual JSON output is
one line; game metadata and `excluded` change with your project.

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
Keep the starter's `.gitattributes` (`* -text`) to prevent automatic line-ending conversion.
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
| `1` | Reading, validation or writing failed, or `--out-dir` names a folder that `build` did not create; see [validation errors](../validation-errors/) |
| `2` | Invalid invocation or overlapping output paths, such as `--out` inside `--out-dir` |

