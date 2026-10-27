---
title: Markdown
description: Render Markdown from data as Preact nodes, never as HTML, with links opened through the bridge.
sidebar:
  order: 5
---

News bodies, release notes, and FAQ answers in the starter are Markdown strings in `data/`. There
is no `innerHTML` of data: `app/markdown.js` builds Preact nodes directly.

- Supported: paragraphs, headings, emphasis, inline code, code blocks, block quotes, lists, rules,
  and hard breaks.
- Raw HTML stays text; an image shows its alt text.
- A link to a host of `allowed_hosts` becomes a `button.md-link` that calls `launcher.openUrl`;
  any other link stays text.
- A source over 32 KiB, nested deeper than 16 levels, or producing more than 2000 elements is shown
  as one plain paragraph.

From `app/pages/news.js`:

```js
html`<${Markdown} source=${loc(selected.body)} size=${settings.article_size} />`;
```

`Markdown` reads `allowed_hosts` and the app's `openLink` (which shows a toast when `openUrl`
rejects) from the app context. `size` sets the text size in pixels. Style the output with
descendant selectors of `.article-body`, the default class.
