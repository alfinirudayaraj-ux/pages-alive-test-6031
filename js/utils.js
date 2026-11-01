/* ============================================================
   ARENA — utils
   Tiny, dependency-free helpers.
   ============================================================ */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/* ---------------- numbers & money ---------------- */
export const fmt = (n) => Number(n).toLocaleString("en-IN");

export const compact = (n) => {
  const v = Number(n);
  if (v >= 1e6) return `${(v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}K`;
  return String(v);
};

/** ₹ money, no cents — matches Indian Free Fire market pricing */
export const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/** the platform's cut — 10% of every transaction */
export const PLATFORM_FEE = 0.1;
export const fee = (amount) => Math.round(Number(amount) * PLATFORM_FEE);
export const net = (amount) => Number(amount) - fee(amount);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const initials = (name = "") =>
  name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "??";

/* ---------------- storage ---------------- */
const PREFIX = "arena.v1.";

export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* private mode — ignore */
    }
    return value;
  },
  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

/* ---------------- DOM ---------------- */
export const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export const on = (node, event, selector, handler) => {
  node.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && node.contains(target)) handler(e, target);
  });
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- toasts ---------------- */
const ICON_OK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg>`;
const ICON_INFO = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M12 6v7"/><circle cx="12" cy="17.5" r="0.6" fill="#fff"/></svg>`;

export function toast(message, kind = "info", ms = 2600) {
  const host = $("#toaster");
  if (!host) return;
  const node = el(
    `<div class="toast ${kind === "ok" ? "toast--ok" : ""}">
       <span class="toast__icon">${kind === "ok" ? ICON_OK : ICON_INFO}</span>
       <span>${esc(message)}</span>
     </div>`
  );
  host.appendChild(node);
  setTimeout(() => {
    node.classList.add("is-out");
    setTimeout(() => node.remove(), 340);
  }, ms);
}

/* ---------------- misc ---------------- */
export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Late grind";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
};

export const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** reveal-on-scroll for injected nodes */
export function observeReveals(root = document) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  $$(".reveal, .reveal-blur", root).forEach((n) => io.observe(n));
  return io;
}

/* animated number count-up */
export function countUp(node, to, { dur = 1100, prefix = "", suffix = "", decimals = 0 } = {}) {
  if (!node) return;
  const start = performance.now();
  const tick = (now) => {
    const p = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = to * eased;
    node.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-IN")) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export const timeAgo = (mins) => {
  if (mins < 60) return `${Math.max(1, Math.round(mins))}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.round(mins / 1440)}d ago`;
  return `${Math.round(mins / 10080)}w ago`;
};


/** 3d tilt + magnetic pull, the premium micro-interaction */
export function attachTilt(nodes, strength = 6) {
  nodes.forEach((node) => {
    if (node.dataset.tilt === "on") return;
    node.dataset.tilt = "on";
    node.addEventListener("pointermove", (e) => {
      const r = node.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      node.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-3px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

export const avatarCls = (seed = "") => {
  let n = 0;
  for (const ch of String(seed)) n += ch.charCodeAt(0);
  return `avatar--g${n % 7}`;
};
