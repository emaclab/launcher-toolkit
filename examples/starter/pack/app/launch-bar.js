// Bottom bar of the main window: anti-cheat status, update progress and the launch actions.
// Each action is offered only in the state where the core accepts it, and the session checks
// every request again:
// - blocked: force close (confirmed in a dialog that lists the programs) and retry;
// - failed check or launch_failed: repair and retry;
// - ready: check for updates and Play, which needs a ready anti-cheat; retry replaces Play when
//   the anti-cheat reports an error.
import { html } from "../vendor/preact.js";
import { splitDuration } from "./i18n.js";
import { request } from "./session.js";
import { Modal, useApp, useTooltip } from "./ui.js";

function Protection() {
  const { session, i18n } = useApp();
  const { t } = i18n;
  const { status, simulated } = session.anticheat;
  const { shown, trigger } = useTooltip("protection");
  return html`
    <div class="tip-anchor">
      <button class="protection" aria-describedby="tip-protection" ...${trigger}>
        <span class="protection-dot" data-status=${status}></span>
        <span class="protection-text">
          <span class="protection-label">${t("antiCheat")}</span>
          <strong>${t(`anticheat.${status}`)}</strong>
        </span>
      </button>
      ${shown &&
      html`<span id="tip-protection" class="tooltip tooltip-up" role="tooltip">
        ${t(`anticheatTip.${status}`)}${simulated ? ` ${t("anticheatSimulated")}` : ""}
      </span>`}
    </div>`;
}

function Detail() {
  const { session, i18n, settings } = useApp();
  const { t, bytes } = i18n;
  const { phase, checkFailed, message, download } = session;
  if (message) {
    // The last anti-cheat error, until retry clears it.
    return html`<span class="detail-alert"><strong>${message.title}</strong> ${message.message}</span>`;
  }
  if (phase === "blocked") {
    return html`
      <span>${t("heldBy")}</span>
      ${session.blocked.map((process) => html`<span class="held" key=${process.pid}>${process.name} (${process.pid})</span>`)}`;
  }
  if (checkFailed) return html`<span>${t("checkFailedHint")}</span>`;
  const parts = [];
  if (settings.launch_details && phase === "downloading") {
    if (download.total != null) parts.push(html`<span>${bytes(download.downloaded)} / ${bytes(download.total)}</span>`);
    if (download.speed != null) parts.push(html`<span>${bytes(download.speed)}/s</span>`);
    if (download.eta != null) {
      const left = splitDuration(download.eta);
      parts.push(html`<span>${t("timeLeft")} ${left.hours}h ${left.minutes}m ${left.seconds}s</span>`);
    }
  }
  if (phase === "ready") parts.push(html`<span>${t("version")} ${session.clientVersion}</span>`);
  return parts;
}

/** Confirms force close; the app shows it only in the blocked phase. */
export function ForceCloseDialog({ onClose }) {
  const { session, i18n } = useApp();
  const { t } = i18n;
  return html`
    <${Modal} onClose=${onClose} returnFocus="#launch-primary">
      <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-close-title" aria-describedby="confirm-close-text">
        <h2 id="confirm-close-title">${t("forceCloseTitle")}</h2>
        <p id="confirm-close-text">${t("forceCloseText")}</p>
        <ul class="dialog-processes">
          ${session.blocked.map(
            (process) => html`<li key=${process.pid}><strong>${process.name}</strong> <span>PID ${process.pid}</span></li>`,
          )}
        </ul>
        <div class="dialog-actions">
          <button class="dialog-button" autofocus onClick=${onClose}>${t("keepOpen")}</button>
          <button
            class="dialog-button danger"
            onClick=${() => {
              request("forceClose");
              onClose();
            }}
          >${t("forceCloseConfirm")}</button>
        </div>
      </div>
    <//>`;
}

export function LaunchBar() {
  const { session, i18n, openDialog } = useApp();
  const { t } = i18n;
  const { phase, checkFailed: failed, progress, anticheat } = session;
  const busy = ["checking", "verifying", "launching"].includes(phase) && !failed;
  const transfer = phase === "downloading" || phase === "blocked";
  const full = failed || ["ready", "launched", "launch_failed"].includes(phase);
  const retry = failed || phase === "blocked" || phase === "launch_failed" || (phase === "ready" && anticheat.status === "error");
  const label = failed ? t("checkFailed") : t(`phase.${phase}`);
  const value = Math.floor(full ? 100 : progress);
  return html`
    <footer class="launch-bar" data-phase=${phase} data-failed=${String(failed)}>
      <${Protection} />
      <div class="progress-area">
        <div class="progress-heading">
          <span class="phase-label">${label}</span>
          ${transfer && html`<span class="progress-value">${Math.floor(progress)}%</span>`}
        </div>
        <div class="progress" role="progressbar" aria-label=${label} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${busy ? undefined : value}>
          ${busy ? html`<i class="progress-runner" key="runner"></i>` : html`<span key="bar" style=${`width:${full ? 100 : progress}%`}></span>`}
        </div>
        <div class="progress-detail"><${Detail} /></div>
      </div>
      <div class="launch-actions">
        ${phase === "blocked" &&
        html`<button id="force-close" key="force-close" class="secondary" onClick=${() => openDialog({ type: "forceClose" })}>${t("forceClose")}</button>`}
        ${phase !== "blocked" &&
        (failed || phase === "launch_failed") &&
        html`<button class="secondary" key="repair" onClick=${() => request("repair")}>${t("repair")}</button>`}
        ${phase === "ready" &&
        !failed &&
        html`<button class="secondary" key="check" onClick=${() => request("check")}>${t("checkUpdates")}</button>`}
        ${retry
          ? html`<button id="launch-primary" key="retry" class="play" onClick=${() => request("retry")}>${t("retry")}</button>`
          : html`<button
              id="launch-primary"
              key="play"
              class="play"
              disabled=${phase !== "ready" || anticheat.status !== "ready"}
              onClick=${() => request("play")}
            >${t("play")}</button>`}
      </div>
    </footer>`;
}
