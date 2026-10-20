---
title: Launch bar
description: A complete bottom bar - launcher phases, determinate and indeterminate progress, size, speed and time left, anti-cheat status with a tooltip, and a confirmed cancel.
sidebar:
  order: 2
---

The launch bar is the part of the main window players use most. This example renders every launcher phase, shows download details, explains the anti-cheat status in a tooltip, and confirms before cancelling a download.

**Uses:** [`tooltip`](../../widgets/tooltip/), [`modal`](../../widgets/modal/), launcher actions, `anticheat`, `bytes()`, `duration()`. **Core API:** 2.

## Declarations

```json title="pack.json"
"core_api": 2,
"game": {
  "download_size": 2147483648
},
"error_state": "toast",
"state": {
  "toast":   { "type": "string", "default": "" },
  "tip":     { "type": "string", "default": "", "reset": "page" },
  "confirm": { "type": "string", "default": "", "values": ["", "cancel_download"], "reset": "page" }
}
```

Add `download_size` to your existing `game` object (bytes, here 2 GiB). Without it, `launcher.total`, `downloaded`, `speed`, and `eta` stay none and the detail line stays empty.

## Template

```html title="templates/launch-bar.html"
{%- set phase = launcher.phase -%}
{%- set busy = phase in ["checking", "verifying", "launching"] -%}
{%- set transfer = phase in ["downloading", "paused"] -%}
{%- set left = duration(launcher.eta) -%}
<footer class="launch-bar" data-phase="{{ phase }}">
  <div class="tip-anchor">
    <button class="protection" aria-describedby="tip-protection" data-widget="tooltip" data-state="tip" data-value="protection">
      <span class="protection-dot" data-status="{{ anticheat.status }}"></span>
      <span class="protection-text">
        <span class="protection-label">{{ t("antiCheat") }}</span>
        <strong>{{ t("anticheat." ~ anticheat.status) }}</strong>
      </span>
    </button>
    {%- if state.tip == "protection" %}
    <span id="tip-protection" class="tooltip tooltip-up" role="tooltip" data-key="tip-protection">
      {{- t("anticheatTip." ~ anticheat.status) }}{% if anticheat.simulated %} {{ t("anticheatSimulated") }}{% endif -%}
    </span>
    {%- endif %}
  </div>
  <div class="progress-area">
    <div class="progress-heading">
      <span class="phase-label">{{ t("phase." ~ phase) }}</span>
      {%- if transfer %}<span class="progress-value">{{ launcher.progress|int }}%</span>{% endif %}
    </div>
    <div class="progress" role="progressbar" aria-label="{{ t('phase.' ~ phase) }}" aria-valuemin="0" aria-valuemax="100"
      {%- if not busy %} aria-valuenow="{{ launcher.progress|int }}"{% endif %}>
      {%- if busy %}<i class="progress-runner"></i>{% else %}<span style="width:{{ launcher.progress|num }}%"></span>{% endif -%}
    </div>
    <div class="progress-detail">
      {%- if transfer and launcher.total is not none %}
      <span>{{ bytes(launcher.downloaded) }} / {{ bytes(launcher.total) }}</span>
      {%- endif %}
      {%- if phase == "downloading" and launcher.speed is not none %}
      <span>{{ bytes(launcher.speed) }}/s</span>
      {%- endif %}
      {%- if phase == "downloading" and left %}
      <span>{{ t("timeLeft") }} {{ left.hours }}h {{ left.minutes }}m {{ left.seconds }}s</span>
      {%- endif %}
      {%- if phase == "ready" %}
      <span>{{ t("version") }} {{ launcher.client_version }}</span>
      {%- endif %}
    </div>
  </div>
  <div class="launch-actions">
    {%- if phase == "downloading" %}
    <button class="secondary" data-key="pause" data-on-click="pause()">{{ t("pause") }}</button>
    {%- elif phase == "paused" %}
    <button class="secondary" data-key="resume" data-on-click="resume()">{{ t("resume") }}</button>
    {%- endif %}
    {%- if transfer %}
    <button id="cancel-download" class="secondary" data-on-click="set('confirm', 'cancel_download')">{{ t("cancel") }}</button>
    {%- elif phase == "ready" %}
    <button class="secondary" data-key="check" data-on-click="check()">{{ t("checkUpdates") }}</button>
    {%- endif %}
    {%- if phase == "cancelled" %}
    <button id="play" class="play" data-on-click="retry()">{{ t("retry") }}</button>
    {%- else %}
    <button id="play" class="play"{% if phase != "ready" %} disabled{% endif %} data-on-click="play()">{{ t("play") }}</button>
    {%- endif %}
  </div>
</footer>
```

