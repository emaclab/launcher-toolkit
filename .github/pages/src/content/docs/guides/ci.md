---
title: Project CI
description: Use the starter's Windows workflow to check and build a pack with its pinned toolkit version.
sidebar:
  order: 7
---

The starter includes `.github/workflows/pack.yml` and `.toolkit-version`.
The workflow reads the committed version file, obtains that release's
`launcher-toolkit-windows-x64.exe` from the public release or from its cache, verifies the size
and SHA-256 that GitHub publishes for it, and runs `launcher-toolkit.exe build pack --out dist/pack.zip`.
No repository version variable or extra secret is required.

## Enable it

Create a Git repository for your project and push its files to GitHub. Keep the included workflow,
version pin, license, and complete `pack/` folder. In **Actions**, allow the repository's workflows
if GitHub asks you to enable them.

The workflow runs on every push and pull request using `windows-2025`, with read-only repository
access and the job's own `GITHUB_TOKEN` to read the public release metadata.
It runs the complete pack checks before generating the build. Errors fail the job; warnings remain
visible in the log. New commits cancel older runs for the same branch or pull request.

## Read the result

Open **Actions → pack**, select the run for your commit, and inspect its build log.
Download the `pack-<commit>` artifact: it holds `dist/pack.zip` and `dist/pack.json`, the build
report that the command printed.

With the optional GitHub CLI:

```powershell
gh run list --workflow pack.yml --limit 5
gh run view <run-id> --log
gh run download <run-id> --name pack-<commit sha> --dir dist-ci
```

The artifact is for review. The workflow does not sign or publish the pack and receives no
publishing credentials.

## Safe tool caches

On every run, the workflow reads the pinned release's metadata and requires exactly one asset named
`launcher-toolkit-windows-x64.exe` with a valid SHA-256 digest and size. It verifies the executable
against them before adding it to `PATH`, including on a cache hit. The cache key includes the
release tag, the expected SHA-256 and size, and the runner's OS and architecture, so changing
`.toolkit-version` selects the new release without reusing a different executable.

Only pushes to the repository's default branch save the tool cache. Pull requests and other
branches may restore it, but do not save new entries. The cache contains public tool bytes, not
pack files, build output, credentials, or signing data. Cache reuse never skips the complete pack
checks or build.

The workflow does not run CSS preprocessors: commit the generated CSS. See
[styles and optional Tailwind](../tailwind-styles/).

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
Local development and CI use the same release. Do not select `latest` on every CI run.

You can require the workflow's build check before merging through GitHub branch rules, when your
plan supports them. Do not add credentials or signing files to the project.
