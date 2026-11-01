/* ============================================================
   Screen: Store — buy & sell Free Fire IDs
   Filters: pass, level, price + region, login, verification
   ============================================================ */

import { esc, money, fee, net, $, $$ } from "../utils.js";
import { state, listingById, persist } from "../data.js";
import { listingCard, emptyState, avatar } from "../ui.js";
import { openSheet, successSheet } from "../sheets.js";

const filters = {
  q: "",
  pass: "",
  minLevel: 0,
  maxPrice: 20000,
  region: "",
  login: "",
  verifiedOnly: false,
};

const activeFilters = () =>
  [filters.pass, filters.region, filters.login, filters.minLevel > 0, filters.maxPrice < 20000, filters.verifiedOnly]
    .filter(Boolean).length;

function apply(list) {
  return list.filter((l) => {
    if (filters.q) {
      const hay = `${l.title} ${l.rank} ${l.seller} ${l.pass}`.toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    if (filters.pass && l.pass !== filters.pass) return false;
    if (filters.minLevel && l.level < filters.minLevel) return false;
    if (l.price > filters.maxPrice) return false;
    if (filters.region && l.region !== filters.region) return false;
    if (filters.login && l.login !== filters.login) return false;
    if (filters.verifiedOnly && !l.verified) return false;
    return true;
  });
}

/* ---------------- filter sheet ---------------- */
function openFilters(onChange) {
  const sheet = openSheet({
    title: "Filters",
    sub: "Narrow the market by exactly what matters",
    body: `
      <div class="fgroup">
        <span class="fgroup__label">Season pass</span>
        <div class="flex gap-8" style="flex-wrap:wrap">
          ${["", "Free", "Basic", "Elite"]
            .map((p) => `<button class="chip ${filters.pass === p ? "is-on" : ""}" data-f-pass="${p}">${p || "Any pass"}</button>`)
            .join("")}
        </div>
      </div>

      <div class="fgroup">
        <span class="fgroup__label">Minimum level</span>
        <input class="range" type="range" min="0" max="80" step="1" value="${filters.minLevel}" data-f-level />
        <div class="fnote"><span>Level 0</span><span data-out-level>Lv ${filters.minLevel}+</span></div>
      </div>

      <div class="fgroup">
        <span class="fgroup__label">Maximum price</span>
        <input class="range" type="range" min="199" max="20000" step="100" value="${filters.maxPrice}" data-f-price />
        <div class="fnote"><span>${money(199)}</span><span data-out-price>${money(filters.maxPrice)}</span></div>
      </div>

      <div class="field-row field-row--2">
        <label class="field">
          <span class="field__label">Region</span>
          <select class="select" data-f-region>
            <option value="">Any region</option>
            ${["IN", "SG", "BR", "ID", "ME"].map((r) => `<option value="${r}" ${filters.region === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span class="field__label">Login method</span>
          <select class="select" data-f-login>
            <option value="">Any</option>
            ${["Google", "Facebook", "Guest"].map((r) => `<option value="${r}" ${filters.login === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </label>
      </div>

      <label class="switch">
        <input type="checkbox" data-f-verified ${filters.verifiedOnly ? "checked" : ""} />
        <span class="switch__track"><span class="switch__thumb"></span></span>
        <span class="switch__text">Verified sellers only<small>ID ownership checked by ARENA escrow</small></span>
      </label>

      <div class="flex gap-8">
        <button class="btn btn--quiet grow" data-reset>Reset</button>
        <button class="btn btn--primary grow" data-apply>Show results</button>
      </div>
    `,
  });

  const body = sheet.body;
  body.addEventListener("click", (e) => {
    const p = e.target.closest("[data-f-pass]");
    if (p) {
      filters.pass = p.dataset.fPass;
      body.querySelectorAll("[data-f-pass]").forEach((b) => b.classList.toggle("is-on", b.dataset.fPass === filters.pass));
    }
    if (e.target.closest("[data-reset]")) {
      Object.assign(filters, { pass: "", minLevel: 0, maxPrice: 20000, region: "", login: "", verifiedOnly: false });
      sheet.close();
      onChange();
    }
    if (e.target.closest("[data-apply]")) {
      sheet.close();
      onChange();
    }
  });

  body.querySelector("[data-f-level]").addEventListener("input", (e) => {
    filters.minLevel = Number(e.target.value);
    body.querySelector("[data-out-level]").textContent = `Lv ${filters.minLevel}+`;
  });
  body.querySelector("[data-f-price]").addEventListener("input", (e) => {
    filters.maxPrice = Number(e.target.value);
    body.querySelector("[data-out-price]").textContent = money(filters.maxPrice);
  });
  body.querySelector("[data-f-region]").addEventListener("change", (e) => (filters.region = e.target.value));
  body.querySelector("[data-f-login]").addEventListener("change", (e) => (filters.login = e.target.value));
  body.querySelector("[data-f-verified]").addEventListener("change", (e) => (filters.verifiedOnly = e.target.checked));
}

/* ---------------- checkout ---------------- */
export function openCheckout(id) {
  const l = listingById(id);
  if (!l) return;
  const escrow = fee(l.price);
  const total = l.price;

  const sheet = openSheet({
    title: "Secure checkout",
    sub: "Escrow protected · funds release after ID handover",
    body: `
      <div class="coitem">
        <span class="coitem__art"><span class="art ${l.art}"></span></span>
        <span class="coitem__body">
          <b>${esc(l.title)}</b>
          <small>${esc(l.rank)} · Lv ${l.level} · ${esc(l.pass)} pass · ${l.skins} skins</small>
        </span>
      </div>

      <div class="panel">
        <div class="flex items-center gap-8">
          ${avatar(l.seller, "sm")}
          <div class="grow">
            <div style="font-size:12.5px;font-weight:600">${esc(l.seller)}</div>
            <div style="font-size:10.5px;color:var(--ink-40)">Seller rating ${l.rating.toFixed(1)} · ${l.verified ? "verified" : "unverified"} ID</div>
          </div>
          <span class="badge ${l.verified ? "badge--mint" : ""}">${l.verified ? "Escrow ready" : "Manual review"}</span>
        </div>
      </div>

      <div class="cofeed">
        <div class="cofeed__row"><span>Account price</span><b>${money(l.price)}</b></div>
        <div class="cofeed__row cofeed__row--fee"><span>Escrow + platform fee (10%)</span><b>${money(escrow)}</b></div>
        <div class="cofeed__row"><span>Seller receives</span><b>${money(net(l.price))}</b></div>
        <div class="cofeed__row cofeed__row--net"><span>You pay today</span><b>${money(total)}</b></div>
      </div>

      <div class="trust">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3Z"/></svg>
        <span>Your money is held by ARENA until the ID is transferred and you confirm login. If anything fails you're refunded in full.</span>
      </div>

      <button class="btn btn--ember btn--block" data-buy>Pay ${money(total)} securely</button>
    `,
  });

  sheet.body.querySelector("[data-buy]").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 1000));
    btn.classList.remove("is-loading");

    if (state.balance >= total) state.balance -= total;
    state.listings = state.listings.filter((x) => x.id !== l.id);
    state.earnings.gross += total;
    persist();
    sheet.close();

    successSheet({
      title: "Purchase secured",
      text: `${l.title} is now held in escrow. Credentials arrive in your inbox within 10 minutes.`,
      primary: "View messages",
      onPrimary: () => import("../router.js").then((m) => m.navigate("inbox")),
    });
  });
}