```html title="templates/layout.html (inside the root, after the page; render dialogs last)"
{% include "launch-bar.html" %}
{%- if state.confirm == "cancel_download" and launcher.phase in ["downloading", "paused"] %}
<div class="overlay" data-key="confirm-cancel" data-widget="modal" data-on-close="set('confirm', '')" data-return-focus="#play">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-cancel-title" aria-describedby="confirm-cancel-text">
    <h2 id="confirm-cancel-title">{{ t("cancelDownloadTitle") }}</h2>
    <p id="confirm-cancel-text">{{ t("cancelDownloadText") }}</p>
    <div class="dialog-actions">
      <button class="dialog-button" autofocus data-on-click="set('confirm', '')">{{ t("keepDownloading") }}</button>
      <button class="dialog-button danger" data-on-click="cancel(); set('confirm', '')">{{ t("cancelDownload") }}</button>
    </div>
  </div>
</div>
{%- endif %}
```

## Translations

```json title="i18n/en.json (strings)"
"antiCheat": "Anti-cheat",
"anticheat.checking": "Checking protection",
"anticheat.updating": "Updating protection",
"anticheat.ready": "Protection ready",
"anticheat.unavailable": "Protection unavailable",
"anticheat.error": "Protection error",
"anticheatTip.checking": "The launcher is checking the protection module.",
"anticheatTip.updating": "The protection module is updated together with the game.",
"anticheatTip.ready": "The protection starts together with the game.",
"anticheatTip.unavailable": "The protection cannot start. Update the game again.",
"anticheatTip.error": "The protection failed. Contact support.",
"anticheatSimulated": "(Simulated status in this launcher version.)",
"phase.checking": "Checking for updates…",
"phase.downloading": "Downloading update",
"phase.paused": "Download paused",
"phase.verifying": "Verifying files…",
"phase.ready": "Ready to play",
"phase.cancelled": "Update cancelled",
"phase.launching": "Starting the game…",
"timeLeft": "Time left",
"version": "Version",
"pause": "Pause",
"resume": "Resume",
"cancel": "Cancel",
"checkUpdates": "Check for updates",
"retry": "Retry",
"play": "Play",
"cancelDownloadTitle": "Cancel the update?",
"cancelDownloadText": "You can start the game only after the update is complete.",
"keepDownloading": "Keep downloading",
"cancelDownload": "Cancel update",
"close": "Close",
"linkFailed": "Unable to open the browser.",
"pickFailed": "Unable to choose the folder."
```

## Styles

```css title="styles (structural rules)"
.app { position: relative; }
.launch-bar { display: flex; align-items: center; height: 88px; padding: 0 24px; }
.tip-anchor { position: relative; }
.tooltip { position: absolute; left: 0; z-index: 60; width: 260px; padding: 8px 10px; }
.tooltip-up { bottom: 100%; margin-bottom: 8px; }
.protection-dot { width: 10px; height: 10px; border-radius: 5px; background: var(--warning); }
.protection-dot[data-status="ready"] { background: var(--ready); }
.protection-dot[data-status="unavailable"], .protection-dot[data-status="error"] { background: var(--danger); }
.progress-area { display: flex; flex-direction: column; flex: 1; margin: 0 24px; }
.progress { position: relative; height: 6px; overflow: hidden; border-radius: 3px; background: var(--border); }
.progress span { display: block; height: 100%; background: var(--accent); }
.launch-bar[data-phase="ready"] .progress span { background: var(--ready); }
.progress-runner { position: absolute; top: 0; bottom: 0; width: 30%; background: var(--accent);
                   animation: progress-slide 1.2s ease-in-out infinite; }
@keyframes progress-slide { from { margin-left: -30%; } to { margin-left: 100%; } }
.play:disabled { opacity: 0.5; cursor: default; }
.overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 50;
           display: flex; align-items: center; justify-content: center; background: rgba(5, 8, 12, 0.72); }
```

## How it behaves

- **Phases.** `checking`, `verifying`, and `launching` show the animated runner without `aria-valuenow`; the other phases show the progress bar.
- **Details.** Size appears in `downloading` and `paused`; speed and time left only in `downloading`, because the core reports a speed of 0 and no ETA while paused. `speed` stays none until the second one-second sample.
- **Actions.** Only valid actions are visible or enabled. `play()` in `ready` opens the splash and closes the main window. The `#play` id is shared by **Play** and **Retry**, so the button keeps its node, and focus survives the switch.
- **Cancel.** The dialog appears only while a transfer is running; if the download ends, the condition removes the dialog. After **Cancel update**, the opener disappears, so focus returns to `#play` (now **Retry**).
- **Tooltip.** Appears after 400 ms of hover or immediately on keyboard focus; Escape, a click, or leaving hides it. It owns the shared `tip` variable while visible.
- **Simulation.** The phase, download, and anti-cheat status are simulated by the current core; the tooltip says so while `anticheat.simulated` is `true`.

## Try it in Studio

Use the panel's **Launcher** control to freeze the simulation at any phase and progress, and to enter download fields directly; use **Anti-cheat** to show `error`. Check that every phase label and tooltip text is translated in every language.

