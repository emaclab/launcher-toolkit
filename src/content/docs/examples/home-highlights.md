---
title: Home highlights
description: A snapping home page that combines a scroll-linked fade, an auto-advancing carousel that pauses off-screen, an event countdown card, and keyboard-friendly scroll buttons.
sidebar:
  order: 4
---

A home page in two stops: highlights at the top, details below. The `scroll` widget snaps between them and writes the offset into state; the template fades the slide art with it and pauses the carousel once it scrolls away. A quick card counts down to the next event.

**Uses:** [`scroll`](../../widgets/scroll/), [`carousel`](../../widgets/carousel/), [`countdown`](../../widgets/countdown/), `scroll_to()`, `calendar` data. **Core API:** 1.

## Declarations

```json title="pack.json"
"pages": ["home", "calendar"],
"data": ["slides", "calendar"],
"state": {
  "slide":         { "type": "int",   "default": 0, "min": 0, "reset": "page" },
  "slide_elapsed": { "type": "int",   "default": 0, "min": 0, "reset": "page" },
  "home_scroll":   { "type": "float", "default": 0, "reset": "page" },
  "motion":        { "type": "bool",  "default": true, "persist": true }
}
```

## Data

```json title="data/slides.json"
[
  { "category": "categoryEvent", "title": { "en": "Launch week" }, "text": { "en": "Daily challenges and double experience." },
    "image": "images/slide-event.svg", "page": "calendar" },
  { "category": "categoryUpdate", "title": { "en": "Version 5 is out" }, "text": { "en": "Faster matchmaking and a new scoreboard." },
    "image": "images/slide-update.svg", "page": "home" }
]
```

```json title="data/calendar.json"
{
  "events": [
    { "id": "launch-week", "name": { "en": "Launch week" }, "start": "2026-11-15", "end": "2026-11-21",
      "color": "#4f8cff", "weekdays": null, "occurrences": null }
  ],
  "countdown": { "begins": "2026-11-15T12:00:00Z", "ends": "2026-11-22T12:00:00Z" }
}
```

