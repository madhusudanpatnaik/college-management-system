/* Richer motion for the app, powered by the Motion library (motion.dev).
 *
 * Progressive enhancement: app.js adds `motion-ready` to <html> and dynamically
 * imports this module ONLY on app pages and ONLY when the user has not requested
 * reduced motion. The Motion library is vendored at /js/vendor/motion.js so it
 * stays same-origin under the app's CSP (script-src 'self') — no CDN, no restart.
 *
 * Spring-based scroll-reveal: each top-level block fades + springs up as it enters
 * the viewport, with a small stagger between siblings. If anything here fails to
 * load, a failsafe in app.js reveals all content, so the page is never left blank.
 */
import { animate, inView } from "/js/vendor/motion.js";

const html = document.documentElement;

// Motion has loaded — cancel app.js's "reveal everything" failsafe.
clearTimeout(window.__cmsMotionFailsafe);

// If the failsafe already fired (very slow load), content is visible — do nothing.
if (html.classList.contains("motion-ready")) {
  start();
}

function start() {
  // Top-level page blocks only — never nested cards (avoids double-animation).
  const SELECTOR = [
    ".page-body > .stats-grid > .stat-card",
    ".page-body > .section-grid > .panel",
    ".page-body > .section-grid > .table-card",
    ".page-body > .panel",
    ".page-body > .table-card",
    ".page-body > .notice-list > .notice-card",
    ".page-body > .activity-list > .list-card",
    ".page-body > .list-grid > .list-card",
    ".page-body > .assignment-grid > .assignment-card",
    ".page-body > .material-grid > .material-card",
    ".page-body > .outing-grid > .outing-card",
    ".page-body > .roster-grid > .roster-item",
    ".page-body > .schedule-grid > .schedule-day-card"
  ].join(",");

  const SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 };
  const armed = new WeakSet();

  const finish = (el) => {
    el.classList.add("is-revealed");
    el.style.opacity = "";
    el.style.transform = "";
    el.style.translate = "";
  };

  const reveal = (el, index) => {
    if (armed.has(el)) return;
    armed.add(el);
    let triggered = false;
    const stop = inView(
      el,
      () => {
        if (triggered) return;
        triggered = true;
        stop?.();
        const controls = animate(
          el,
          { opacity: [0, 1], y: [18, 0] },
          { ...SPRING, delay: Math.min(index * 0.06, 0.36) }
        );
        controls?.finished?.then(() => finish(el)).catch(() => finish(el));
      },
      { amount: 0.12, margin: "0px 0px -8% 0px" }
    );
  };

  const scan = () => {
    document.querySelectorAll(SELECTOR).forEach((el) => {
      const parent = el.parentElement;
      const index = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
      reveal(el, index < 0 ? 0 : index);
    });
  };

  // Coalesce repeated DOM mutations into a single scan per frame.
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };

  schedule();

  // app.js renders page content asynchronously (after fetch) — watch for it.
  const content = document.getElementById("pageContent");
  if (content) {
    new MutationObserver(schedule).observe(content, { childList: true, subtree: true });
  }
}
