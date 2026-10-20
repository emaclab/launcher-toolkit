---
title: FAQ accordion
description: An accordion of Markdown answers inside a scrolling page, with arrow-key navigation, a jump link, and a back-to-top button that appears after scrolling.
sidebar:
  order: 9
---

An "About" page with a frequently-asked-questions accordion. Several answers can be open at once; closed answers are not rendered, so Tab never reaches their links. The page scrolls inside a `scroll` widget whose offset reveals a back-to-top button.

**Uses:** [`list`](../../widgets/list/), [`markdown`](../../widgets/markdown/), [`scroll`](../../widgets/scroll/), `toggle` on a `set`, `scroll_to()`. **Core API:** 2 (for `markdown`).

## Declarations

```json title="pack.json"
"core_api": 2,
"pages": ["home", "about"],
"data": ["faq"],
"state": {
  "faq_open":     { "type": "set",   "default": [], "reset": "page" },
  "about_scroll": { "type": "float", "default": 0, "reset": "page" }
}
```

For "only one answer open", use a `string` instead: `set('faq', id)` to open and `set('faq', '')` to close, with `open = item.id == state.faq`.

## Data

```json title="data/faq.json"
[
  {
    "id": "pause",
    "question": { "en": "Can I pause an update?" },
    "answer": { "en": "Yes. Use **Pause** and **Resume** in the bottom bar. **Cancel** asks for confirmation first." }
  },
  {
    "id": "settings",
    "question": { "en": "Where are my settings stored?" },
    "answer": { "en": "On this computer, in the `preferences.json` file of the launcher data folder." }
  }
]
```

## Template

```html title="templates/pages/about.html"
<div class="about-page">
  <div id="about-scroll" class="about-scroll" data-widget="scroll" data-scroll-state="about_scroll">
    <section class="card">
      <h1>{{ game.name }}</h1>
      <p>{{ t("aboutText") }}</p>
      <button class="link-button" data-on-click="scroll_to('#about-scroll', '#faq')">{{ t("faq") }} ↓</button>
    </section>
    <section id="faq" class="card faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">{{ t("faq") }}</h2>
      <div class="faq-list" data-widget="list">
        {%- for item in data.faq %}
        {%- set open = item.id in state.faq_open %}
        <button class="{{ 'faq-question open' if open else 'faq-question' }}" data-key="faq-q-{{ item.id }}"
                aria-expanded="{{ open }}" aria-controls="faq-{{ item.id }}"
                data-on-click="toggle('faq_open', {{ item.id|arg }})">
          <span>{{ item.question|loc }}</span>
          <span class="caret" aria-hidden="true">▾</span>
        </button>
        {%- if open %}
        <div id="faq-{{ item.id }}" class="faq-answer article-body" data-key="faq-a-{{ item.id }}" role="region"
             data-widget="markdown" data-source="{{ item.answer|loc }}"></div>
        {%- endif %}
        {%- endfor %}
      </div>
    </section>
  </div>
  {%- if state.about_scroll > 160 %}
  <button class="back-top" data-key="about-top" data-on-click="scroll_to('#about-scroll', 'start')">{{ t("backTop") }} ↑</button>
  {%- endif %}
</div>
```

## Translations

```json title="i18n/en.json (strings)"
"aboutText": "A competitive online game for Windows.",
"faq": "Frequently asked questions",
"backTop": "Back to top"
```

## Styles

```css title="styles (structural rules)"
.about-page { position: relative; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.about-scroll { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; }
.faq-question { display: flex; justify-content: space-between; width: 100%; padding: 12px 14px; }
.faq-question[aria-expanded="true"] .caret { transform: rotate(180deg); }
.faq-answer { padding: 0 14px 12px; }
.faq-answer p { margin: 0 0 8px; }
.back-top { position: absolute; right: 24px; bottom: 16px; }
```

## How it behaves

- **Toggle.** Each header runs `toggle('faq_open', id)`, which adds or removes the id. `aria-expanded` and the caret follow the same expression.
- **Keyboard.** The `list` on `.faq-list` includes the headers and any link buttons inside open answers: ↑/↓ move through them in DOM order, Home and End jump to the ends, Enter or Space toggles a header.
- **Keys.** Headers and answers have distinct keys (`faq-q-…`, `faq-a-…`), so opening one answer inserts exactly one node and focus stays on its header.
- **Jump link.** `scroll_to('#about-scroll', '#faq')` scrolls the container to the section's top. It is a descendant selector resolved inside the container.
- **Back to top.** Appears after 160 px of scrolling, rendered conditionally and keyed, so it is not a hidden Tab stop at the top of the page.

