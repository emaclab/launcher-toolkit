---
title: Launch bar
description: A complete core API 3 bottom bar - every launcher phase, determinate and indeterminate progress, size, speed and time left, blocking programs with a confirmed force close, repair and retry, and the anti-cheat status with a tooltip and its error message.
sidebar:
  order: 2
---

The launch bar is the part of the main window players use most. Like the starter, this example renders every launcher phase of core API 3, distinguishes a failed check from a running one, shows download details and the programs that block an update, offers repair and retry, explains the anti-cheat status in a tooltip, shows the last anti-cheat error, and confirms before closing programs.

**Uses:** [`tooltip`](../../widgets/tooltip/), [`modal`](../../widgets/modal/), launcher actions, `launcher.blocked`, `launcher.check_failed`, `anticheat`, `bytes()`, `duration()`. **Core API:** 3. The [starter pack](../starter-pack/) includes this pattern in a runnable project.

## Declarations

```json title="pack.json"
"core_api": 3,
"game": {
  "download_size": 2147483648
},
"error_state": "toast",
"state": {
  "toast":   { "type": "string", "default": "" },
  "tip":     { "type": "string", "default": "", "reset": "page" },
  "confirm": { "type": "string", "default": "", "values": ["", "force_close"], "reset": "page" }
}
```

Add `download_size` to your existing `game` object (bytes, here 2 GiB). It sets the size of the simulated update in Pack Studio and in a launcher without a configured game update. Without a known size, `launcher.total`, `downloaded`, `speed`, and `eta` stay none and the detail line stays empty.

## Template

```html title="templates/launch-bar.html"
{%- set phase = launcher.phase -%}
{%- set failed = launcher.check_failed -%}
{%- set busy = phase in ["checking", "verifying", "launching"] and not failed -%}
{%- set label = t("checkFailed") if failed else t("phase." ~ phase) -%}
{%- set retry = failed or phase in ["blocked", "launch_failed"] or (phase == "ready" and anticheat.status == "error") -%}
{%- set transfer = phase in ["downloading", "blocked"] -%}
{%- set left = duration(launcher.eta) -%}
<footer class="launch-bar" data-phase="{{ phase }}" data-check-failed="{{ failed }}">
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
      <span class="phase-label">{{ label }}</span>
      {%- if transfer %}<span class="progress-value">{{ launcher.progress|int }}%</span>{% endif %}
    </div>
    <div class="progress" role="progressbar" aria-label="{{ label }}" aria-valuemin="0" aria-valuemax="100"
      {%- if not busy %} aria-valuenow="{{ launcher.progress|int }}"{% endif %}>
      {%- if busy %}<i class="progress-runner"></i>{% else %}<span style="width:{{ launcher.progress|num }}%"></span>{% endif -%}
    </div>
    <div class="progress-detail">
      {%- if phase == "blocked" %}
      <span>{{ t("filesInUse") }}: {% for process in launcher.blocked.processes %}{{ process.name }}{% if not loop.last %}, {% endif %}{% endfor %}</span>
      {%- elif transfer and launcher.total is not none %}
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
    {%- if phase == "blocked" %}
    <button id="close-programs" class="secondary" data-on-click="set('confirm', 'force_close')">{{ t("closePrograms") }}</button>
    {%- elif phase == "ready" %}
    <button class="secondary" data-key="check" data-on-click="check()">{{ t("checkUpdates") }}</button>
    {%- endif %}
    {%- if failed or phase in ["ready", "launch_failed"] %}
    <button class="secondary" data-key="repair" data-on-click="repair()">{{ t("repair") }}</button>
    {%- endif %}
    {%- if retry %}
    <button id="play" class="play" data-on-click="retry()">{{ t("retry") }}</button>
    {%- else %}
    <button id="play" class="play"{% if phase != "ready" or anticheat.status != "ready" %} disabled{% endif %} data-on-click="play()">{{ t("play") }}</button>
    {%- endif %}
  </div>
</footer>
```

