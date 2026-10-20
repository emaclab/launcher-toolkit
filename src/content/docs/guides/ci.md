---
title: Project CI
description: Use the starter's Windows workflow to check and build a pack with its pinned toolkit version.
sidebar:
  order: 7
---

Both starters include `.github/workflows/pack.yml` and `.toolkit-version`.
The workflow reads the committed version file, downloads the matching Windows toolkit executable,
verifies its checksum, and runs `launcher-toolkit build`. No repository version variable or
extra secret is required.

## Enable it

Create a Git repository for your project and push its files to GitHub. Keep the included workflow,
version pin, license, and complete `pack/` folder. In **Actions**, allow the repository's workflows
if GitHub asks you to enable them.

The workflow runs on pushes and pull requests using `windows-2025`.
It checks the complete pack before generating the build. Errors fail the job; warnings remain
visible in the log.

## Read the result

Open **Actions → pack**, select the run for your commit, and inspect its build log.
Download the `pack-<commit>` artifact to obtain the pack ZIP and report.

With the optional GitHub CLI:

```powershell
gh run list --workflow pack.yml --limit 5
gh run view <run-id> --log
gh run download <run-id> --name pack-<commit sha> --dir dist-ci
```

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
