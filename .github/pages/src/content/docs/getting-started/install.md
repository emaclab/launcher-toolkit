---
title: Install
description: Requirements, verified download, per-user installation, project version pin, and explicit updates.
sidebar:
  order: 2
---

## Requirements

- **Windows x64.** There are no Linux, macOS, ARM64, or 32-bit builds. Check with
  `$env:PROCESSOR_ARCHITECTURE`; the expected value is `AMD64`.
- A text editor that saves **UTF-8 without BOM**.
- Windows PowerShell or PowerShell 7.
- [Git](https://git-scm.com/), if you want source control and the included CI.

You do not need Rust, Node.js, npm, WebView2, a CSS compiler, or a separate Studio. `init` and
`update` need internet access; no account or token is required for the public downloads.

## Download and verify

Each [toolkit release](https://github.com/emaclab/launcher-toolkit/releases) has two assets, named
without a version; the tag `vX.Y.Z` identifies the release.

| Asset | Use |
| --- | --- |
| `launcher-toolkit-windows-x64.exe` | The toolkit |
| `launcher-starter.zip` | The starter project, downloaded by `init` |

GitHub publishes the SHA-256 digest and size of every asset. This script downloads the executable
of one release into `.tools\` and refuses a file that does not match:

```powershell
$ErrorActionPreference = 'Stop'
$tag = 'vX.Y.Z'
$asset = 'launcher-toolkit-windows-x64.exe'
$headers = @{ Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28' }
$release = Invoke-RestMethod "https://api.github.com/repos/emaclab/launcher-toolkit/releases/tags/$tag" -Headers $headers
$entry = @($release.assets | Where-Object { $_.name -ceq $asset })
if ($release.tag_name -cne $tag -or $entry.Count -ne 1) { throw 'Unexpected release or asset.' }
if ($entry[0].digest -cnotmatch '^sha256:[0-9a-fA-F]{64}$' -or "$($entry[0].size)" -cnotmatch '^[1-9][0-9]*$') {
    throw 'Invalid integrity metadata.'
}
New-Item -ItemType Directory -Path .tools -Force | Out-Null
$file = Join-Path $PWD ".tools/$asset"
Invoke-WebRequest "https://github.com/emaclab/launcher-toolkit/releases/download/$tag/$asset" -OutFile $file
if ((Get-Item -LiteralPath $file).Length -ne [long]$entry[0].size -or
    (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ine $entry[0].digest.Substring(7)) {
    throw 'Toolkit size or SHA-256 mismatch.'
}
Move-Item -LiteralPath $file -Destination .tools/launcher-toolkit.exe -Force
```

Inside a project, read `$tag` from `.toolkit-version` instead; the starter README has that variant.
The toolkit applies the same rule to its own downloads (the starter for `init`, the executable for
`update`), cached copies included.

## Install for your user

```powershell
.\.tools\launcher-toolkit.exe install
```

The executable goes to `%USERPROFILE%\.local\bin\launcher-toolkit.exe` and that folder joins your
user `PATH`, without administrator rights. Open a new terminal, then:

```powershell
launcher-toolkit version
launcher-toolkit
```

Without arguments the toolkit opens a terminal menu: **Create project**, **Open project**,
**Help**, **Exit**. A portable copy run by its full path works the same way.

`install` refuses to replace a `launcher-toolkit.exe` in that folder that it did not install.
`uninstall` removes only the executable and the `PATH` entry that `install` added.

## Project version pin

Every project has `.toolkit-version` next to `pack/`, for example `v0.1.0`. `dev`, `check`, and
`build` refuse to run with a different toolkit version and name the command that fixes it. The
included CI reads the same file. Commit it with the project.

Updates are explicit:

```powershell
launcher-toolkit update --version vX.Y.Z
launcher-toolkit update
```

With `--version` the toolkit downloads that release; without it, the latest. It replaces the
executable you ran and never touches project files. Then change `.toolkit-version` deliberately,
run `check` and `build`, and commit the pin together with any fixes.

## Editor and Git

- Save JSON without a BOM: a BOM causes `expected value at line 1 column 1`. Windows PowerShell 5.1
  writes one with `Set-Content -Encoding UTF8` and `Out-File`.
- Keep the starter's `.gitattributes` (`* -text`), so Git never converts line endings and builds
  stay byte-identical.
- Pack paths use segments of `[A-Za-z0-9][A-Za-z0-9._-]*`. Do not create names that differ only in
  letter case.
- Do not commit `.tools/`, `dist/`, secrets, tokens, signing keys, or certificates.