```html title="templates/layout.html (inside the root, after the page; render dialogs last)"
{% include "launch-bar.html" %}
{%- if anticheat.message %}
<div class="ac-message" role="alert" data-key="ac-message">
  <strong>{{ anticheat.message.title }}</strong>
  <p>{{ anticheat.message.message }}</p>
</div>
{%- endif %}
{%- if state.confirm == "force_close" and launcher.phase == "blocked" %}
<div class="overlay" data-key="confirm-force-close" data-widget="modal" data-on-close="set('confirm', '')" data-return-focus="#play">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
    <h2 id="confirm-title">{{ t("closeProgramsTitle") }}</h2>
    <p id="confirm-text">{{ t("closeProgramsText") }}</p>
    <ul class="process-list">
      {%- for process in launcher.blocked.processes %}
      <li data-key="process-{{ process.pid }}">{{ process.name }} ({{ process.pid }})</li>
      {%- endfor %}
    </ul>
    <div class="dialog-actions">
      <button class="button" autofocus data-on-click="set('confirm', '')">{{ t("keepPrograms") }}</button>
      <button class="button danger" data-on-click="force_close(); set('confirm', '')">{{ t("closePrograms") }}</button>
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
"anticheatTip.unavailable": "The protection cannot start. Repair the game files or contact support.",
"anticheatTip.error": "The protection failed. Retry, or contact support.",
"anticheatSimulated": "(Simulated status.)",
"phase.checking": "Checking for updates…",
"phase.downloading": "Downloading update",
"phase.verifying": "Verifying files…",
"phase.blocked": "Files in use",
"phase.ready": "Ready to play",
"phase.launching": "Starting the game…",
"phase.launched": "The game is running",
"phase.launch_failed": "The game did not start",
"checkFailed": "The update failed",
"filesInUse": "Close these programs",
"timeLeft": "Time left",
"version": "Version",
"checkUpdates": "Check for updates",
"repair": "Repair",
"retry": "Retry",
"play": "Play",
"closePrograms": "Close programs",
"closeProgramsTitle": "Close the programs that use game files?",
"closeProgramsText": "Unsaved work in these programs is lost.",
"keepPrograms": "Keep them open",
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
.launch-bar[data-phase="ready"] .progress span, .launch-bar[data-phase="launched"] .progress span { background: var(--ready); }
.launch-bar[data-phase="blocked"] .progress span { background: var(--warning); }
.launch-bar[data-check-failed="true"] .progress span, .launch-bar[data-phase="launch_failed"] .progress span { background: var(--danger); }
.progress-runner { position: absolute; top: 0; bottom: 0; width: 30%; background: var(--accent);
                   animation: progress-slide 1.2s ease-in-out infinite; }
@keyframes progress-slide { from { margin-left: -30%; } to { margin-left: 100%; } }
.play:disabled { opacity: 0.5; cursor: default; }
.ac-message { position: absolute; right: 24px; bottom: 100px; z-index: 40; width: 320px; padding: 12px 14px; }
.overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 50;
           display: flex; align-items: center; justify-content: center; background: rgba(5, 8, 12, 0.72); }
```

## How it behaves

- **Phases.** `checking`, `verifying`, and `launching` show the animated runner without `aria-valuenow`, except when `launcher.check_failed` is `true`; then the runner stops and the label says **The update failed**. The other phases show the progress bar. `launched` means the game process exists; `launch_failed` brings the main window back.
- **Details.** Size appears in `downloading`; in `blocked` the detail line names the programs that hold game files instead. Speed and time left show only in `downloading`: in `blocked` the speed is 0 and there is no ETA. `speed` stays none until the second one-second sample.
- **Actions.** Only useful actions are visible or enabled. **Play** needs `ready` and `anticheat.status == "ready"`; it opens the splash and hides the main window. **Repair** verifies every file again from `ready`, after a failed launch, or while `launcher.check_failed`. **Retry** repeats a failed check, continues a blocked update after the player closed the programs, or restarts the anti-cheat after a failed launch or an anti-cheat error in `ready`. The `#play` id is shared by **Play** and **Retry**, so the button keeps its node and focus survives the switch.
- **Closing programs.** The dialog appears only while the update is blocked and lists the programs; if they release the files, the phase changes and the condition removes the dialog. After **Close programs**, the opener disappears, so focus returns to `#play`.
- **Failed check.** A failed check or game sync stays in `checking` with `launcher.check_failed: true`; all other situations report `false`. In `checking`, the template offers **Retry** and **Repair** only while the flag is true, never during a running check. Either accepted action clears it and starts the check again.
- **Anti-cheat message.** `anticheat.message` shows the last anti-cheat error; an accepted `retry()` clears it. **Play** is refused until the anti-cheat handshake is complete, even in `ready`.
- **Tooltip.** Appears after 400 ms of hover or immediately on keyboard focus; Escape, a click, or leaving hides it. It owns the shared `tip` variable while visible.
- **Simulation.** In Pack Studio the phases, the download, and the anti-cheat status are simulated, and the tooltip says so while `anticheat.simulated` is `true`. In the launcher, the anti-cheat status is real.

## Try it in Studio

Use the panel's **Launcher** control to freeze the simulation at any phase and progress and to enter download fields directly. During `downloading`, **Block** produces `blocked` with sample programs. **Fail** during `checking`, `downloading`, or `verifying` returns to `checking` with `launcher.check_failed: true`, and the panel shows **(check failed)**; during `launching` or `launched`, it produces `launch_failed`. Use **Anti-cheat** to show each status and **Sample message** to show `anticheat.message`; in `ready` with status `error`, **Retry** restores simulated protection and clears the message. The **Log** tab records whether each `retry()`, `repair()`, `check()`, and `force_close()` was accepted. Check that every phase label, the failure label, and tooltip text are translated in every language.
