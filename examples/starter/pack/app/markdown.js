// A small Markdown renderer that builds Preact nodes, never HTML text: paragraphs, headings,
// emphasis, inline code, code blocks, block quotes, lists, rules and hard breaks. Raw HTML stays
// text and an image shows its alt text. A link to an allowed host becomes a `button.md-link` that
// opens it with launcher.openUrl; any other link stays text. A source over 32 KiB, nested deeper
// than 16 levels or producing more than 2000 elements is shown as one plain paragraph.
import { h } from "../vendor/preact.js";

const MAX_SOURCE = 32 * 1024;
const MAX_DEPTH = 16;
const MAX_ELEMENTS = 2000;

class TooLarge extends Error {}

/** Whether openUrl accepts `url`: HTTPS without user info, to a host of `hosts` or a subdomain. */
export function isAllowedUrl(url, hosts) {
  const match = /^https:\/\/([^/?#]*)/i.exec(url);
  if (!match || match[1].includes("@")) return false;
  const host = match[1].replace(/:\d*$/, "").toLowerCase();
  return host !== "" && hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

const LIST_ITEM = /^ {0,3}([-*+]|\d{1,9}[.)])( +|$)/;
const HEADING = /^ {0,3}(#{1,6})(?: +(.*?))?(?: +#+)? *$/;
const RULE = /^ {0,3}([-*_])(?: *\1){2,} *$/;
const FENCE = /^ {0,3}(```|~~~)/;
const QUOTE = /^ {0,3}> ?/;
const blank = (line) => line.trim() === "";
const startsBlock = (line) => HEADING.test(line) || RULE.test(line) || FENCE.test(line) || QUOTE.test(line) || LIST_ITEM.test(line);

class Builder {
  constructor(options) {
    this.options = options;
    this.elements = 0;
  }

  node(type, props, children, depth) {
    this.elements += 1;
    if (this.elements > MAX_ELEMENTS || depth > MAX_DEPTH) throw new TooLarge();
    return h(type, props, children);
  }

  blocks(lines, depth) {
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (blank(line)) {
        i += 1;
        continue;
      }
      let match;
      if ((match = FENCE.exec(line))) {
        const code = [];
        i += 1;
        while (i < lines.length && !lines[i].trimStart().startsWith(match[1])) code.push(lines[i++]);
        i += 1;
        out.push(this.node("pre", null, this.node("code", null, code.join("\n"), depth + 1), depth));
      } else if ((match = HEADING.exec(line))) {
        out.push(this.node(`h${match[1].length}`, null, this.inline(match[2] ?? "", depth + 1), depth));
        i += 1;
      } else if (RULE.test(line)) {
        out.push(this.node("hr", null, null, depth));
        i += 1;
      } else if (QUOTE.test(line)) {
        const quoted = [];
        while (i < lines.length && QUOTE.test(lines[i])) quoted.push(lines[i++].replace(QUOTE, ""));
        out.push(this.node("blockquote", null, this.blocks(quoted, depth + 1), depth));
      } else if (LIST_ITEM.test(line)) {
        i = this.list(lines, i, depth, out);
      } else {
        const text = [];
        while (i < lines.length && !blank(lines[i]) && (text.length === 0 || !startsBlock(lines[i]))) text.push(lines[i++]);
        out.push(this.node("p", null, this.inline(text.join("\n"), depth + 1), depth));
      }
    }
    return out;
  }

  /** One list starting at lines[i]; returns the index after it. */
  list(lines, i, depth, out) {
    const ordered = /\d/.test(LIST_ITEM.exec(lines[i])[1]);
    const items = [];
    let loose = false;
    while (i < lines.length) {
      const match = LIST_ITEM.exec(lines[i]);
      if (!match || /\d/.test(match[1]) !== ordered) break;
      const indent = match[0].length;
      const body = [lines[i].slice(indent)];
      i += 1;
      while (i < lines.length) {
        const line = lines[i];
        if (blank(line)) {
          // A blank line continues the item only when indented content follows.
          if (i + 1 < lines.length && /^ {2,}\S/.test(lines[i + 1]) && !LIST_ITEM.test(lines[i + 1])) {
            loose = true;
            body.push("");
            i += 1;
            continue;
          }
          break;
        }
        if (/^ {2,}/.test(line)) body.push(line.replace(/^ {1,4}/, ""));
        else if (!startsBlock(line)) body.push(line);
        else break;
        i += 1;
      }
      items.push({ body, start: Number.parseInt(match[1], 10) });
      if (i < lines.length && blank(lines[i]) && i + 1 < lines.length && LIST_ITEM.test(lines[i + 1])) {
        loose = true;
        i += 1;
      }
    }
    const children = items.map(({ body }) => {
      const blocks = this.blocks(body, depth + 2);
      // A tight item shows its paragraph text without the <p>.
      const tight = !loose && blocks.length > 0 && blocks[0].type === "p" ? [blocks[0].props.children, ...blocks.slice(1)] : blocks;
      return this.node("li", null, tight, depth + 1);
    });
    const start = items[0].start;
    out.push(this.node(ordered ? "ol" : "ul", ordered && start !== 1 ? { start } : null, children, depth));
    return i;
  }

  inline(text, depth) {
    const out = [];
    let plain = "";
    const flush = () => {
      if (plain) out.push(plain);
      plain = "";
    };
    let i = 0;
    while (i < text.length) {
      const rest = text.slice(i);
      let match;
      if (rest[0] === "\\" && /^\\[\\`*_[\]()#+\-.!>~]/.test(rest)) {
        plain += rest[1];
        i += 2;
      } else if (rest[0] === "\\" && rest[1] === "\n") {
        flush();
        out.push(this.node("br", null, null, depth));
        i += 2;
      } else if ((match = /^ {2,}\n/.exec(rest))) {
        flush();
        out.push(this.node("br", null, null, depth));
        i += match[0].length;
      } else if (rest[0] === "\n") {
        // A soft line break is a space.
        plain += " ";
        i += 1;
      } else if ((match = /^(`+)([\s\S]*?[^`])\1(?!`)/.exec(rest))) {
        flush();
        out.push(this.node("code", null, match[2].replace(/\n/g, " ").trim(), depth));
        i += match[0].length;
      } else if ((match = /^!\[([^\]]*)\]\(([^)\s]*)(?: "[^"]*")?\)/.exec(rest))) {
        plain += match[1];
        i += match[0].length;
      } else if ((match = /^\[([^\]]+)\]\(([^)\s]*)(?: "[^"]*")?\)/.exec(rest))) {
        flush();
        const [, label, url] = match;
        const children = this.inline(label, depth + 1);
        if (isAllowedUrl(url, this.options.allowedHosts)) {
          out.push(this.node("button", { class: "md-link", onClick: () => this.options.openLink(url) }, children, depth));
        } else {
          out.push(...children);
        }
        i += match[0].length;
      } else if ((match = /^(\*\*|__)(?=\S)([\s\S]*?\S)\1/.exec(rest))) {
        flush();
        out.push(this.node("strong", null, this.inline(match[2], depth + 1), depth));
        i += match[0].length;
      } else if ((match = /^(\*|_)(?=\S)([\s\S]*?\S)\1(?!\1)/.exec(rest))) {
        flush();
        out.push(this.node("em", null, this.inline(match[2], depth + 1), depth));
        i += match[0].length;
      } else {
        plain += rest[0];
        i += 1;
      }
    }
    flush();
    return out;
  }
}

function utf8Length(text) {
  let length = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    length += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return length;
}

/**
 * The nodes of a Markdown source.
 * @param {string} source
 * @param {{ allowedHosts: string[], openLink: (url: string) => void }} options
 */
export function renderMarkdown(source, options) {
  const text = String(source ?? "");
  if (utf8Length(text) > MAX_SOURCE) return [h("p", null, text)];
  try {
    return new Builder(options).blocks(text.replace(/\r\n?/g, "\n").split("\n"), 1);
  } catch (error) {
    if (error instanceof TooLarge) return [h("p", null, text)];
    throw error;
  }
}
