---
title: markdown
description: Render CommonMark text from data as safe native elements, with allowed links turned into open_url buttons.
sidebar:
  order: 20
---

`markdown` turns Markdown text from data or translations into elements. The core parses the text and builds the nodes itself; the text is **never** parsed as HTML, so a feed cannot inject markup, handlers, or widgets through it.

| | |
| --- | --- |
| Core API | **2** (`"core_api": 2` or higher required) |
| Element | An empty container, usually a `<div>` |
| Reads | `data-source` |
| Writes | Nothing |
| Keyboard | Generated link buttons are focusable; Enter and Space run them |

## Attributes

| Attribute | Type | Required | Meaning |
| --- | --- | --- | --- |
| `data-source` | string | yes | The Markdown text. Usually `{{ item.body\|loc }}`. |

## Behaviour

Leave the element empty. Its displayed content comes from `data-source`; children written inside it are ignored.

The parser is CommonMark with **every extension off**: no tables, task lists, footnotes, strikethrough, or smart punctuation.

| Markdown | Output |
| --- | --- |
| Paragraph | `p` |
| `#` … `######` heading | `h1` … `h6` |
| `*emphasis*`, `**strong**` | `em`, `strong` |
| `` `code` ``, fenced or indented code block | `code`, `pre > code` (the info string is ignored) |
| `> quote` | `blockquote` |
| `-` / `1.` lists | `ul > li`, `ol > li` (`start` when the list does not start at 1) |
| `---` | `hr` |
| Hard break / soft break | `br` / a space |
| Link to an allowed URL (inline, reference, or autolink) | `<button class="md-link" data-on-click="open_url('…')">` |
| Link to any other URL, e-mail autolink | Its text, unlinked |
| Image | Its alt text |
| Raw HTML, block or inline | Its source, as text |

An **allowed URL** follows the `open_url` rule: `https:` and a host equal to an entry of `game.allowed_hosts` or a subdomain of one. `open_url` checks it again at the click. A link whose handler would exceed the 1024-character handler limit becomes text.

The output carries no attributes except `class="md-link"` on link buttons and `start` on ordered lists: no `id`, no `style`, no other classes.

## Limits

| Limit | Value |
| --- | --- |
| Source size | 32 KiB of UTF-8 |
| Nesting | 16 output elements (`pre > code` counts two) |
| Element count | 2000 generated elements |

Over a limit, the element gets one `p` with the source as plain text, and the core logs the reason.

## Example

```json title="data/news.json (one item)"
{
  "id": "season-2",
  "date": "2026-10-15",
  "category": "categoryNews",
  "title": { "en": "Season 2: Frontier" },
  "body": { "en": "**Season 2** starts on November 15.\n\n## What is coming\n\n- The **Frontier** map.\n- Season rewards every 10 levels.\n\nRead the rules on the [official website](https://example.com/season-2)." }
}
```

```html title="templates/pages/news.html"
<article class="article" data-key="article-{{ selected.id }}">
  <h1>{{ selected.title|loc }}</h1>
  <div class="article-body" style="font-size:{{ state.article_size|num }}px"
       data-widget="markdown" data-source="{{ selected.body|loc }}"></div>
</article>
```

```css title="styles (excerpt)"
/* Generated markup has no classes: style it through the container. */
.article-body p, .article-body ul, .article-body ol { margin: 0 0 10px; }
.article-body h2 { margin: 14px 0 8px; font-size: 16px; }
.article-body ul, .article-body ol { padding-left: 20px; }
.article-body code { padding: 1px 4px; border-radius: 4px; background: var(--raised); }
.article-body .md-link { color: var(--accent); text-decoration: underline; }
```

The JSON string uses `\n\n` between blocks. Autoescape puts the text into the attribute safely; the parser receives it unchanged.

## Styling with a preprocessor

A preprocessor that scans template sources, such as Tailwind CSS, only sees class names written in templates, so it cannot style generated `p`, `li`, or `.md-link`. Write those rules as plain CSS with descendant selectors, in the pack's stylesheet or in the preprocessor input so they reach the generated stylesheet.

## Composition

- Accordion answers, dialog bodies, and patch-note tab panels are typical containers. See [Release notes](../../examples/release-notes/) and [FAQ accordion](../../examples/faq-accordion/).
- A text-size setting can drive the container's `font-size` while the generated elements inherit it.

## Pitfalls

- Using `markdown` in a pack that declares `core_api: 1` fails validation.
- Do not expect links to other hosts to work: add the host to `game.allowed_hosts`, or the link renders as plain text.
- Images in Markdown never load; they become their alt text. Place images with `<img src="{{ asset(…) }}">` (or a remote `https://` URL) in the template.

