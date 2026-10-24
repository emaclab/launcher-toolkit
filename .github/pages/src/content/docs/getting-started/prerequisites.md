---
title: Prerequisites
description: What you need to create and develop a launcher pack on Windows.
sidebar:
  order: 1
---

## Computer

Use a **Windows x64** computer or virtual machine. The author CLI and preview are not distributed
for Linux, macOS, ARM64, or 32-bit Windows. The project CI also runs on Windows.

```powershell
[Environment]::Is64BitOperatingSystem
$env:PROCESSOR_ARCHITECTURE
```

The expected architecture is `AMD64`. The tools do not require WebView2 or the Visual C++
Redistributable.

## Software

- A text editor that saves UTF-8 without a byte order mark.
- Windows PowerShell or PowerShell 7 for commands.
- [Git](https://git-scm.com/) if you want source control and GitHub CI.
- The single [toolkit executable](../release-tools/).

The GitHub CLI is optional. Pack development does not require Rust, Node.js, npm, NSIS,
a separate Studio executable, or a CSS compiler.

## Downloads and access

The first `init` needs internet access to obtain its starter from the toolkit release, and
`update` downloads the executable of the requested release. Both check the release metadata on
GitHub each time; a verified cached starter is reused without downloading it again.
The starters use plain CSS, and the toolkit never downloads a CSS compiler.

No authentication is required for the public toolkit or starter downloads.
You need your own GitHub account/repository only if you choose to store the project there and run CI.

## License

Starter use is restricted to games integrated with **EMAC Anti-Cheat**.
Public download availability does not remove this restriction. Retain the included license and
third-party notices. See [starters](../starters/#license).

Do not put secrets, access tokens, signing keys, or certificates in a pack project.
