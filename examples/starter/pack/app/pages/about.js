// About: game facts and system requirements from pack.json game.info and game.requirements,
// the fair-play notice and the FAQ (data/faq.json). The FAQ is an accordion whose closed answers
// are not rendered, so Tab never reaches them. Past 160 px of scroll a back-to-top button shows.
import { html, useState } from "../../vendor/preact.js";
import { List, Markdown, ScrollArea, scrollTo, useApp } from "../ui.js";

const FACTS = ["developer", "publisher", "release_date", "age_rating"];
const TIERS = ["minimum", "recommended"];

export function About() {
  const { game, i18n, data, settings } = useApp();
  const { t, loc, date } = i18n;
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState([]);
  const info = game.info ?? {};
  const requirements = game.requirements ?? {};
  const toggle = (id) => setOpen((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  return html`
    <div class="about-page">
      <${ScrollArea} id="about-scroll" className="about-scroll" onOffset=${setOffset}>
        <div class="about">
          <section class="card about-game">
            <h1>${game.name}</h1>
            <p>${t("aboutText")}</p>
            <div class="facts">
              ${FACTS.filter((key) => info[key]).map(
                (key) => html`
                  <div class="fact">
                    <span class="fact-label">${t(`info.${key}`)}</span>
                    <span class="fact-value">${key === "release_date" ? date(info[key], "long") : info[key]}</span>
                  </div>`,
              )}
            </div>
          </section>
          <section class="card fair-play">
            <h2>${t("fairPlayTitle")}</h2>
            <p>${t("fairPlayText")}</p>
            <button class="link-button" onClick=${() => scrollTo("about-scroll", "#faq")}>${t("faq")} ↓</button>
          </section>
          <section class="card requirements" aria-labelledby="requirements-heading">
            <h2 id="requirements-heading">${t("requirements")}</h2>
            <div class="requirement-columns">
              ${TIERS.filter((tier) => requirements[tier]).map(
                (tier) => html`
                  <div class="requirement-column">
                    <h3>${t(`requirements.${tier}`)}</h3>
                    ${requirements[tier].map(
                      (row) => html`
                        <div class="fact">
                          <span class="fact-label">${t(`requirement.${row.label}`)}</span>
                          <span class="fact-value">${row.value}</span>
                        </div>`,
                    )}
                  </div>`,
              )}
            </div>
          </section>
          <section id="faq" class="card faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading">${t("faq")}</h2>
            <${List} className="faq-list">
              ${data.faq.flatMap((item) => {
                const expanded = open.includes(item.id);
                const question = html`
                  <button
                    class=${expanded ? "faq-question open" : "faq-question"}
                    key=${`faq-q-${item.id}`}
                    aria-expanded=${expanded}
                    aria-controls=${`faq-${item.id}`}
                    onClick=${() => toggle(item.id)}
                  >
                    <span>${loc(item.question)}</span>
                    <img src="assets/images/caret.svg" alt="" width="10" height="10" draggable="false" />
                  </button>`;
                const answer =
                  expanded &&
                  html`<${Markdown}
                    key=${`faq-a-${item.id}`}
                    id=${`faq-${item.id}`}
                    className="faq-answer article-body"
                    role="region"
                    source=${loc(item.answer)}
                    size=${settings.article_size}
                  />`;
                return answer ? [question, answer] : [question];
              })}
            <//>
          </section>
        </div>
      <//>
      ${offset > 160 &&
      html`<button class="back-top floating" key="about-top" onClick=${() => scrollTo("about-scroll", "start")}>${t("backTop")} ↑</button>`}
    </div>`;
}
