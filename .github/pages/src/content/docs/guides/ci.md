---
title: CI
description: The starter's Windows workflow checks and builds every push with the pinned toolkit.
sidebar:
  order: 5
---

The starter includes `.github/workflows/pack.yml`. On every push and pull request, on
`windows-2025`, it:

1. reads `.toolkit-version` and that release's metadata;
2. takes `launcher-toolkit-windows-x64.exe` from the cache or the release and verifies its size and
   SHA-256 before adding it to `PATH`, also on a cache hit;
3. runs `launcher-toolkit.exe build pack --out dist/pack.zip`, which includes the complete checks,
   and saves the report as `dist/pack.json`;
4. uploads `dist/` as the artifact `pack-<commit>`.

It needs no variable or secret: it reads the public release with the job's own `GITHUB_TOKEN` and
read-only repository access. New commits cancel older runs of the same branch. Only pushes to the
default branch save the tool cache; its key includes the tag, SHA-256, and size, so a new pin never
reuses another executable.

## Use it

Push the project to GitHub and allow its workflows in **Actions** if GitHub asks. Open
**Actions → pack** to read a run's log and download its artifact. With the GitHub CLI:

```powershell
gh run list --workflow pack.yml --limit 5
gh run view <run-id> --log
gh run download <run-id> --name pack-<commit sha> --dir dist-ci
```

A failed run names the first error; reproduce it with `launcher-toolkit check` and see
[checks](../checks/). Branch rules can require the workflow before merging.

## What it does not do

The artifact is for review. The workflow does not sign or publish the pack, receives no
publishing credentials, and does not run CSS preprocessors. Do not add credentials or signing
files to the project.

Once your game is connected for publishing, pushes to the default branch are published by the
vendor's own pipeline, which builds and checks the exact commit again before signing it.