`calendar` has a fixed, validated schema; see [localization and data](../../reference/localization-data/#calendar-document). Put the slide images in `assets/images/`.

## Template

```html title="templates/pages/home.html"
{%- set slides = data.slides -%}
{%- set index = state.slide if state.slide < slides|length else 0 -%}
{%- set current = slides[index] -%}
{%- set featured = data.calendar.events|first -%}
<div id="home-scroll" class="home-scroll" data-widget="scroll" data-scroll-state="home_scroll"
     data-snap="start, .home-details, end" data-snap-offset="20" data-snap-delay="180">
  {%- if current %}
  <section class="carousel" role="region" aria-roledescription="carousel" aria-label="{{ t('highlights') }}"
    data-widget="carousel" data-state="slide" data-count="{{ slides|length }}" data-interval="7000"
    data-elapsed-state="slide_elapsed" data-paused="{{ state.home_scroll >= 200 or not state.motion }}">
    <img class="slide-art" src="{{ asset(current.image) }}" alt="" width="896" height="236"
         style="opacity:{{ [1 - state.home_scroll / 500, 0.35]|max|num }}">
    <div class="slide-story" data-key="{{ index }}-{{ lang }}">
      <span class="category">{{ t(current.category) }}</span>
      <h1>{{ current.title|loc }}</h1>
      <p>{{ current.text|loc }}</p>
      <button class="slide-cta" data-on-click="navigate({{ current.page|arg }})">{{ t("learnMore") }} →</button>
    </div>
    <div class="carousel-tabs" role="group" aria-label="{{ t('highlights') }}">
      {%- for slide in slides %}
      {%- set on = loop.index0 == index %}
      <button class="carousel-tab" aria-label="{{ slide.title|loc }}" aria-pressed="{{ on }}"
              data-on-click="set('slide', {{ loop.index0|arg }})">
        <span class="carousel-track"><span style="width:{{ ([state.slide_elapsed / 70, 4]|max if on else 0)|num }}%"></span></span>
        <span class="carousel-label">{{ slide.title|loc }}</span>
      </button>
      {%- endfor %}
    </div>
  </section>
  {%- endif %}
  <div class="quick-cards">
    {%- if featured and data.calendar.countdown %}
    {%- set clock = countdown(data.calendar.countdown.begins, data.calendar.countdown.ends) %}
    <button class="quick-card" data-key="card-event" data-on-click="navigate('calendar')">
      <span class="quick-label">{{ t("nextEvent") }}</span>
      <strong>{{ featured.name|loc }}</strong>
      <span class="quick-value" data-widget="countdown" data-refresh="30000">
        {%- if clock.status == "upcoming" %}{{ clock.days }}d {{ clock.hours }}h {{ clock.minutes }}m
        {%- else %}{{ t("countdown." ~ clock.status) }}{% endif -%}
      </span>
    </button>
    {%- endif %}
  </div>
  <button class="scroll-hint" data-on-click="scroll_to('#home-scroll', '.home-details')">{{ t("more") }} ↓</button>
  <div class="home-details">
    <section class="card">
      <h2>{{ t("aboutTitle") }}</h2>
      <p>{{ t("aboutText") }}</p>
    </section>
    <button class="back-top" data-on-click="scroll_to('#home-scroll', 'start')">{{ t("backTop") }} ↑</button>
  </div>
</div>
```

## Translations

```json title="i18n/en.json (strings)"
"highlights": "Highlights",
"learnMore": "Learn more",
"categoryEvent": "Event",
"categoryUpdate": "Update",
"nextEvent": "Next event",
"countdown.ongoing": "Happening now",
"countdown.ended": "Ended",
"more": "More",
"aboutTitle": "About the game",
"aboutText": "A competitive online game for Windows.",
"backTop": "Back to top"
```

## Styles

```css title="styles (structural rules)"
/* The scroll container: bounded height and its own overflow. 630 - 40 - 44 - 88 = 458 px here. */
.home-scroll { height: 458px; padding: 20px 32px; overflow-x: hidden; overflow-y: auto; }
.carousel { position: relative; height: 236px; overflow: hidden; border-radius: 12px; }
.slide-art { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.slide-story { position: relative; padding: 28px 32px 0; animation: slide-enter 0.45s ease-out; }
@keyframes slide-enter { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
.carousel-tabs { position: absolute; right: 24px; bottom: 16px; left: 24px; display: flex; }
.carousel-track { display: block; height: 3px; background: rgba(255, 255, 255, 0.2); }
.carousel-track span { display: block; height: 100%; background: var(--accent); }
.carousel-tab[aria-pressed="true"] { color: var(--text); }
.app[data-motion="false"] .slide-story { animation: none; }
.quick-cards { display: flex; margin-top: 16px; }
.home-details { padding-top: 24px; min-height: 420px; }
```

Give `.home-details` enough height that the snap anchor can actually be reached: an anchor beyond the maximum scroll offset is clamped to `end`.

## How it behaves

- **Two stops.** After the wheel stops for 180 ms, the container snaps to the nearest anchor in the wheel's direction: the top, `.home-details` (its top minus 20 px), or the end. A small wheel step is enough to move to the next stop.
- **Scroll-linked values.** `home_scroll` is the exact offset in px. The art fades from 1 to 0.35 over 325 px, and the carousel pauses after 200 px.
- **Carousel.** Advances every 7 s; the track grows with `slide_elapsed`. Hovering, focusing a slide button, an inactive window, scrolling away, or the motion setting pause it. Choosing a slide resets the progress.
- **Countdown.** The card re-renders the window every 30 s, so the days, hours, and minutes stay current; after `begins` it shows "Happening now".
- **Keyboard.** The renderer has no keyboard scrolling. **More ↓** and **Back to top ↑** use `scroll_to()` with the same anchors, and Tab reaches every button in DOM order.
- **Navigation.** `slide`, `slide_elapsed`, and `home_scroll` reset when the player leaves the page; the persisted `motion` setting stays.

