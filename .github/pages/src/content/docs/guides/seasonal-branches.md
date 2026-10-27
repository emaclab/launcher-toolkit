---
title: Seasonal branches
description: Keep a seasonal look, such as Halloween, as a complete pack on its own branch.
sidebar:
  order: 6
---

A seasonal look is not an overlay or a second pack: it is the same game's **complete** pack, with
different content, on another branch.

- **Every branch is complete.** A branch such as `halloween` holds the whole `pack/`, unchanged
  files included. Nothing is inherited from another branch.
- **Same identity.** Keep `game.id` and `game.name`.
- **Default branch only.** Once your game is connected for publishing, only the default branch is
  published. A seasonal branch stays a draft until you bring its content into the default branch;
  no tag or version bump is needed.

## Create the branch

```powershell
git switch main
git switch -c halloween
# edit pack/: images, colors, data, texts
launcher-toolkit dev
launcher-toolkit check
git add pack
git commit -m "Halloween theme"
git push -u origin halloween
```

Use your default branch's name instead of `main`. Pack Studio previews whatever is checked out and
reloads when you switch branches.

## Keep variation in data and assets

A theme is the pack's own data and CSS; there is no theme schema in the core. A practical pattern
is a data file your script reads, for example `data/theme.json`:

```json
{ "className": "launcher halloween", "backdrop": "assets/images/halloween.png" }
```

```js
const theme = await launcher.readJson("data/theme.json");
```

Changed images can also keep their paths: the branch commits different bytes at the same path.
Keep the keys your script saves in `localStorage` compatible, so players keep their settings when
the season changes.

Each branch commits its own complete CSS. With a preprocessor, each branch keeps its own input
outside `pack/` and its own generated output.

## Compare the season

```powershell
git switch halloween
launcher-toolkit build --out-dir dist/halloween
git switch main
launcher-toolkit build --out-dir dist/regular
git diff --no-index --stat dist/regular dist/halloween
```
