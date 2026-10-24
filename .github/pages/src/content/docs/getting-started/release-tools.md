---
title: Download and install
description: Verify the single Windows toolkit executable, install it for your user, and update it explicitly.
sidebar:
  order: 3
---

Download the toolkit from [its public releases](https://github.com/emaclab/launcher-toolkit/releases).
Each release contains exactly two assets:

| Asset | Use |
| --- | --- |
| `launcher-toolkit-windows-x64.exe` | The authoring executable: projects, preview, simulator, checks, builds, reference |
| `launcher-starter.zip` | The complete starter project with every available widget |

The asset names do not contain the version; the release tag (`vX.Y.Z`) identifies it.
There are no separate Studio, publisher, Linux, or CSS compiler downloads.

## Verify the download

GitHub publishes the SHA-256 digest and the size of every release asset. Compare them with your
file before you run it. This PowerShell script downloads the executable of one release into
`.tools\` and checks it; set `$tag` to the release you want:

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

Do not execute a file whose size or hash differs. Download it again from the correct release.
Inside a starter project, read `$tag` from the project's `.toolkit-version` instead; the starter
README contains that variant.

The toolkit applies the same rule to everything it downloads itself (the starter for `init`, the
executable for `update`): it reads the current release metadata, accepts exactly one asset with
the expected name, and checks its size and SHA-256 before using it, including cached copies.

## Install for your user

```powershell
.\.tools\launcher-toolkit.exe install
```

The destination is `%USERPROFILE%\.local\bin\launcher-toolkit.exe`, and the folder is added to your
user `PATH`. No administrator rights are required. Open a new terminal after installation.

```powershell
launcher-toolkit version
launcher-toolkit
```

Opening the executable without arguments shows a terminal menu for creating or opening a project
and reading the help. You can also keep a portable copy and call it by its full path instead of
installing it.

`install` does not replace an existing `launcher-toolkit.exe` in that folder that it did not
install; move such a file aside first.

## Explicit updates

```powershell
launcher-toolkit update --version vX.Y.Z
launcher-toolkit update
```

Updates happen only when you request them. With `--version`, the toolkit downloads that release;
without it, the latest release. It replaces the executable you ran (an installed copy, or a
portable copy in place) and never changes project files. Run the command again to use the new
version.

Every project command requires the toolkit version named in the project's `.toolkit-version`.
Change that pin deliberately, check and build the project with the new version, then commit the
pin and any fixes together. The CI reads the same file. See [Windows setup](../windows-setup/).

## Remove the installed tool

```powershell
launcher-toolkit uninstall
```

Removal targets only the executable that `install` placed and the `PATH` entry it added. Other
programs in `.local\bin`, unmanaged `PATH` entries, your projects, and their pack files stay.

## Licenses

Starter use remains subject to the restricted license included in the project; see
[starters](../starters/#license). Third-party materials keep their own licenses.
