/* ============================================================
   ARENA — player analytics sheet + full leaderboard
   ============================================================ */

import { countUp } from "../utils.js";
import { playerById, leaderboard, state, persist } from "../data.js";
import { avatar, boardRow, sparkPath } from "../ui.js";
import { openSheet } from "../sheets.js";
import { navigate } from "../router.js";

const matchRow = (m) => `
  <div class="matchrow">
    <span class="matchrow__place ${m.place === 1 ? "is-win" : ""}">${m.place}</span>
    <span class="matchrow__body">
      <b>${m.event}</b>
      <small>${m.date}</small>
    </span>
    <span class="matchrow__kills">${m.kills} kills</span>
  </div>`;

export function openPlayer(id) {
  const p = playerById(id);
  const { line, area, last } = sparkPath(p.spark, 300, 64);

  const sheet = openSheet({
    wide: true,
    title: "Player intelligence",
    sub: "Live analytics from every app and custom tournament",
    body: `
      <div class="player-head">
        ${avatar(p.name, "xl", true)}
        <div class="player-head__id">
          <div class="player-head__name">
            ${p.name}
            ${p.pro ? `<span class="badge badge--pro">Pro</span>` : `<span class="badge">Rising</span>`}
          </div>
          <div class="player-head__sub">${p.team} · ${p.region} · ${p.matches} matches played</div>
        </div>
      </div>

      <div class="statgrid">
        <div><div class="stat__value" data-cu="${p.wins}">0</div><div class="stat__label">Cups won</div></div>
        <div><div class="stat__value" data-cu="${p.kills}">0</div><div class="stat__label">Total kills</div></div>
        <div><div class="stat__value">${p.kd.toFixed(2)}</div><div class="stat__label">K/D ratio</div></div>
        <div><div class="stat__value" data-cu="${p.winRate}" data-suffix="%">0</div><div class="stat__label">Win rate</div></div>
        <div><div class="stat__value" data-cu="${p.hs}" data-suffix="%">0</div><div class="stat__label">Headshot</div></div>
        <div><div class="stat__value">${p.avgPlace.toFixed(1)}</div><div class="stat__label">Avg place</div></div>
      </div>

      <div class="chartcard">
        <div class="chartcard__head"><b>Form — last 10 tournaments</b><span>KILLS</span></div>
        <svg class="spark" viewBox="0 0 300 64" preserveAspectRatio="none" aria-label="Kills trend">
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ff4d1c" stop-opacity="0.24"/>
              <stop offset="1" stop-color="#ff4d1c" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path class="area" d="${area}"/>
          <path class="line" d="${line}"/>
          <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3"/>
        </svg>
      </div>

      <div class="chartcard">
        <div class="chartcard__head"><b>Edge metrics</b><span>VS. CIRCUIT AVG</span></div>
        <div class="hbar">
          <div class="hbar__row">
            <div class="hbar__top"><span>Aggression (kills / match)</span><b>${(p.kills / p.matches).toFixed(1)}</b></div>
            <div class="hbar__track"><div class="hbar__fill hbar__fill--ember" data-w="${Math.min(100, Math.round((p.kills / p.matches) * 14))}"></div></div>
          </div>
          <div class="hbar__row">
            <div class="hbar__top"><span>Clutch conversion</span><b>${Math.round(p.winRate * 0.82)}%</b></div>
            <div class="hbar__track"><div class="hbar__fill" data-w="${Math.round(p.winRate * 0.82)}"></div></div>
          </div>
          <div class="hbar__row">
            <div class="hbar__top"><span>Placement discipline</span><b>${Math.round(100 - p.avgPlace * 12)}%</b></div>
            <div class="hbar__track"><div class="hbar__fill" data-w="${Math.round(100 - p.avgPlace * 12)}"></div></div>
          </div>
        </div>
      </div>

      <div class="chartcard">
        <div class="chartcard__head"><b>Recent results</b><span>VERIFIED</span></div>
        ${p.history.length ? p.history.map(matchRow).join("") : `<p class="muted" style="font-size:12px">No tournament results yet this season.</p>`}
      </div>

      <div class="flex gap-8">
        <button class="btn btn--ghost grow" data-dm>Message</button>
        <button class="btn btn--primary grow" data-follow>${state.following.includes(p.id) ? "Following" : "Follow player"}</button>
      </div>
    `,
  });

  sheet.body.querySelectorAll("[data-cu]").forEach((n) => {
    countUp(n, Number(n.dataset.cu), { suffix: n.dataset.suffix || "" });
  });
  requestAnimationFrame(() =>
    sheet.body.querySelectorAll("[data-w]").forEach((f) => (f.style.width = `${f.dataset.w}%`))
  );

  sheet.body.querySelector("[data-follow]").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (state.following.includes(p.id)) {
      state.following = state.following.filter((x) => x !== p.id);
      btn.textContent = "Follow player";
    } else {
      state.following.push(p.id);
      btn.textContent = "Following";
    }
    persist();
  });
  sheet.body.querySelector("[data-dm]").addEventListener("click", () => {
    sheet.close();
    navigate("inbox");
  });
}

export function openFullBoard(mode = "app") {
  const list = leaderboard(mode);
  const max = list[0].wins;
  const sheet = openSheet({
    wide: true,
    title: "Full leaderboard",
    sub: mode === "app" ? "Ranked by app tournament cups won" : "Ranked by total kills in custom rooms",
    body: `
      <div class="flex items-center gap-8" style="justify-content:space-between">
        <span class="eyebrow">Top ${list.length} of 12,480 players</span>
        <span class="pillnote"><i></i>Updated live</span>
      </div>
      <div class="ranklist">
        ${list.map((p, i) => boardRow(p, i + 1, max)).join("")}
      </div>
      <p class="muted" style="font-size:11.5px;text-align:center;line-height:1.6">
        Every cup, kill and placement is captured from your linked Free Fire ID in real time.
      </p>
    `,
  });
  requestAnimationFrame(() =>
    sheet.body.querySelectorAll(".meter__fill").forEach((f) => (f.style.width = `${f.dataset.w}%`))
  );
  sheet.body.addEventListener("click", (e) => {
    const row = e.target.closest("[data-player]");
    if (row) openPlayer(row.dataset.player);
  });
  return sheet;

}
