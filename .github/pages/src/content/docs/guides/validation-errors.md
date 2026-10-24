---
title: Validation errors
description: Read build and launcher-toolkit errors, find the rule behind each message, and fix the common ones.
sidebar:
  order: 6
---

## Message formats

| Tool | Format | Exit code |
| --- | --- | --- |
| `launcher-toolkit` | `launcher-toolkit: <message>`; a usage error also prints the command list | 1, or 2 for invalid invocation |
| `launcher-toolkit check` / `build` | `error [<check>] <file>:<line>: <message>` or `warning […] …` | 1 with errors; warnings alone do not fail |

Validation findings can include a ZIP rule number and affected paths. Read every listed
file and line, then use the tables below to correct the source. The `[<check>]` names are listed
in [Studio checks](../studio-checks/#checks).

## Common errors

Messages name the affected path and line; exact details can vary with the toolkit version.

### Project and version

| Message | Cause and fix |
| --- | --- |
| ``launcher-toolkit: project requires launcher-toolkit v0.2.0, but this executable is v0.3.0. Explicitly run `launcher-toolkit update --version v0.2.0`, then retry. The project pin was not changed`` | `.toolkit-version` names another release. Install that version, or update the pin deliberately after checking the project with the new version |
| `launcher-toolkit: cannot read project pin <path>\.toolkit-version: … Projects must include .toolkit-version` | The project has no pin. Add `.toolkit-version` next to `pack/` (or inside a pack folder used without a project) |
| `launcher-toolkit: <dir>: no pack.json or pack/pack.json` | The supplied directory is neither a pack nor a project containing `pack/pack.json`. Pass the correct project or pack directory |

### Files and paths

| Message | Cause and fix |
| --- | --- |
| ``error [zip] zip rule 5: `assets/images/My Logo.svg`: every segment must match [A-Za-z0-9][A-Za-z0-9._-]*`` | A path segment with a space or another character outside the set, or starting with `.`, `_` or `-`. Rename the file and its references |
| ``error [zip] i18n/es.json: zip rule 15: `i18n/es.json` is missing`` | A language in `languages.available`, a name in `data` or a stylesheet in `styles` has no file. Add the file or remove the declaration |
| `<path>: links are not allowed in a pack` | A symbolic link or junction in `pack/`. Replace it with the real file |

A file that exists but is not declared is not an error: it is left out and listed under
`excluded`. For example, `data/extra.json` without `"extra"` in `pack.json` `data` is silently
absent from the pack.

### JSON

| Message | Cause and fix |
| --- | --- |
| ``error [zip] pack.json:88: pack.json: unknown field `version`, expected one of `format`, `core_api`, `game`, … `` | Unknown keys are rejected. Packs have no top-level `id`, `version` or `extends`: the game is identified by `game.id`, and every branch is a complete pack |
| ``error [validate] window.json:19: window.json: unknown field `theme`, expected one of `icon`, `base_color`, `main`, `splash` …`` | The same rule in `window.json`. See [windows and splash](../../reference/windows/) |
| `error [validate] i18n/en.json:1: i18n/en.json: expected value at line 1 column 1` | The file is empty, is not JSON, or starts with a byte order mark. Save it as UTF-8 without BOM |
| `error [zip] pack.json:1: pack.json: expected value at line 1 column 1` | The same problem in `pack.json`, which is read before everything else |
| ``error [validate] i18n/en.json:97: i18n/en.json: missing field `language_name` at line 97 column 1`` | A required key of the language file is missing. See [localization](../../reference/localization-data/) |
| `error [validate] game.id must match [a-z0-9-]{1,64}` | Use the ID assigned to your game: lowercase letters, digits and `-` |
| `error [validate] game.name must be a valid Windows folder name of 1-64 characters` | Remove characters that Windows forbids in folder names and any trailing dot or space |
| ``error [validate] state `foo`: default: expected a int value`` | A state default does not match its type. See [state and settings](../../reference/state-settings/) |
| ``error [validate] error_state `confirm` must name a string state variable without `values` `` | Point `error_state` to a declared `string` without `values`, or set it to `null` |

### Templates and core API

| Message | Cause and fix |
| --- | --- |
| ``error [validate] templates/pages/home.html:31: templates/pages/home.html: line 31: the `safe` filter is not allowed`` | Output is always escaped; `safe` and `autoescape` blocks are rejected |
| ``error [validate] templates/pages/home.html:31: templates/pages/home.html: line 31: every {{ }} in `data-on-click` must end with the `arg` filter`` | Write `navigate({{ page\|arg }})`. See [actions](../../reference/actions/) |
| ``error [validate] templates/pages/home.html:31: templates/pages/home.html: line 31: unquoted `{{ }}` inside a start tag; put it in a quoted attribute value`` | Write `class="{{ value }}"`, not `class={{ value }}` |
| `error [validate] templates/pages/home.html:31: templates/pages/home.html: syntax error: unexpected end of input, expected end of block (in pages/home.html:31)` | A MiniJinja syntax error. Here an `{% if %}` has no `{% endif %}` |
| `error [core-api] templates/pages/home.html: templates/pages/home.html: data-widget="markdown" needs core_api 2 (the pack declares 1)` | The pack uses a feature of a later core API. Declare that `core_api` |
| ``error [validate] templates/launch-bar.html: templates/launch-bar.html: action `pause` was removed in core_api 3 (the pack declares 3)`` | `pause()`, `resume()` and `cancel()` do not exist in core API 3. Remove them; see [launcher actions](../../reference/actions/#launcher-actions) |
| `error [validate] core_api 4 needs a newer core (this core: 3)` | The pack declares a core API that this toolkit does not offer |

See [templates](../../reference/templates/) and [restrictions](../../reference/restrictions/) for
every template rule.

### Outputs and usage

| Message | Cause and fix |
| --- | --- |
| `launcher-toolkit: dist/pack: the folder is not empty and is not a generated pack output` | `--out-dir` refuses a foreign non-empty folder (exit `1`). Choose an empty folder or one that `build` wrote |
| `launcher-toolkit: artifact destinations must not overlap` | The ZIP would be inside the output folder, or the reverse (exit `2`) |
| `launcher-toolkit: artifact destinations must not overlap the pack source directory` | An output inside the pack folder, or the pack inside an output (exit `2`) |
| `launcher-toolkit: --out=dist/pack.zip is not an option of build` | Options take their value as the next argument: `--out dist/pack.zip` |
| ``launcher-toolkit: unknown command `styles` `` | The toolkit has no styles command. Run your CSS preprocessor separately; see [styles](../tailwind-styles/) |

## Render and resource checks

Both `check` and `build` report these findings. Errors prevent build output; warnings do not.

| Problem | Finding | Fix |
| --- | --- | --- |
| A template fails for some page, language, or phase | `render` error naming the template, line, and the page, language, and phase | Fix the template; reproduce the case in the [state simulator](../state-simulator/) |
| A configured page has no template | `render` error naming the missing template | Add the template or remove the page declaration |
| A missing image or font | `resources` error naming the requested path | Add the exact file or correct its reference |
| A missing translation | `translations` warning naming the language and key | Add the key to that language file |
| An unknown widget or attribute | `widgets` warning naming the template | Use a supported widget and its documented attributes |
| A mismatched window shape or misplaced anti-cheat mark | `polygon` or `mark` warning | Correct the geometry or placeholder |
| A feed body with `--feed` that is not an object or has an invalid fixed document | `feed` error | Fix the body; undeclared keys are only a `feed` warning |

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
