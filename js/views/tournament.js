/* ============================================================
   Screen: Tournament — codes, live score capture, scoreboard
   ============================================================ */

import { esc, money, copy, toast } from "../utils.js";
import { state, persist, newId, tournamentById } from "../data.js";
import { teamRow } from "../ui.js";
import { openSheet, successSheet } from "../sheets.js";
import { navigate } from "../router.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = (prefix = "ARN") =>
  `${prefix}-${Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("")}`;

export const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const ICON_KEY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="12" r="4"/><path d="M13 12h7m-2.5 0v3" stroke-linecap="round"/></svg>`;
const ICON_CLIP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h4" stroke-linecap="round"/></svg>`;

/* ---------------- create flow ---------------- */
export function openCreateTournament() {
  const draft = {
    mode: "generate",
    pasted: "",
    name: "",
    game: "Battle Royale",
    slots: 48,
    entry: 0,
    prize: 10000,
    visibility: "community",
  };

  const sheet = openSheet({
    title: "Start a tournament",
    sub: "Generate a room code, or link the one Free Fire gave you",
    body: `<div id="tSteps"></div>`,
  });
  const host = sheet.body.querySelector("#tSteps");

  const stepsBar = (step) => `
    <div class="steps">
      <b class="${step >= 1 ? "is-done" : "is-on"}">Code</b><i></i>
      <b class="${step === 2 ? "is-on" : step > 2 ? "is-done" : ""}">Setup</b><i></i>
      <b class="${step === 3 ? "is-on" : ""}">Go live</b>
    </div>`;

  const paint = (step) => {
    if (step === 1) {
      host.innerHTML = `
        ${stepsBar(1)}
        <div class="stack mt-16">
          <button class="tile" data-pick="generate" style="flex-direction:row;align-items:center;gap:12px;${draft.mode === "generate" ? "border-color:var(--ink)" : ""}">
            <span class="tile__icon">${ICON_KEY}</span>
            <span class="grow"><b>Generate a room code</b><small>ARENA mints a fresh code and locks the room</small></span>
          </button>
          <button class="tile" data-pick="paste" style="flex-direction:row;align-items:center;gap:12px;${draft.mode === "paste" ? "border-color:var(--ink)" : ""}">
            <span class="tile__icon">${ICON_CLIP}</span>
            <span class="grow"><b>I already have a code</b><small>Paste the code from the Free Fire custom room</small></span>
          </button>
          <label class="field" style="display:${draft.mode === "paste" ? "block" : "none"}">
            <span class="field__label">Room code</span>
            <input class="input mono" placeholder="WKC-93TQ" data-paste value="${esc(draft.pasted)}" style="letter-spacing:.14em;text-transform:uppercase" />
          </label>
          <button class="btn btn--primary btn--block" data-next>Continue</button>
        </div>`;
      return;
    }

    host.innerHTML = `
      ${stepsBar(2)}
      <div class="stack mt-16">
        <label class="field"><span class="field__label">Tournament name</span>
          <input class="input" data-name placeholder="Friday Night Clash" value="${esc(draft.name)}" />
        </label>
        <div class="field-row field-row--2">
          <label class="field"><span class="field__label">Format</span>
            <select class="select" data-game>
              ${["Battle Royale", "Clash Squad"].map((g) => `<option ${draft.game === g ? "selected" : ""}>${g}</option>`).join("")}
            </select>
          </label>
          <label class="field"><span class="field__label">Slots</span>
            <select class="select" data-slots>
              ${[12, 24, 48, 64].map((s) => `<option value="${s}" ${draft.slots === s ? "selected" : ""}>${s} players</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="field-row field-row--2">
          <label class="field"><span class="field__label">Entry fee (₹)</span>
            <input class="input mono" type="number" min="0" step="10" data-entry value="${draft.entry}" />
          </label>
          <label class="field"><span class="field__label">Prize pool (₹)</span>
            <input class="input mono" type="number" min="0" step="500" data-prize value="${draft.prize}" />
          </label>
        </div>
        <div class="field">
          <span class="field__label">Who can see it</span>
          <div class="segmented" data-vis style="width:100%">
            <button class="segmented__btn ${draft.visibility === "community" ? "is-on" : ""}" data-vis-val="community" style="flex:1">My community</button>
            <button class="segmented__btn ${draft.visibility === "public" ? "is-on" : ""}" data-vis-val="public" style="flex:1">Public</button>
          </div>
        </div>
        <div class="cofeed">
          <div class="cofeed__row"><span>Entry pool (${draft.slots} slots)</span><b>${money(draft.entry * draft.slots)}</b></div>
          <div class="cofeed__row cofeed__row--fee"><span>Platform fee (10%)</span><b>${money(Math.round(draft.entry * draft.slots * 0.1))}</b></div>
          <div class="cofeed__row cofeed__row--net"><span>Prize pool</span><b>${money(draft.prize)}</b></div>
        </div>
        <button class="btn btn--ember btn--block" data-create>Create &amp; go live</button>
      </div>`;
  };

  paint(1);


  sheet.body.addEventListener("click", async (e) => {
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      draft.mode = pick.dataset.pick;
      paint(1);
      return;
    }

    if (e.target.closest("[data-next]")) {
      if (draft.mode === "paste") {
        const val = sheet.body.querySelector("[data-paste]")?.value.trim();
        if (!val) return toast("Paste the room code first");
        draft.pasted = val.toUpperCase();
      }
      paint(2);
      return;
    }

    const vis = e.target.closest("[data-vis-val]");
    if (vis) {
      draft.visibility = vis.dataset.visVal;
      sheet.body.querySelectorAll("[data-vis-val]").forEach((b) => b.classList.toggle("is-on", b === vis));
      return;
    }

    const create = e.target.closest("[data-create]");
    if (create) {
      draft.name = sheet.body.querySelector("[data-name]").value.trim() || "Untitled cup";
      draft.game = sheet.body.querySelector("[data-game]").value;
      draft.slots = Number(sheet.body.querySelector("[data-slots]").value);
      draft.entry = Number(sheet.body.querySelector("[data-entry]").value) || 0;
      draft.prize = Number(sheet.body.querySelector("[data-prize]").value) || 0;

      create.classList.add("is-loading");
      await new Promise((r) => setTimeout(r, 850));
      create.classList.remove("is-loading");

      const code = draft.mode === "paste" ? draft.pasted : genCode("ARN");
      const t = {
        id: newId("t"),
        name: draft.name,
        mode: draft.game,
        entry: draft.entry,
        prize: draft.prize,
        slots: draft.slots,
        joined: 1,
        code,
        visibility: draft.visibility,
        status: "live",
        startsIn: "LIVE · map 1",
        community: state.communities.find((c) => state.me.joined.includes(c.id))?.name || "My community",
        mine: true,
        teams: [
          { name: state.me.handle, tag: "ME", kills: 0, points: 0 },
          { name: "4Mercy", tag: "4M", kills: 0, points: 0 },
          { name: "Kaze•YT", tag: "KZE", kills: 0, points: 0 },
          { name: "Blaze•X", tag: "BLZ", kills: 0, points: 0 },
        ],
        events: [{ t: nowTime(), text: "Room created — live score capture armed." }],
      };
      state.tournaments.unshift(t);
      persist();
      sheet.close();
      successSheet({
        title: "Tournament is live",
        text: `Code ${code} is armed. Kills, points and wins stream in from Free Fire in real time.`,
        primary: "Open scoreboard",
        onPrimary: () => navigate("tournament", { id: t.id }),
      });
    }
  });
}


/* ---------------- tournament detail ---------------- */
export function tournamentDetail(params) {
  const t = tournamentById(params.id) || state.tournaments[0];
  const live = t.status === "live";

  const sorted = () => [...t.teams].sort((a, b) => b.points - a.points || b.kills - a.kills);
  const scoreboard = () => sorted().map((team, i) => teamRow(team, i, i === 0)).join("");
  const eventsHTML = () =>
    t.events
      .slice(0, 8)
      .map((ev) => `<div class="feedline"><time>${esc(ev.t)}</time><span>${ev.text}</span></div>`)
      .join("");

  return {
    html: `
      <section class="screen">
        <div class="detailbar">
          <button class="backbtn" data-back aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>
          </button>
          <div class="detailbar__title">
            <b>${esc(t.name)}</b>
            <small>${esc(t.mode)} · ${t.joined}/${t.slots} slots</small>
          </div>
          <span class="badge ${live ? "badge--live" : ""}">${live ? "Live" : "Upcoming"}</span>
        </div>

        <div class="codebox mt-16 reveal">
          <span class="eyebrow">Join code</span>
          <span class="codebox__code">${esc(t.code)}</span>
          <span class="codebox__hint">Share this in your community chat. Players enter it in Free Fire to lock into the room.</span>
          <button class="codebox__copy" data-copy>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14"/></svg>
            Copy code
          </button>
        </div>

        <div class="capture mt-16">
          <span class="capture__dot"></span>
          <span class="capture__body">
            <b>Live score capture ${live ? "active" : "armed"}</b>
            <small>Free Fire ID ${esc(state.me.uid)} linked · kills, placements and wins sync automatically</small>
          </span>
          <span class="capture__val" data-synced>SYNCED</span>
        </div>

        <div class="statgrid mt-16" style="grid-template-columns:repeat(4,1fr)">
          <div><div class="stat__value mono">${money(t.prize)}</div><div class="stat__label">Prize</div></div>
          <div><div class="stat__value mono">${t.entry ? money(t.entry) : "Free"}</div><div class="stat__label">Entry</div></div>
          <div><div class="stat__value mono" data-teams>${t.teams.length}</div><div class="stat__label">Teams</div></div>
          <div><div class="stat__value mono" data-totalkills>${t.teams.reduce((n, x) => n + x.kills, 0)}</div><div class="stat__label">Kills</div></div>
        </div>

        <div class="section-head mt-24">
          <div>
            <span class="eyebrow">${live ? "Live scoreboard" : "Registered teams"}</span>
            <h2 style="margin-top:5px">Standings</h2>
          </div>
          <button class="btn btn--quiet btn--xs" data-visibility>${t.visibility === "public" ? "Public" : "Community only"}</button>
        </div>

        <div class="board2">
          <div class="board2__head"><span>#</span><span>Team</span><span>Kills</span><span>Pts</span></div>
          <div data-board>${scoreboard()}</div>
        </div>

        <div class="section-head mt-24">
          <div>
            <span class="eyebrow">Match feed</span>
            <h2 style="margin-top:5px">What just happened</h2>
          </div>
        </div>
        <div class="panel" style="background:#fff" data-events>${eventsHTML()}</div>

        <div class="flex gap-8 mt-24" style="flex-wrap:wrap">
          <button class="btn btn--ember grow" data-media="s1">Watch stream</button>
          <button class="btn btn--ghost grow" data-share>Share in community</button>
        </div>
      </section>
    `,

    mount(root) {
      root.querySelector("[data-copy]").addEventListener("click", async () => {
        const ok = await copy(t.code);
        toast(ok ? `Code ${t.code} copied` : `Code: ${t.code}`, "ok");
      });

      root.querySelector("[data-visibility]").addEventListener("click", (e) => {
        t.visibility = t.visibility === "public" ? "community" : "public";
        e.currentTarget.textContent = t.visibility === "public" ? "Public" : "Community only";
        persist();
        toast(t.visibility === "public" ? "Tournament is now public" : "Restricted to your community", "ok");
      });

      root.querySelector("[data-share]").addEventListener("click", () => toast("Code shared to community chat", "ok"));

      if (!live) return;

      // ---- simulated real-time capture from the Free Fire client ----
      const board = root.querySelector("[data-board]");
      const events = root.querySelector("[data-events]");
      const synced = root.querySelector("[data-synced]");
      const killCounter = root.querySelector("[data-totalkills]");

      let tick = 0;
      const timer = setInterval(() => {
        tick += 1;
        const team = t.teams[Math.floor(Math.random() * t.teams.length)];
        const gained = Math.random() > 0.62 ? 2 : 1;
        team.kills += gained;
        team.points += gained + (Math.random() > 0.82 ? 6 : 0);

        const text =
          Math.random() > 0.72
            ? `<b>${esc(team.name)}</b> wiped a squad — +${gained} kills.`
            : `<b>${esc(team.name)}</b> secured a knock, pressure building.`;
        t.events.unshift({ t: nowTime(), text });

        const order = sorted();
        board.innerHTML = order.map((x, i) => teamRow(x, i, i === 0)).join("");
        board.querySelectorAll(".teamrow").forEach((row, i) => {
          row.style.animation = `rise-in 420ms ${i * 24}ms var(--ease-spring) both`;
        });
        const pos = order.findIndex((x) => x === team);
        board.querySelectorAll(".teamrow__kills")[pos]?.classList.add("is-pop");

        events.innerHTML = eventsHTML();
        killCounter.textContent = t.teams.reduce((n, x) => n + x.kills, 0);
        synced.textContent = `SYNCED ${nowTime()}`;

        if (tick % 6 === 0) persist();
      }, 2600);

      window.__arenaCleanups?.push(() => clearInterval(timer));
    },
  };
}


