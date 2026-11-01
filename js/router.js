/* ============================================================
   ARENA — router
   Tiny hash-free router with a back stack and view transitions.
   ============================================================ */

import { $, observeReveals, $$ } from "./utils.js";

const routes = new Map();
let current = null;
let stack = [];
const listeners = new Set();

export function register(name, view) {
  routes.set(name, view);
}

export function onRoute(fn) {
  listeners.add(fn);
}

export function navigate(name, params = {}, { replace = false, back = false } = {}) {
  const view = routes.get(name);
  if (!view) {
    console.warn(`[arena] unknown route: ${name}`);
    return;
  }
  const app = $("#app");
  const previous = current;
  current = { name, params };

  if (!back && !replace && previous) stack.push(previous);
  if (replace) stack = stack.slice(0, -1);

  const paint = () => {
    const result = view(params);
    window.__arenaCleanups?.forEach((fn) => {
      try {
        fn();
      } catch {
        /* noop */
      }
    });
    window.__arenaCleanups = [];
    app.innerHTML = result.html || "";
    window.scrollTo({ top: 0 });
    observeReveals(app);
    result.mount?.(app, params);
    requestAnimationFrame(() => {
      $$(".meter__fill", app).forEach((f) => {
        if (f.dataset.w) f.style.width = `${f.dataset.w}%`;
      });
    });
    listeners.forEach((fn) => fn(current));
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canTransition =
    typeof document.startViewTransition === "function" &&
    !document.hidden &&
    !reduced &&
    !navigator.webdriver;

  let painted = false;
  const doPaint = () => {
    if (painted) return;
    painted = true;
    paint();
  };

  if (canTransition) {
    try {
      const transition = document.startViewTransition(doPaint);
      transition.finished?.catch(() => {});
      transition.ready?.catch(() => {});
    } catch {
      doPaint();
    }
    // safety net: if the transition is aborted (hidden tab, bfcache, etc.)
    setTimeout(doPaint, 240);
  } else {
    doPaint();
  }
}

export function back() {
  const prev = stack.pop();
  if (prev) navigate(prev.name, prev.params, { back: true });
  else navigate("home", {}, { replace: true });
}

export const routeName = () => current?.name || "home";
