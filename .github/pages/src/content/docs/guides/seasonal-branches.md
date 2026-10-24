---
title: Seasonal branches
description: Create a complete seasonal theme on a branch, preview it, and build it with the toolkit.
sidebar:
  order: 8
---

A seasonal theme, such as a Halloween look, is not an overlay and not a second pack. It is the
same game's complete pack, with different content, on another branch.

## Rules

- **Every branch is complete.** A branch such as `halloween` contains the whole `pack/`:
  unchanged templates, styles, translations, data, fonts and assets included. Nothing is
  inherited from another branch; the tools read only that branch's `pack/` folder.
- **Same identity.** Keep `game.id` and `game.name` unchanged when creating a theme.
- **Same behavior.** Keep variation in data and assets. State persistence, layout, widgets, the
  splash and feeds keep the same runtime behavior on every branch.
- **Default branch only.** Once your game is connected for publishing, only the default branch is
  published. A seasonal branch stays a draft until you deliberately bring its content into the
  default branch; it needs no tag or version bump.

## Create the branch

```powershell
git switch main
git switch -c halloween
# edit pack/: images, colors, data, texts
launcher-toolkit.exe dev pack
launcher-toolkit.exe check pack
launcher-toolkit.exe build pack --out dist/pack.zip
git add pack
git commit -m "Halloween theme"
git push -u origin halloween
```

Use the name of your default branch instead of `main`. Pack Studio previews whatever is checked
out: switch branches to compare them; the preview reloads with the other branch's files.

## Keep variation in data and assets

A practical pattern is a data document that your templates read, declared in `pack.json` `data`
like any other, for example `data/theme.json`:

```json
{
  "launcher_class": "launcher halloween",
  "backdrop": "images/backgrounds/halloween.png"
}
```

```html
<main class="{{ data.theme.launcher_class }}">
```

Changed images can also keep their normal paths: the seasonal branch commits different bytes at
the same path. Whatever you choose, the default branch and the seasonal branch each contain the
complete set of files that their own templates reference.

## Styles

Each branch commits its own complete stylesheets in `pack/styles/`. With a preprocessor such as
Tailwind CSS, each branch also keeps its own input outside `pack/`; it must not import a
stylesheet of another branch or another folder. After changing it, run your preprocessor and commit
the generated CSS on that branch. See [styles and optional Tailwind](../tailwind-styles/).

## Build and compare the season

Check out the seasonal branch and build its complete `pack/`. Switch back to your regular branch
and build it into a different output folder to compare the results:

```powershell
git switch halloween
launcher-toolkit.exe build pack --out-dir dist/halloween
git switch main
launcher-toolkit.exe build pack --out-dir dist/regular
git diff --no-index --stat dist/regular dist/halloween
```

Keep setting names, types, and allowed values compatible if you want saved preferences to remain valid.
See [state and settings](../../reference/state-settings/).

## Before converting an existing repository

If you move existing themed content into this branch model, first preserve both your current
authoring files (including preprocessor input) and the complete files of each theme. Then commit
each theme as a complete `pack/` on its own branch.

