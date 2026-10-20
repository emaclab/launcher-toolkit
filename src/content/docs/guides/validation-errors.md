---
title: Validation errors
description: Read build and launcher-toolkit errors, find the rule behind each message, and fix the common ones.
sidebar:
  order: 6
---

## Message formats

| Tool | Format | Exit code |
| --- | --- | --- |
| `launcher-toolkit` | `launcher-toolkit: <message>` | 1, or 2 for invalid invocation |
| `launcher-toolkit check` / `build` | `error [<check>] <file>:<line>: <message>` or `warning […] …` | 1 with errors; warnings alone do not fail |

Validation findings can include a ZIP rule number and affected paths. Read every listed
file and line, then use the tables below to correct the source.


## Common errors

Messages name the affected path and line; exact details can vary with the toolkit version.

### Files and paths

| Message | Cause and fix |
| --- | --- |
| `` error: zip rule 5: `assets/images/My Logo.svg`: every segment must match [A-Za-z0-9][A-Za-z0-9._-]* `` | A path segment with a space or another character outside the set, or starting with `.`, `_` or `-`. Rename the file and its references |
| `` error: zip rule 15: `i18n/es.json` is missing `` | A language in `languages.available`, a name in `data` or a stylesheet in `styles` has no file. Add the file or remove the declaration |
| `` error: pack.json styles: `styles/input.css` is reserved for Tailwind source, never a runtime stylesheet `` | Remove `styles/input.css` from `styles`; list the compiled `styles/app.css` |
| `<path>: links are not allowed in a pack` | A symbolic link or junction in `pack/`. Replace it with the real file |
| `<dir>: no pack.json` | The supplied directory is neither a pack nor a project containing `pack/pack.json`. Pass the correct project or pack directory |

A file that exists but is not declared is not an error: it is left out and listed under
`excluded`. For example, `data/extra.json` without `"extra"` in `pack.json` `data` is silently
absent from the pack.

### JSON

| Message | Cause and fix |
| --- | --- |
| `` - pack.json: unknown field `version`, expected one of `format`, `core_api`, `game`, … `` | Unknown keys are rejected. Packs have no top-level `id`, `version` or `extends`: the game is identified by `game.id`, and every branch is a complete pack |
| `` - window.json: unknown field `theme`, expected one of `icon`, `base_color`, `main`, `splash` `` | The same rule in `window.json`. See [windows and splash](../../reference/windows/) |
| `- i18n/en.json: expected value at line 1 column 1` | The file is empty, is not JSON, or starts with a byte order mark. Save it as UTF-8 without BOM |
| `error: pack.json: expected value at line 1 column 1` | The same problem in `pack.json`, which is read before everything else |
| `` - i18n/es.json: missing field `language_name` … `` | A required key of the language file is missing. See [localization](../../reference/localization-data/) |
| `- game.id must match [a-z0-9-]{1,64}` | Use the ID that EMAC assigns: lowercase letters, digits and `-` |
| `- game.name must be a valid Windows folder name of 1-64 characters` | Remove characters that Windows forbids in folder names and any trailing dot or space |
| `` - state `foo`: default: expected a int value `` | A state default does not match its type. See [state and settings](../../reference/state-settings/) |

### Templates

| Message | Cause and fix |
| --- | --- |
| `` - templates/pages/about.html: line 40: the `safe` filter is not allowed `` | Output is always escaped; `safe` and `autoescape` blocks are rejected |
| `` - templates/pages/about.html: line 40: every {{ }} in `data-on-click` must end with the `arg` filter `` | Write `navigate({{ page\|arg }})`. See [actions](../../reference/actions/) |
| `` - templates/pages/about.html: line 40: unquoted `{{ }}` inside a start tag; put it in a quoted attribute value `` | Write `class="{{ value }}"`, not `class={{ value }}` |
| `- templates/pages/about.html: syntax error: unexpected end of input, expected end of block (in pages/about.html:40)` | A MiniJinja syntax error, followed by an excerpt with the line marked. Here an `{% if %}` has no `{% endif %}` |
| `- templates/pages/news.html: data-widget="markdown" needs core_api 2 (the pack declares 1)` | The pack uses a core API 2 feature. Declare `"core_api": 2` |

See [templates](../../reference/templates/) and [restrictions](../../reference/restrictions/) for
every template rule.

### Outputs and usage

| Message | Cause and fix |
| --- | --- |
| `error: dist/pack: the folder is not empty and was not written by build` | `--out-dir` refuses a foreign non-empty folder. Choose an empty folder or one that `build` wrote |
| `usage error: --out and --out-dir must not overlap` | The ZIP would be inside the output folder, or the reverse |
| `usage error: unknown option --out=dist/pack.zip` | Options take their value as the next argument: `--out dist/pack.zip` |


## Render and resource checks

Both `check` and `build` report these findings. Errors prevent build output; warnings do not.

| Problem | Finding | Fix |
| --- | --- | --- |
| A configured page has no template | `render` error naming the missing template | Add the template or remove the page declaration |
| A missing image or font | `resources` error naming the requested path | Add the exact file or correct its reference |
| A missing translation | `translations` warning naming the language and key | Add the key to that language file |
| An unknown widget or attribute | `widgets` warning naming the template | Use a supported widget and its documented attributes |
| A mismatched window shape or misplaced anti-cheat mark | `polygon` or `mark` warning | Correct the geometry or placeholder |
| Stale Tailwind output in `check` | `styles` warning | Run `launcher-toolkit styles`; `build` prepares styles automatically |

Asset paths are case-sensitive in the pack: `images/Logo.svg` does not find `images/logo.svg`,
even though Windows does. Run [`launcher-toolkit check`](../studio-checks/) before building your pack.

## Build limits

Use `build` to create ZIP files. If a build exceeds a limit, reduce the number or size of
included assets, or shorten the named path.

| Input | Limit or fix |
| --- | --- |
| ZIP size | At most 64 MiB |
| Number of files | At most 4096 |
| One uncompressed file | At most 32 MiB |
| All uncompressed files | At most 128 MiB |
| Path | At most 255 bytes; use `/` and valid ASCII segments |
| Case-only filename differences | Rename files so every path is distinct regardless of letter case |
| Missing required file | Add the file or remove its declaration |

See [restrictions and limits](../../reference/restrictions/) for supported filenames and pack contents.

