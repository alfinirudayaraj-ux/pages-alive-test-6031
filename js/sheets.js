/* ============================================================
   ARENA — sheet manager
   Bottom sheet on mobile, floating dialog on desktop.
   Supports a stack, so a filter sheet can open over the store.
   ============================================================ */

import { $, el, esc } from "./utils.js";

const layer = () => $("#sheetLayer");
const stack = [];

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>`;

/** Open a sheet. Returns a handle: { root, body, close() } */
export function openSheet({ title = "", sub = "", body = "", wide = false, onMount } = {}) {
  const scrim = el(`<div class="scrim"></div>`);
  const sheet = el(`
    <section class="sheet ${wide ? "sheet--wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title || "Panel")}">
      <div class="sheet__grip"></div>
      <div class="sheet__head">
        <div>
          <h3 class="sheet__title">${title}</h3>
          ${sub ? `<p class="sheet__sub">${sub}</p>` : ""}
        </div>
        <button class="sheet__close" aria-label="Close">${CLOSE_ICON}</button>
      </div>
      <div class="sheet__body">${body}</div>
    </section>
  `);

  layer().append(scrim, sheet);
  document.body.style.overflow = "hidden";

  const handle = {
    root: sheet,
    body: sheet.querySelector(".sheet__body"),
    scrim,
    close: () => close(handle),
  };
  stack.push(handle);

  requestAnimationFrame(() => {
    scrim.classList.add("is-open");
    sheet.classList.add("is-open");
  });

  scrim.addEventListener("click", handle.close);
  sheet.querySelector(".sheet__close").addEventListener("click", handle.close);

  if (onMount) onMount(handle);

  return handle;
}

function close(handle) {
  const i = stack.indexOf(handle);
  if (i === -1) return;
  stack.splice(i, 1);
  handle.scrim.classList.remove("is-open");
  handle.root.classList.remove("is-open");
  setTimeout(() => {
    handle.scrim.remove();
    handle.root.remove();
    if (!stack.length) document.body.style.overflow = "";
  }, 420);
}

export const closeTop = () => stack.length && stack[stack.length - 1].close();
export const closeAll = () => [...stack].reverse().forEach((h) => h.close());

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTop();
});

/* ---------------- ready-made sheets ---------------- */

export function successSheet({ title, text, primary = "Done", onPrimary, extra = "" }) {
  const h = openSheet({
    title: "",
    body: `
      <div class="success">
        <div class="success__ring">
          <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
        </div>
        <h3>${esc(title)}</h3>
        <p>${esc(text)}</p>
        ${extra}
        <button class="btn btn--primary btn--block" data-done>${esc(primary)}</button>
      </div>
    `,
  });
  h.root.querySelector(".sheet__head").style.display = "none";
  h.body.querySelector("[data-done]").addEventListener("click", () => {
    h.close();
    onPrimary?.();
  });
  return h;
}

export function confirmSheet({ title, text, confirm = "Confirm", tone = "primary", onConfirm }) {
  const h = openSheet({
    title,
    sub: text,
    body: `
      <div class="flex gap-8">
        <button class="btn btn--quiet grow" data-cancel>Cancel</button>
        <button class="btn btn--${tone} grow" data-ok>${esc(confirm)}</button>
      </div>
    `,
  });
  h.body.querySelector("[data-cancel]").addEventListener("click", h.close);
  h.body.querySelector("[data-ok]").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 700));
    btn.classList.remove("is-loading");
    h.close();
    onConfirm?.();
  });
  return h;
}

/* a form -> values helper for sheet bodies */
export function readForm(root) {
  const data = {};
  root.querySelectorAll("[name]").forEach((f) => {
    data[f.name] = f.type === "checkbox" ? f.checked : f.value.trim();
  });
  return data;
}
