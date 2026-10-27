// Settings, saved in localStorage by settings.js. Toggles are role="switch" buttons, selects are
// dropdowns with one button per allowed value (the renderer has no <select>), the stepper
// changes a whole number within its range, and the folder comes from launcher.pickFolder; the
// pack only keeps the path.
import { html, useState } from "../../vendor/preact.js";
import { ACCENTS, ARTICLE_SIZE, DENSITIES } from "../settings.js";
import { Dropdown, Modal, useApp, useTooltip } from "../ui.js";

function Setting({ title, hint, children }) {
  return html`
    <div class="setting">
      <div class="setting-text">
        <strong>${title}</strong>
        <span class="setting-hint">${hint}</span>
      </div>
      ${children}
    </div>`;
}

function Select({ label, values, value, onChange, swatch = false, text }) {
  const [open, setOpen] = useState(false);
  return html`
    <${Dropdown} className="select" open=${open} onClose=${() => setOpen(false)}>
      <button class="select-button" aria-label=${label} aria-expanded=${open} onClick=${() => setOpen(!open)}>
        ${swatch && html`<i class="swatch" data-color=${value}></i>`}
        <span>${text(value)}</span>
        <img src="assets/images/caret.svg" alt="" width="10" height="10" draggable="false" />
      </button>
      ${open &&
      html`
        <div class="select-menu" role="listbox" aria-label=${label}>
          ${values.map(
            (option) => html`
              <button
                class=${option === value ? "select-option chosen" : "select-option"}
                role="option"
                aria-selected=${option === value}
                onClick=${() => {
                  onChange(option);
                  setOpen(false);
                }}
              >${swatch && html`<i class="swatch" data-color=${option}></i>`}${text(option)}</button>`,
          )}
        </div>`}
    <//>`;
}

function Switch({ label, on, onToggle }) {
  return html`<button class="switch" role="switch" aria-label=${label} aria-checked=${on} onClick=${onToggle}><span></span></button>`;
}

function FolderSetting() {
  const { i18n, settings, changeSettings, showToast } = useApp();
  const { t } = i18n;
  const { shown, trigger } = useTooltip("folder");
  const choose = () => {
    launcher
      .pickFolder(settings.screenshots_dir || undefined)
      .then((path) => {
        // Cancel resolves null and keeps the current folder.
        if (path !== null) changeSettings({ screenshots_dir: path });
      })
      .catch((error) => {
        // `dialogFailed` (or another dialog is open) and `tooLarge` (a path over 1024 characters).
        if (error?.code === undefined) throw error;
        showToast("pickFailed");
      });
  };
  return html`
    <div class="setting setting-path">
      <div class="setting-text">
        <span class="setting-title">
          <strong>${t("screenshots")}</strong>
          <span class="tip-anchor">
            <button class="help" aria-label=${t("help")} aria-describedby="tip-folder" ...${trigger}>?</button>
            ${shown && html`<span id="tip-folder" class="tooltip tooltip-up" role="tooltip">${t("screenshotsTip")}</span>`}
          </span>
        </span>
        <span class="path">${settings.screenshots_dir || t("notSet")}</span>
      </div>
      <div class="path-actions">
        ${settings.screenshots_dir &&
        html`<button class="secondary-button" key="clear-folder" onClick=${() => changeSettings({ screenshots_dir: "" })}>${t("clear")}</button>`}
        <button class="secondary-button" key="choose-folder" onClick=${choose}>${t("choose")}</button>
      </div>
    </div>`;
}

/** Confirms restoring every setting of the page to its default. */
export function ResetDialog({ onClose }) {
  const { i18n, resetSettings } = useApp();
  const { t } = i18n;
  return html`
    <${Modal} onClose=${onClose} returnFocus="#reset-settings">
      <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-reset-title" aria-describedby="confirm-reset-text">
        <h2 id="confirm-reset-title">${t("resetTitle")}</h2>
        <p id="confirm-reset-text">${t("resetText")}</p>
        <div class="dialog-actions">
          <button class="dialog-button" autofocus onClick=${onClose}>${t("keepSettings")}</button>
          <button
            class="dialog-button danger"
            onClick=${() => {
              resetSettings();
              onClose();
            }}
          >${t("resetConfirm")}</button>
        </div>
      </div>
    <//>`;
}

export function Settings() {
  const { i18n, settings, changeSettings, setLanguage, openDialog } = useApp();
  const { t, lang, languages } = i18n;
  const size = settings.article_size;
  return html`
    <div class="settings">
      <div class="settings-columns">
        <section class="card settings-group" aria-labelledby="appearance-heading">
          <h2 id="appearance-heading">${t("appearance")}</h2>
          <${Setting} title=${t("accentColor")} hint=${t("accentColorHint")}>
            <${Select}
              label=${t("accentColor")}
              values=${ACCENTS}
              value=${settings.accent}
              onChange=${(accent) => changeSettings({ accent })}
              swatch
              text=${(value) => t(`accent.${value}`)}
            />
          <//>
          <${Setting} title=${t("density")} hint=${t("densityHint")}>
            <${Select}
              label=${t("density")}
              values=${DENSITIES}
              value=${settings.density}
              onChange=${(density) => changeSettings({ density })}
              text=${(value) => t(`density.${value}`)}
            />
          <//>
          <${Setting} title=${t("motion")} hint=${t("motionHint")}>
            <${Switch} label=${t("motion")} on=${settings.motion} onToggle=${() => changeSettings({ motion: !settings.motion })} />
          <//>
          <${Setting} title=${t("language")} hint=${t("languageHint")}>
            <div class="segmented" role="group" aria-label=${t("language")}>
              ${languages.map(
                (language) => html`
                  <button class=${language.code === lang ? "segment on" : "segment"} aria-pressed=${language.code === lang} onClick=${() => setLanguage(language.code)}>
                    ${language.code.toUpperCase()}
                  </button>`,
              )}
            </div>
          <//>
        </section>
        <section class="card settings-group" aria-labelledby="launcher-heading">
          <h2 id="launcher-heading">${t("launcherSettings")}</h2>
          <${Setting} title=${t("badges")} hint=${t("badgesHint")}>
            <${Switch} label=${t("badges")} on=${settings.badges} onToggle=${() => changeSettings({ badges: !settings.badges })} />
          <//>
          <${Setting} title=${t("launchDetails")} hint=${t("launchDetailsHint")}>
            <${Switch}
              label=${t("launchDetails")}
              on=${settings.launch_details}
              onToggle=${() => changeSettings({ launch_details: !settings.launch_details })}
            />
          <//>
          <${Setting} title=${t("articleSize")} hint=${t("articleSizeHint")}>
            <div class="stepper" role="group" aria-label=${t("articleSize")}>
              <button class="icon-button" aria-label=${t("smaller")} disabled=${size <= ARTICLE_SIZE.min} onClick=${() => changeSettings({ article_size: size - 1 })}>−</button>
              <span>${size} px</span>
              <button class="icon-button" aria-label=${t("larger")} disabled=${size >= ARTICLE_SIZE.max} onClick=${() => changeSettings({ article_size: size + 1 })}>+</button>
            </div>
          <//>
          <${FolderSetting} />
        </section>
      </div>
      <div class="settings-footer">
        <span>${t("settingsSaved")}</span>
        <button id="reset-settings" class="secondary-button" onClick=${() => openDialog({ type: "reset" })}>${t("resetSettings")}</button>
      </div>
    </div>`;
}
