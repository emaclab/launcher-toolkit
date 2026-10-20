---
title: carousel
description: Advance a slide index on a timer, with pause rules, a progress value for the template, and accessible slide buttons.
sidebar:
  order: 18
---

`carousel` advances an `int` slide index on a timer and exposes the elapsed time on the current slide, so the template can draw a progress track. The template renders the slides; the widget only counts.

| | |
| --- | --- |
| Core API | 1 |
| Element | Any element that contains the slides and their buttons |
| Reads | `data-state`, `data-elapsed-state`, `data-count`, `data-interval`, `data-paused` |
| Writes | `data-state` and `data-elapsed-state` |
| Keyboard | None of its own; slide buttons use Enter and Space |

## Attributes

| Attribute | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `data-state` | `int` state name | yes | — | The current slide index. |
| `data-elapsed-state` | `int` state name | yes | — | Milliseconds spent on the current slide, in steps of 100. |
| `data-count` | int | yes | — | Number of slides. With `0` or a missing value the index never advances. |
| `data-interval` | int ms | no | `7000` | Time per slide; values below `100` count as `100`. |
| `data-paused` | `true`/`false` | no | `false` | `true` pauses the timer. |

## Behaviour

- The slide advances after `data-interval` milliseconds. `data-elapsed-state` tracks elapsed time for a progress indicator and returns to `0` when the slide changes.
- It is **paused** while any of these holds: the pointer is over the element, focus is inside it, the window is inactive or minimized, or `data-paused="true"`.
- **Any change of the slide from another source resets elapsed to 0.** A slide button therefore only needs `set('slide', n)`; the progress restarts by itself.
- Several carousels may run at once; each has its own state names.

## State

```json title="pack.json (state)"
"slide":         { "type": "int",   "default": 0, "min": 0, "reset": "page" },
"slide_elapsed": { "type": "int",   "default": 0, "min": 0, "reset": "page" },
"motion":        { "type": "bool",  "default": true, "persist": true }
```

`reset: "page"` starts the carousel from the first slide when the player returns to the page. `motion` is an optional persisted setting that lets players stop the rotation, because `prefers-reduced-motion` is not available.

## Example

```json title="data/slides.json"
[
  { "title": { "en": "Season 2 is live" }, "text": { "en": "New map, new rewards." }, "image": "images/slide-season.svg", "page": "news" },
  { "title": { "en": "Launch week" }, "text": { "en": "Daily challenges all week." }, "image": "images/slide-event.svg", "page": "calendar" }
]
```

```html title="templates/pages/home.html"
{%- set slides = data.slides %}
{#- Clamp: a feed can shrink the list below the stored index. #}
{%- set index = state.slide if state.slide < slides|length else 0 %}
{%- set current = slides[index] %}
{%- if current %}
<section class="carousel" role="region" aria-roledescription="carousel" aria-label="{{ t('highlights') }}"
  data-widget="carousel" data-state="slide" data-count="{{ slides|length }}" data-interval="7000"
  data-elapsed-state="slide_elapsed" data-paused="{{ not state.motion }}">
  <img class="slide-art" src="{{ asset(current.image) }}" alt="" width="960" height="236">
  {#- A new key per slide and language replaces the node and replays its enter animation. #}
  <div class="slide-story" data-key="{{ index }}-{{ lang }}">
    <h1>{{ current.title|loc }}</h1>
    <p>{{ current.text|loc }}</p>
    <button class="slide-cta" data-on-click="navigate({{ current.page|arg }})">{{ t("learnMore") }}</button>
  </div>
  <div class="carousel-tabs" role="group" aria-label="{{ t('highlights') }}">
    {%- for slide in slides %}
    {%- set on = loop.index0 == index %}
    <button class="carousel-tab" aria-label="{{ slide.title|loc }}" aria-pressed="{{ on }}"
            data-on-click="set('slide', {{ loop.index0|arg }})">
      <span class="carousel-track"><span style="width:{{ ([state.slide_elapsed / 70, 4]|max if on else 0)|num }}%"></span></span>
    </button>
    {%- endfor %}
  </div>
</section>
{%- endif %}
```

```json title="i18n/en.json (strings)"
"highlights": "Highlights",
"learnMore": "Learn more"
```

The track width is `slide_elapsed / 70` percent: 7000 ms maps to 100%. Keep the divisor equal to `data-interval / 100`. `[…, 4]|max` keeps a visible stub at the start.

```css title="styles (excerpt)"
.slide-story { animation: slide-enter 0.45s ease-out; }
@keyframes slide-enter { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
.carousel-tab[aria-pressed="true"] { color: var(--text); }
.app[data-motion="false"] .slide-story { animation: none; }
```

## Composition

- Inside a [`scroll`](../scroll/) container, pause the carousel once it scrolls out of view: `data-paused="{{ state.home_scroll >= 200 or not state.motion }}"`.
- The same `home_scroll` value can fade the art: `style="opacity:{{ [1 - state.home_scroll / 500, 0.35]|max|num }}"`.
- See [Home highlights](../../examples/home-highlights/) for the full composition.

## Accessibility

- Slide buttons are real `<button>` elements with `aria-pressed` and a label; keyboard users choose slides with Tab and Enter.
- Focus inside the carousel pauses it, so a keyboard user is not interrupted while reading.
- Provide a motion setting and pass it to `data-paused`.

## Pitfalls

- Declaring `data-state` or `data-elapsed-state` as anything but `int` makes every write fail.
- Do not compute the index from `state.slide` without clamping it; a shorter list would index past the end.
- Do not add other `data-*` attributes to the carousel element; Studio warns about attributes the widget does not define.

