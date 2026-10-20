---
title: Download and install
description: Verify the single Windows toolkit executable, install it for your user, and update it explicitly.
sidebar:
  order: 3
---

Download the toolkit from [its public releases](https://github.com/emaclab/launcher-toolkit/releases).
The release includes one authoring executable, starters, checksums, and license notices.
There are no separate Studio, publisher, Linux, or Tailwind downloads to install.

## Download

Save these files from the same release into one folder:

- `launcher-toolkit-v0.2.0-windows-x64.exe`
- `SHA256SUMS`

The version in the filename changes with each release. The examples below use `v0.2.0`.

## Verify the download

Run PowerShell in the download folder:

```powershell
$tag = 'v0.2.0'
$asset = "launcher-toolkit-$tag-windows-x64.exe"
$entry = Get-Content SHA256SUMS | Where-Object { $_ -match "  $([regex]::Escape($asset))$" }
if (@($entry).Count -ne 1) { throw 'Expected exactly one checksum entry' }
$expected = ($entry -split '  ', 2)[0]
$actual = (Get-FileHash -LiteralPath $asset -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -cne $expected) { throw 'Toolkit SHA-256 mismatch' }
Rename-Item -LiteralPath $asset -NewName launcher-toolkit.exe
```

Do not execute a file with a mismatched hash. Download it again from the correct release.
The toolkit verifies the starter and optional Tailwind downloads itself.

## Install for your user

```powershell
.\launcher-toolkit.exe install
```

The destination is `%USERPROFILE%\.local\bin\launcher-toolkit.exe`.
No administrator rights are required. Open a new terminal after installation.

```powershell
launcher-toolkit version
launcher-toolkit
```

Opening the executable without arguments shows a terminal menu for creating/opening projects and
consulting help. You can also keep a portable copy and call its full path instead of installing.

## Explicit updates

```powershell
launcher-toolkit update --version v0.2.0
```

Updates happen only when you request them. Keep each project's `.toolkit-version` aligned with
the version you intend to use and validate the project before committing a version change.
The CI reads the same file. See [Windows setup](../windows-setup/).

## Remove the installed tool

```powershell
launcher-toolkit uninstall
```

Removal targets this tool, not other programs in `.local\bin`, your projects, or their pack files.

## License notices

Read `THIRD_PARTY_NOTICES.html` from the release. The optional Tailwind compiler retains its own
license; its notice is available in the toolkit README. Starter use remains subject to the
restricted license included in each starter.
