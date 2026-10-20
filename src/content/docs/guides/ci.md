---
title: Project CI
description: Use the starter's Windows workflow to check and build a pack with its pinned toolkit version.
sidebar:
  order: 7
---

Both starters include `.github/workflows/pack.yml` and `.toolkit-version`.
The workflow reads the committed version file, obtains the matching Windows toolkit executable
from its release or cache, verifies its checksum, and runs `launcher-toolkit build`.
No repository version variable or extra secret is required.

## Enable it

Create a Git repository for your project and push its files to GitHub. Keep the included workflow,
version pin, license, and complete `pack/` folder. In **Actions**, allow the repository's workflows
if GitHub asks you to enable them.

The workflow runs on pushes and pull requests using `windows-2025`.
It checks the complete pack before generating the build. Errors fail the job; warnings remain
visible in the log.
New commits cancel older runs for the same branch or pull request. All pushes and pull requests
still run the build, so a documentation-only change does not leave an optional required check pending.

## Read the result

Open **Actions → pack**, select the run for your commit, and inspect its build log.
Download the `pack-<commit>` artifact to obtain the pack ZIP and report.

With the optional GitHub CLI:

```powershell
gh run list --workflow pack.yml --limit 5
gh run view <run-id> --log
gh run download <run-id> --name pack-<commit sha> --dir dist-ci
```

## Safe tool caches

The workflow fetches `SHA256SUMS` from the pinned public release on every run and verifies the
executable before adding it to `PATH`, including on a cache hit. Toolkit cache keys include the
release tag, expected SHA-256, Windows runner OS, and architecture. Changing `.toolkit-version`
selects the new release without reusing a different executable.

Only successful pushes to the repository's default branch save reusable tool caches. Pull requests
and other branches may restore them, but do not save new entries. Caches contain public tool bytes,
not pack files, build output, credentials, or signing data.

If `pack/styles/input.css` exists, CI also restores the toolkit's managed Tailwind cache. Its key
uses the same exact toolkit identity, and the toolkit verifies the compiler before every execution.
Plain-CSS projects skip this cache and never download Tailwind. See
[optional Tailwind](../tailwind-styles/).

Cache reuse never skips the complete pack checks or build.

## Fix a failed run

Read the first error and fix the named file. For example, a missing translation requires either
adding that language file or removing the unsupported language declaration. See
[validation errors](../validation-errors/).

Reproduce locally with the version named in `.toolkit-version`:

```powershell
launcher-toolkit check
launcher-toolkit build
```

## Update deliberately

Install the toolkit version you intend to use, then check and build the project with it.
Update `.toolkit-version` explicitly and commit it with any necessary pack changes.
Local development and CI should use the same release. Do not select `latest` on every CI run.

You can require the workflow's build check before merging through GitHub branch rules, when your
plan supports them. Do not add credentials or signing files to the project.