/* ---------------- store screen ---------------- */
export function store() {
  return {
    html: `
      <section class="screen">
        <div class="pagehead">
          <div class="pagehead__row">
            <div>
              <span class="eyebrow">Store · escrow protected</span>
              <h1>Free Fire <em>IDs</em></h1>
              <p>Buy and sell accounts with verified ownership, escrow payouts and a flat 10% platform fee on every sale.</p>
            </div>
            <button class="btn btn--primary btn--sm" data-sell>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>
              Sell an ID
            </button>
          </div>
        </div>

        <div class="searchbar">
          <div class="input-group">
            <span class="input-group__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.4"/><path d="m20 20-3.6-3.6" stroke-linecap="round"/></svg>
            </span>
            <input class="input" placeholder="Search rank, level, seller…" data-search />
          </div>
          <button class="filterbtn" data-filters>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M7 12h10M10 17h4"/></svg>
            Filters
            <span class="filterbtn__n" data-fcount style="display:none">0</span>
          </button>
        </div>

        <div class="chipbar" data-quick>
          <button class="chip is-on" data-quick-filter="">All IDs <span class="chip__count" data-total>${state.listings.length}</span></button>
          <button class="chip" data-quick-filter="Elite">Elite pass</button>
          <button class="chip" data-quick-filter="verified">Verified only</button>
          <button class="chip" data-quick-filter="cheap">Under ${money(1000)}</button>
          <button class="chip" data-quick-filter="grandmaster">Grandmaster</button>
        </div>

        <div class="flex items-center gap-8 mt-16" style="justify-content:space-between">
          <span class="eyebrow" data-count-label>${apply(state.listings).length} listings live</span>
          <span class="pillnote"><i></i>Escrow on every order</span>
        </div>

        <div class="storegrid mt-16" id="storeGrid">
          ${apply(state.listings).map((l) => listingCard(l)).join("")}
        </div>
      </section>
    `,
    mount(root) {
      const grid = root.querySelector("#storeGrid");
      const label = root.querySelector("[data-count-label]");
      const badge = root.querySelector("[data-fcount]");

      const repaint = () => {
        const res = apply(state.listings);
        grid.innerHTML = res.length
          ? res.map((l) => listingCard(l)).join("")
          : emptyState("No IDs match", "Loosen a filter or clear the search to see the full market.");
        const n = activeFilters();
        badge.textContent = n;
        badge.style.display = n ? "grid" : "none";
        root.querySelector("[data-filters]").classList.toggle("has-filters", n > 0);
        label.textContent = `${res.length} listing${res.length === 1 ? "" : "s"} live`;
        root.querySelector("[data-total]").textContent = state.listings.length;
        requestAnimationFrame(() =>
          grid.querySelectorAll(".listing").forEach((el, i) => {
            el.style.animation = `rise-in 480ms ${40 + Math.min(i, 10) * 30}ms var(--ease-spring) both`;
          })
        );
      };

      root.querySelector("[data-search]").addEventListener("input", (e) => {
        filters.q = e.target.value;
        repaint();
      });
      root.querySelector("[data-filters]").addEventListener("click", () => openFilters(repaint));

      root.querySelector("[data-quick]").addEventListener("click", (e) => {
        const b = e.target.closest("[data-quick-filter]");
        if (!b) return;
        root.querySelectorAll("[data-quick-filter]").forEach((x) => x.classList.toggle("is-on", x === b));
        const f = b.dataset.quickFilter;
        Object.assign(filters, { pass: "", region: "", login: "", minLevel: 0, maxPrice: 20000, verifiedOnly: false });
        if (f === "Elite") filters.pass = "Elite";
        if (f === "verified") filters.verifiedOnly = true;
        if (f === "cheap") filters.maxPrice = 1000;
        if (f === "grandmaster") filters.q = "grandmaster";
        if (!f) filters.q = root.querySelector("[data-search]").value = "";
        repaint();
      });
    },
  };
}
