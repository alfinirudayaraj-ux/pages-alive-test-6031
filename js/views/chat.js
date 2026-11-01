/* ============================================================
   ARENA — messaging
   A professional chat surface: creator + players, announcements.
   ============================================================ */

import { esc, $, el } from "../utils.js";
import { state, threadById, persist } from "../data.js";
import { avatar } from "../ui.js";

const SEND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;

const bubble = (m) => `
  <div class="msg ${m.from === "me" ? "msg--me" : ""}">
    ${m.from === "me" ? "" : avatar(m.from, "xs")}
    <div>
      ${m.from === "me" ? "" : `<div class="msg__name">${esc(m.from)}</div>`}
      <div class="msg__bubble">${esc(m.text)}</div>
      <div class="msg__meta">${esc(m.time)}</div>
    </div>
  </div>`;

export function chatBlock(threadId) {
  const t = threadById(threadId);
  if (!t) return `<p class="muted">No conversation yet.</p>`;
  return `
    <div class="chat" data-thread="${t.id}">
      <div class="chat__head">
        ${avatar(t.name, "sm")}
        <div class="grow">
          <b>${esc(t.name)}</b>
          <small>${esc(t.sub)}</small>
        </div>
        <span class="badge">${t.group ? "Community" : "Direct"}</span>
      </div>
      <div class="chat__log">${t.messages.map(bubble).join("")}</div>
      <div class="chat__composer">
        <input class="input" placeholder="Message ${esc(t.name)}…" data-chat-input />
        <button class="chat__send" data-chat-send aria-label="Send">${SEND}</button>
      </div>
    </div>`;
}

export function mountChat(root, threadId) {
  const t = threadById(threadId);
  const wrap = root.querySelector(`.chat[data-thread="${threadId}"]`);
  if (!t || !wrap) return;
  const log = wrap.querySelector(".chat__log");
  const input = wrap.querySelector("[data-chat-input]");
  log.scrollTop = log.scrollHeight;

  const push = (from, text) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const msg = { from, text, time };
    t.messages.push(msg);
    log.appendChild(el(bubble(msg)));
    log.scrollTop = log.scrollHeight;
    persist();
  };

  const send = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    push("me", text);

    // the creator replies — keeps the demo feeling alive
    setTimeout(() => {
      const typer = el(`<div class="msg"><div class="msg__bubble typing"><i></i><i></i><i></i></div></div>`);
      log.appendChild(typer);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        typer.remove();
        push(t.group ? "TSG•Viper" : t.name, pickReply(text, t));
      }, 1400);
    }, 500);
  };

  wrap.querySelector("[data-chat-send]").addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });
}

const REPLIES = [
  "Got it — adding that to the scrim board now.",
  "Copy. I'll pin it in the community feed so everyone sees it.",
  "Locked in. Room code drops 20 minutes before the match.",
  "Perfect timing, we were just reviewing that round.",
  "Noted. Payout split shows the 10% platform fee transparently on your side.",
];
const pickReply = (text, t) =>
  text.length > 40 ? REPLIES[2] : REPLIES[(text.length + (t?.id?.length || 0)) % REPLIES.length];

/* ---------------- inbox ---------------- */
export function inbox() {
  const all = state.threads;
  return {
    html: `
      <section class="screen">
        <div class="pagehead">
          <span class="eyebrow">Messages</span>
          <h1>Your <em>war room</em></h1>
          <p>Talk to community creators and your squad. Announcements, room codes and payouts all land here.</p>
        </div>
        <div class="stack stagger" style="gap:8px">
          ${all
            .map(
              (t) => `
            <button class="upcard" data-thread-open="${t.id}">
              ${avatar(t.name, "md")}
              <span class="upcard__body">
                <span class="upcard__title">${esc(t.name)} ${t.unread ? `<span class="badge badge--ember">${t.unread}</span>` : ""}</span>
                <span class="upcard__meta">
                  <span>${esc(t.messages[t.messages.length - 1].text.slice(0, 46))}…</span>
                </span>
              </span>
              <span class="upcard__prize" style="color:var(--ink-40);font-weight:500">${esc(t.messages[t.messages.length - 1].time)}</span>
            </button>`
            )
            .join("")}
        </div>
      </section>
    `,
  };
}
