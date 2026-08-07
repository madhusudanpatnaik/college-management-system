/* ---- Motion bootstrap (progressive enhancement; app pages only) ----
 * Adds `motion-ready` so the stylesheet hands entrance control to the Motion
 * library, then dynamically imports the reveal module. A failsafe reveals all
 * content if Motion never initializes (e.g. the vendored file fails to load),
 * and reduced-motion users skip it entirely. */
(function bootstrapMotion() {
  try {
    var isAppPage = document.body && document.body.classList.contains("app-page");
    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Scroll-reveal is a DESKTOP-only enhancement. On touch / small screens it can
    // leave large areas blank while waiting to reveal and feels sluggish, so mobile
    // shows content immediately (with the lightweight CSS entrance instead).
    var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    var wideEnough = window.innerWidth >= 1024;
    if (!isAppPage || reduced || !finePointer || !wideEnough) return;
    document.documentElement.classList.add("motion-ready");
    window.__cmsMotionFailsafe = window.setTimeout(function () {
      document.documentElement.classList.remove("motion-ready");
    }, 2500);
    import("/js/motion.js").catch(function () {
      window.clearTimeout(window.__cmsMotionFailsafe);
      document.documentElement.classList.remove("motion-ready");
    });
  } catch (err) {
    /* no-op: content stays fully visible without motion */
  }
})();

/* ---- Android / mobile browser chrome color ---- */
(function themeColor() {
  try {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = "#eef2f8";
  } catch (err) {
    /* no-op */
  }
})();

const APP_BASE =
  window.location.origin && window.location.origin !== "null" ? window.location.origin : "http://localhost:3000";
const API_BASE = `${APP_BASE}/api`;
const TOKEN_KEY = "cms_token";
const USER_KEY = "cms_user";

const PAGE_ACCESS = {
  dashboard: ["admin", "faculty", "student"],
  academics: ["admin"],
  students: ["admin", "faculty"],
  faculty: ["admin"],
  attendance: ["admin", "faculty", "student"],
  exams: ["admin", "faculty", "student"],
  timetable: ["admin", "faculty", "student"],
  fees: ["admin", "student"],
  assignments: ["admin", "faculty", "student"],
  notices: ["admin", "faculty", "student"],
  materials: ["admin", "faculty", "student"],
  outing: ["admin", "faculty", "student"],
  placement: ["admin", "faculty", "student"],
  events: ["admin", "faculty", "student"],
  complaints: ["admin", "faculty", "student"],
  disciplinary: ["admin", "faculty", "student"],
  halltickets: ["admin", "faculty", "student"],
  about: ["admin", "faculty", "student"],
  profile: ["admin", "faculty", "student"]
};

const MENU_ITEMS = {
  admin: [
    { page: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { page: "academics", label: "Academics", href: "academics.html", icon: "timetable" },
    { page: "students", label: "Students", href: "students.html", icon: "students" },
    { page: "faculty", label: "Faculty", href: "faculty.html", icon: "faculty" },
    { page: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { page: "exams", label: "Exams", href: "exams.html", icon: "results" },
    { page: "timetable", label: "Timetable", href: "timetable.html", icon: "timetable" },
    { page: "fees", label: "Fees", href: "fees.html", icon: "fees" },
    { page: "assignments", label: "Assignments", href: "assignments.html", icon: "assignments" },
    { page: "materials", label: "Materials", href: "materials.html", icon: "materials" },
    { page: "notices", label: "Notices", href: "notices.html", icon: "notices" },
    { page: "outing", label: "Outing", href: "outing.html", icon: "outing" },
    { page: "placement", label: "Placement Prep", href: "placement.html", icon: "placement" },
    { page: "events", label: "Events", href: "events.html", icon: "events" },
    { page: "complaints", label: "Complaints", href: "complaints.html", icon: "complaints" },
    { page: "disciplinary", label: "Conduct", href: "disciplinary.html", icon: "disciplinary" },
    { page: "halltickets", label: "Hall Tickets", href: "hall-tickets.html", icon: "halltickets" },
    { page: "profile", label: "My Profile", href: "profile.html", icon: "profile" },
    { page: "about", label: "About College", href: "about.html", icon: "about" }
  ],
  faculty: [
    { page: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { page: "students", label: "Students", href: "students.html", icon: "students" },
    { page: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { page: "exams", label: "Exams", href: "exams.html", icon: "results" },
    { page: "timetable", label: "Timetable", href: "timetable.html", icon: "timetable" },
    { page: "assignments", label: "Assignments", href: "assignments.html", icon: "assignments" },
    { page: "materials", label: "Materials", href: "materials.html", icon: "materials" },
    { page: "notices", label: "Notices", href: "notices.html", icon: "notices" },
    { page: "outing", label: "Outing", href: "outing.html", icon: "outing" },
    { page: "placement", label: "Placement Prep", href: "placement.html", icon: "placement" },
    { page: "events", label: "Events", href: "events.html", icon: "events" },
    { page: "complaints", label: "Complaints", href: "complaints.html", icon: "complaints" },
    { page: "disciplinary", label: "Conduct", href: "disciplinary.html", icon: "disciplinary" },
    { page: "halltickets", label: "Hall Tickets", href: "hall-tickets.html", icon: "halltickets" },
    { page: "profile", label: "My Profile", href: "profile.html", icon: "profile" },
    { page: "about", label: "About College", href: "about.html", icon: "about" }
  ],
  student: [
    { page: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { page: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { page: "exams", label: "Results", href: "exams.html", icon: "results" },
    { page: "timetable", label: "Timetable", href: "timetable.html", icon: "timetable" },
    { page: "fees", label: "Fees", href: "fees.html", icon: "fees" },
    { page: "assignments", label: "Assignments", href: "assignments.html", icon: "assignments" },
    { page: "materials", label: "Materials", href: "materials.html", icon: "materials" },
    { page: "notices", label: "Notices", href: "notices.html", icon: "notices" },
    { page: "outing", label: "Outing", href: "outing.html", icon: "outing" },
    { page: "placement", label: "Placement Prep", href: "placement.html", icon: "placement" },
    { page: "events", label: "Events", href: "events.html", icon: "events" },
    { page: "complaints", label: "Complaints", href: "complaints.html", icon: "complaints" },
    { page: "disciplinary", label: "My Conduct", href: "disciplinary.html", icon: "disciplinary" },
    { page: "halltickets", label: "Hall Tickets", href: "hall-tickets.html", icon: "halltickets" },
    { page: "profile", label: "My ID Card", href: "profile.html", icon: "profile" },
    { page: "about", label: "About College", href: "about.html", icon: "about" }
  ]
};

const ICON_PATHS = {
  dashboard:
    '<path d="M3 11.5A2.5 2.5 0 0 1 5.5 9H9v10H5.5A2.5 2.5 0 0 1 3 16.5v-5Zm8 7.5V5h3.5A2.5 2.5 0 0 1 17 7.5V19h-6Z"/><path d="M17 19h1.5A2.5 2.5 0 0 0 21 16.5V13h-4v6Z"/><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9v2H3v.5Zm14-4A2.5 2.5 0 0 0 14.5 2H11v5h6V4.5Z"/>',
  students:
    '<path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M2.5 19.5A5.5 5.5 0 0 1 8 14h1a5.5 5.5 0 0 1 5.5 5.5v.5h-12v-.5Zm11.5.5v-.5A6.9 6.9 0 0 0 13 15.2a4.7 4.7 0 0 1 2-.4h1a4 4 0 0 1 4 4v1.2h-6Z"/>',
  faculty:
    '<path d="M12 3 2.5 7.5 12 12l9.5-4.5L12 3Zm-7.5 7 7.5 3.6 7.5-3.6V16c0 1.4-3.3 3.5-7.5 3.5S4.5 17.4 4.5 16v-6Z"/>',
  attendance:
    '<path d="M7 2v3M17 2v3M4 8h16"/><rect x="3" y="5" width="18" height="16" rx="3"/><path d="m8.5 14 2.2 2.2 4.8-5"/>',
  results:
    '<path d="M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h8"/>',
  timetable:
    '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 9h18M8 13h3M8 17h7"/>',
  fees:
    '<path d="M12 3c4.4 0 8 2 8 4.5S16.4 12 12 12 4 10 4 7.5 7.6 3 12 3Z"/><path d="M4 12.5C4 15 7.6 17 12 17s8-2 8-4.5"/><path d="M4 17.5C4 20 7.6 22 12 22s8-2 8-4.5"/>',
  assignments:
    '<path d="M7 3h10a2 2 0 0 1 2 2v14l-4-2-3 2-3-2-4 2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h6"/>',
  materials:
    '<path d="M4 4h6l2 2h8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"/><path d="M12 12v6M9.5 15.5 12 18l2.5-2.5"/>',
  notices:
    '<path d="M12 3a4 4 0 0 1 4 4v1.4a2 2 0 0 0 .6 1.4l1 1a1 1 0 0 1-.7 1.7H7.1a1 1 0 0 1-.7-1.7l1-1A2 2 0 0 0 8 8.4V7a4 4 0 0 1 4-4Z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
  outing:
    '<path d="M12 3 4 7l8 4 8-4-8-4Z"/><path d="M4 11l8 4 8-4"/><path d="M4 15l8 4 8-4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  placement:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  events:
    '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m12 13 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/>',
  complaints:
    '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5a8 8 0 1 1 18-6Z"/><path d="M12 8v4M12 16h.01"/>',
  disciplinary:
    '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="m9.5 12 1.8 1.8 3.5-3.6"/>',
  halltickets:
    '<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/><path d="M14 6v12"/>',
  about:
    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  profile:
    '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5 16.5c.6-1.6 2-2.5 3.5-2.5s2.9.9 3.5 2.5M14.5 9.5h4M14.5 13h4"/>'
};

const STATE = {
  token: localStorage.getItem(TOKEN_KEY),
  user: loadStoredUser()
};

document.addEventListener("DOMContentLoaded", () => {
  initializeApp().catch((error) => {
    showToast(error.message || "Unable to load the application right now.", "error");
  });
});

function loadStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

async function initializeApp() {
  const page = getCurrentPage();

  if (["login", "forgot-password", "reset-password"].includes(page)) {
    await initializePublicPage(page);
    return;
  }

  await initializeProtectedPage(page);
}

function getCurrentPage() {
  return document.body.dataset.page;
}

function setSession(token, user) {
  STATE.token = token;
  STATE.user = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  STATE.token = null;
  STATE.user = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function redirectTo(page) {
  window.location.href = page;
}

function getRoleLabel(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeAssetUrl(path) {
  if (!path) return "#";
  return path.startsWith("http") ? path : `${APP_BASE}${path}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("+", "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function statusBadge(label) {
  return `<span class="status-badge ${slugify(label)}">${escapeHtml(label || "N/A")}</span>`;
}

function tag(label) {
  return `<span class="tag">${escapeHtml(label)}</span>`;
}

function icon(name) {
  return `<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg></span>`;
}

function statIcon(name) {
  return `<span class="stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg></span>`;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function createStatsGrid(cards) {
  return `
    <section class="stats-grid">
      ${cards
        .map(
          (card) => `
            <article class="stat-card">
              ${statIcon(card.icon)}
              <span class="stat-label">${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.value)}</strong>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function createTableCard({ title, subtitle = "", headers, rows, emptyMessage = "No records found." }) {
  return `
    <section class="table-card">
      <div class="table-head">
        <div class="panel-heading">
          ${subtitle ? `<p class="table-meta">${escapeHtml(subtitle)}</p>` : ""}
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      ${
        rows.length
          ? `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
                </thead>
                <tbody>${rows.join("")}</tbody>
              </table>
            </div>
          `
          : emptyState(emptyMessage)
      }
    </section>
  `;
}

function panel({ eyebrow = "Overview", title, body, actions = "" }) {
  return `
    <section class="panel">
      <div class="split-row panel-head">
        <div class="panel-heading">
          ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
          <h2>${escapeHtml(title)}</h2>
        </div>
        ${actions}
      </div>
      ${body}
    </section>
  `;
}

function renderLoading(_message) {
  const root = document.getElementById("pageContent");
  if (root) {
    root.innerHTML = `
      <div class="skeleton">
        <div class="skeleton-row">
          <div class="skeleton-block skeleton-stat"></div>
          <div class="skeleton-block skeleton-stat"></div>
          <div class="skeleton-block skeleton-stat"></div>
          <div class="skeleton-block skeleton-stat"></div>
        </div>
        <div class="skeleton-row">
          <div class="skeleton-block skeleton-card"></div>
          <div class="skeleton-block skeleton-card"></div>
        </div>
        <div class="skeleton-block skeleton-table"></div>
      </div>
    `;
  }
}

async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(STATE.token ? { Authorization: `Bearer ${STATE.token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

async function initializePublicPage(page) {
  if (STATE.token) {
    try {
      const session = await api("/me");
      STATE.user = session.user;
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      if (page === "login") {
        redirectTo("dashboard.html");
        return;
      }
    } catch (_error) {
      clearSession();
    }
  }

  if (page === "login") bindLoginForm();
  if (page === "forgot-password") bindForgotPasswordForm();
  if (page === "reset-password") bindResetPasswordForm();
}

async function initializeProtectedPage(page) {
  if (!STATE.token) {
    redirectTo("login.html");
    return;
  }

  try {
    const session = await api("/me");
    STATE.user = session.user;
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch (_error) {
    clearSession();
    redirectTo("login.html");
    return;
  }

  if (!PAGE_ACCESS[page] || !PAGE_ACCESS[page].includes(STATE.user.role)) {
    redirectTo("dashboard.html");
    return;
  }

  renderShell(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
  await renderPage(page);
  initRealtime(page);
}

// Which pages should re-render when a given resource changes on the server.
const RESOURCE_TO_PAGES = {
  events: ["events", "dashboard"],
  notices: ["notices", "dashboard"],
  complaints: ["complaints"],
  disciplinary: ["disciplinary"],
  "hall-tickets": ["halltickets"],
  students: ["students", "dashboard"],
  faculty: ["faculty", "dashboard"],
  academics: ["academics"],
  attendance: ["attendance", "dashboard"],
  results: ["exams", "dashboard"],
  assignments: ["assignments", "dashboard"],
  materials: ["materials", "dashboard"],
  outing: ["outing", "dashboard"],
  submissions: ["assignments"]
};

let realtimeSource = null;
let realtimeTeardownBound = false;

function closeRealtime() {
  if (realtimeSource) {
    realtimeSource.close();
    realtimeSource = null;
  }
}

// Subscribe to the server's SSE stream and live-refresh the current page when a
// resource it depends on changes (progressive enhancement — silently no-ops if
// unsupported).
function initRealtime(page) {
  if (!STATE.token || typeof EventSource === "undefined") return;

  // An SSE stream holds one of the browser's ~6 per-origin HTTP/1.1 connections
  // open. If it isn't closed before navigating, rapid page-to-page clicks pile
  // up half-open streams and starve the connection pool, stalling later loads.
  // Closing on pagehide frees the slot the instant the page is left.
  if (!realtimeTeardownBound) {
    realtimeTeardownBound = true;
    window.addEventListener("pagehide", closeRealtime);
  }

  try {
    closeRealtime();
    realtimeSource = new EventSource(`${API_BASE}/realtime?token=${encodeURIComponent(STATE.token)}`);

    let refreshTimer = null;
    realtimeSource.addEventListener("change", (event) => {
      let resource;
      try {
        resource = JSON.parse(event.data).resource;
      } catch (_error) {
        return;
      }
      const pages = RESOURCE_TO_PAGES[resource];
      if (!pages || !pages.includes(page)) return;

      // Debounce so bursts of changes (and the acting user's own mutation)
      // collapse into a single refresh.
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        renderPage(page).catch(() => {});
      }, 600);
    });

    realtimeSource.onerror = () => {
      /* EventSource reconnects automatically; nothing to do. */
    };
  } catch (_error) {
    /* Real-time updates are optional. */
  }
}

function renderShell(page) {
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = document.body.dataset.title || "Dashboard";
  }

  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <div class="sidebar-brand-row">
          <span class="sidebar-brand-pill">
            <span class="sidebar-brand-mark">CMS</span>
            <span class="sidebar-brand-pill-text">Secure Campus Workspace</span>
          </span>
        </div>
        <h2>DIET Engineering College</h2>
      </div>
      <div>
        <p class="sidebar-section-title">Navigation</p>
        <nav class="sidebar-nav">
          ${MENU_ITEMS[STATE.user.role]
            .map(
              (item) => `
                <a class="sidebar-link ${item.page === page ? "active" : ""}" href="${item.href}">
                  ${icon(item.icon)}
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `
            )
            .join("")}
        </nav>
      </div>
      <div class="sidebar-footer">
        <button class="button button-secondary" id="sidebarLogout" type="button">Logout</button>
      </div>
    `;
  }

  const topbarActions = document.getElementById("topbarActions");
  if (topbarActions) {
    const roleLabel = getRoleLabel(STATE.user.role);
    topbarActions.innerHTML = `
      <button class="role-icon-button" type="button" aria-label="${escapeHtml(roleLabel)}" title="${escapeHtml(roleLabel)}">${escapeHtml(
        roleLabel.charAt(0)
      )}</button>
      <button class="button button-secondary button-small" id="topbarLogout" type="button">Logout</button>
    `;
  }

  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("mobileOverlay");

  const closeSidebar = () => {
    document.getElementById("sidebar")?.classList.remove("open");
    overlay?.classList.remove("open");
    document.body.classList.remove("nav-open");
  };

  const openSidebar = () => {
    document.getElementById("sidebar")?.classList.add("open");
    overlay?.classList.add("open");
    document.body.classList.add("nav-open");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = document.getElementById("sidebar")?.classList.contains("open");
    if (isOpen) closeSidebar();
    else openSidebar();
  });

  overlay?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });
  document.getElementById("sidebarLogout")?.addEventListener("click", logout);
  document.getElementById("topbarLogout")?.addEventListener("click", logout);
}

function logout() {
  clearSession();
  redirectTo("login.html");
}

function showToast(message, type = "success") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconSvg = type === "success"
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="flex-shrink:0;display:flex;">${iconSvg}</span>
      <span>${escapeHtml(message)}</span>
    </div>
    <div class="toast-progress"></div>
  `;

  toast.addEventListener("click", () => dismissToast(toast, stack));
  stack.appendChild(toast);

  window.setTimeout(() => dismissToast(toast, stack), 3800);
}

function dismissToast(toast, stack) {
  if (toast.classList.contains("dismissing")) return;
  toast.classList.add("dismissing");
  toast.addEventListener("animationend", () => {
    toast.remove();
    if (stack && !stack.children.length) {
      stack.remove();
    }
  });
}

function setInlineMessage(element, message, type) {
  if (!element) return;
  element.className = `inline-message ${type}`;
  element.textContent = message;
}

function bindLoginForm() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("authMessage");
  const roleField = document.getElementById("loginRole");
  const emailField = document.getElementById("loginEmail");
  const passwordField = document.getElementById("loginPassword");

  // Only show demo credentials when the server reports demo mode.
  (async function checkDemoMode() {
    try {
      const config = await fetch(`${API_BASE}/config`).then((r) => r.json());
      if (config.demoMode) {
        const demoLink = document.getElementById("demoAccessLink");
        const demoSection = document.getElementById("demoCredentialsSection");
        if (demoLink) demoLink.style.display = "";
        if (demoSection) demoSection.style.display = "";
      }
    } catch (_error) {
      /* If config fetch fails, keep demo cards hidden — safe default. */
    }
  })();

  document.querySelectorAll("[data-demo-role]").forEach((button) => {
    button.addEventListener("click", () => {
      if (roleField) roleField.value = button.dataset.demoRole || "";
      if (emailField) emailField.value = button.dataset.demoEmail || "";
      if (passwordField) passwordField.value = button.dataset.demoPassword || "";
      message?.classList.add("hidden");
      showToast(`${getRoleLabel(button.dataset.demoRole || "student")} credentials autofilled.`);
    });
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selectedRole = String(formData.get("role") || "").trim();

    try {
      const response = await api("/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });

      if (selectedRole && response.role !== selectedRole) {
        clearSession();
        setInlineMessage(message, `This account belongs to the ${getRoleLabel(response.role)} role.`, "error");
        return;
      }

      setSession(response.token, response.user);
      message?.classList.add("hidden");
      showToast("Login successful.");
      redirectTo(response.redirectTo || "dashboard.html");
    } catch (error) {
      setInlineMessage(message, error.message, "error");
    }
  });

  initLoginTilt();
}

/* Interactive 3D tilt for the login card. Desktop / fine-pointer / motion-OK only;
 * touch (Android) and reduced-motion get the flat premium login untouched. */
function initLoginTilt() {
  const scene = document.querySelector(".login-shell, .login-wrapper");
  if (!scene) return;

  const mq = (query) => (window.matchMedia ? window.matchMedia(query).matches : false);
  const enabled = () =>
    !mq("(prefers-reduced-motion: reduce)") && !mq("(pointer: coarse)") && window.innerWidth >= 980;

  if (!enabled()) {
    // A desktop window may be resized wider later — arm it then.
    const onResize = () => {
      if (enabled()) {
        window.removeEventListener("resize", onResize);
        initLoginTilt();
      }
    };
    window.addEventListener("resize", onResize);
    return;
  }

  document.body.classList.add("login-3d");

  const brand = scene.querySelector(".login-brand-panel");
  if (brand && !brand.querySelector(".login-glare")) {
    const glare = document.createElement("div");
    glare.className = "login-glare";
    brand.appendChild(glare);
  }

  const layers = [
    [scene.querySelector(".login-brand-header"), 22],
    [scene.querySelector(".login-brand-copy"), 15],
    [scene.querySelector(".login-feature-grid"), 9],
    [scene.querySelector(".login-tech-pills"), 6]
  ].filter((pair) => pair[0]);

  const MAX = 6.5;
  let tRx = 0, tRy = 0, cRx = 0, cRy = 0; // target / current rotation
  let tNx = 0, tNy = 0, cNx = 0, cNy = 0; // target / current parallax (-1..1)
  let raf = 0;

  const frame = () => {
    cRx += (tRx - cRx) * 0.12;
    cRy += (tRy - cRy) * 0.12;
    cNx += (tNx - cNx) * 0.12;
    cNy += (tNy - cNy) * 0.12;
    scene.style.transform = `rotateX(${cRx.toFixed(2)}deg) rotateY(${cRy.toFixed(2)}deg)`;
    for (const [el, depth] of layers) {
      el.style.transform = `translate(${(cNx * depth).toFixed(1)}px, ${(cNy * depth).toFixed(1)}px)`;
    }
    const settled =
      Math.abs(tRx - cRx) < 0.02 && Math.abs(tRy - cRy) < 0.02 &&
      Math.abs(tNx - cNx) < 0.002 && Math.abs(tNy - cNy) < 0.002;
    raf = settled ? 0 : requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  scene.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const rect = scene.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    tNx = (px - 0.5) * 2;
    tNy = (py - 0.5) * 2;
    tRy = tNx * MAX;
    tRx = -tNy * MAX;
    scene.style.setProperty("--glare-x", (px * 100).toFixed(1) + "%");
    scene.style.setProperty("--glare-y", (py * 100).toFixed(1) + "%");
    document.body.classList.add("is-tilting");
    kick();
  });

  scene.addEventListener("pointerleave", () => {
    tRx = tRy = tNx = tNy = 0;
    document.body.classList.remove("is-tilting");
    kick();
  });
}

function bindForgotPasswordForm() {
  const form = document.getElementById("forgotPasswordForm");
  const result = document.getElementById("forgotPasswordResult");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await api("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: formData.get("email") })
      });

      result.classList.remove("hidden");
      result.innerHTML = `
        <strong>${escapeHtml(response.message)}</strong>
        <p style="margin-top: 8px;">Reset link:</p>
        <a style="color: var(--primary); font-weight: 800;" href="${escapeHtml(response.resetLink)}">${escapeHtml(response.resetLink)}</a>
      `;
      showToast("Reset link generated.");
    } catch (error) {
      result.classList.remove("hidden");
      result.textContent = error.message;
    }
  });
}

function bindResetPasswordForm() {
  const form = document.getElementById("resetPasswordForm");
  const tokenField = document.getElementById("resetToken");
  const message = document.getElementById("resetPasswordMessage");
  const token = new URLSearchParams(window.location.search).get("token");

  if (tokenField && token) {
    tokenField.value = token;
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await api("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: formData.get("token"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword")
        })
      });

      setInlineMessage(message, response.message, "success");
      showToast("Password reset successfully.");
      window.setTimeout(() => redirectTo("login.html"), 1200);
    } catch (error) {
      setInlineMessage(message, error.message, "error");
    }
  });
}

async function renderPage(page) {
  renderLoading(`Loading ${document.body.dataset.title || page}...`);

  switch (page) {
    case "dashboard":
      await renderDashboardPage();
      break;
    case "academics":
      await renderAcademicsPage();
      break;
    case "students":
      await renderStudentsPage();
      break;
    case "faculty":
      await renderFacultyPage();
      break;
    case "attendance":
      await renderAttendancePage();
      break;
    case "exams":
      await renderExamsPage();
      break;
    case "timetable":
      await renderTimetablePage();
      break;
    case "fees":
      await renderFeesPage();
      break;
    case "assignments":
      await renderAssignmentsPage();
      break;
    case "notices":
      await renderNoticesPage();
      break;
    case "materials":
      await renderMaterialsPage();
      break;
    case "outing":
      await renderOutingPage();
      break;
    case "placement":
      await renderPlacementPage();
      break;
    case "events":
      await renderEventsPage();
      break;
    case "complaints":
      await renderComplaintsPage();
      break;
    case "disciplinary":
      await renderDisciplinaryPage();
      break;
    case "halltickets":
      await renderHallTicketsPage();
      break;
    case "about":
      await renderAboutPage();
      break;
    case "profile":
      await renderProfilePage();
      break;
    default:
      document.getElementById("pageContent").innerHTML = emptyState("This page is not available.");
  }
}

async function renderDashboardPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "admin") {
    const [studentsData, facultyData, noticesData, outingData, feesData] = await Promise.all([
      api("/students"),
      api("/faculty"),
      api("/notices"),
      api("/outing"),
      api("/students/fees")
    ]);

    const pendingOutings = outingData.requests.filter((item) => item.status === "pending").slice(0, 5);
    const dues = feesData.fees.filter((item) => item.status !== "paid");

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Total Students", value: String(studentsData.students.length), helper: "Active student records", icon: "students" },
        { label: "Faculty Members", value: String(facultyData.faculty.length), helper: "Teaching staff onboarded", icon: "faculty" },
        { label: "Open Notices", value: String(noticesData.notices.length), helper: "Institution-wide communication", icon: "notices" },
        { label: "Pending Outings", value: String(pendingOutings.length), helper: "Approval queue requiring action", icon: "outing" }
      ])}
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Operations",
          title: "Institution snapshot",
          body: `
            <div class="activity-list">
              <div class="list-card">
                <h3>Fee collection pulse</h3>
                <p>${dues.length} student fee records still have pending balances.</p>
              </div>
              <div class="list-card">
                <h3>Role coverage</h3>
                <p>${facultyData.faculty.length} faculty accounts and ${studentsData.students.length} student accounts are ready for live workflows.</p>
              </div>
            </div>
          `
        })}
        ${panel({
          eyebrow: "Recent Notices",
          title: "Communication feed",
          body: noticesData.notices.length
            ? `<div class="notice-list">${noticesData.notices
                .slice(0, 4)
                .map(
                  (notice) => `
                    <article class="notice-card">
                      ${statusBadge(notice.audience)}
                      <h3>${escapeHtml(notice.title)}</h3>
                      <p>${escapeHtml(notice.content)}</p>
                      <div class="meta-row" style="margin-top: 12px;">
                        <span class="muted-text">${escapeHtml(notice.posted_by_name)}</span>
                        <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                      </div>
                    </article>
                  `
                )
                .join("")}</div>`
            : emptyState("No notices have been posted yet.")
        })}
      </section>
      ${createTableCard({
        title: "Pending outing approvals",
        subtitle: "Requests awaiting review",
        headers: ["Student", "Roll Number", "Purpose", "Dates", "Status"],
        rows: pendingOutings.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.student_name)}</td>
              <td>${escapeHtml(request.roll_number)}</td>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
            </tr>
          `
        ),
        emptyMessage: "No pending outing requests."
      })}
    `;
    return;
  }

  if (STATE.user.role === "faculty") {
    const [studentsData, coursesData, assignmentsData, materialsData, noticesData, outingData] = await Promise.all([
      api("/students/assigned"),
      api("/faculty/courses"),
      api("/assignments"),
      api("/materials"),
      api("/notices"),
      api("/outing")
    ]);

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Assigned Students", value: String(studentsData.students.length), helper: "Advisee records available", icon: "students" },
        { label: "Subjects", value: String(coursesData.courses.length), helper: "Subjects mapped to your profile", icon: "timetable" },
        { label: "Assignments Posted", value: String(assignmentsData.assignments.length), helper: "Live academic deliverables", icon: "assignments" },
        { label: "Pending Outings", value: String(outingData.requests.filter((item) => item.status === "pending").length), helper: "Requests needing review", icon: "outing" }
      ])}
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Academics",
          title: "My Subjects",
          body: coursesData.courses.length
            ? `<div class="activity-list">${coursesData.courses
                .map(
                  (course) => `
                    <div class="list-card">
                      <h3>${escapeHtml(course.name)}</h3>
                      <p>${escapeHtml(course.code)} • Semester ${escapeHtml(course.semester)} • ${escapeHtml(course.department_name)}</p>
                    </div>
                  `
                )
                .join("")}</div>`
            : emptyState("No subjects are currently assigned.")
        })}
        ${panel({
          eyebrow: "Notices",
          title: "Latest announcements",
          body: noticesData.notices.length
            ? `<div class="notice-list">${noticesData.notices
                .slice(0, 4)
                .map(
                  (notice) => `
                    <article class="notice-card">
                      <h3>${escapeHtml(notice.title)}</h3>
                      <p>${escapeHtml(notice.content)}</p>
                      <div class="meta-row" style="margin-top: 10px;">
                        ${statusBadge(notice.audience)}
                        <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                      </div>
                    </article>
                  `
                )
                .join("")}</div>`
            : emptyState("No notices available for faculty.")
        })}
      </section>
      ${createTableCard({
        title: "Uploaded materials",
        subtitle: "Resources currently available to students",
        headers: ["Title", "Subject", "Uploaded", "Download"],
        rows: materialsData.materials.map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.title)}</td>
              <td>${escapeHtml(item.course_code)}</td>
              <td>${formatDateTime(item.uploaded_at)}</td>
              <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(item.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
            </tr>
          `
        ),
        emptyMessage: "No materials uploaded yet."
      })}
    `;
    return;
  }

  const [profileData, attendanceData, assignmentsData, submissionsData, materialsData, feesData, noticesData, resultsData, outingData] =
    await Promise.all([
      api("/students/me/profile"),
      api("/attendance/my"),
      api("/assignments"),
      api("/submissions/my"),
      api("/materials"),
      api("/students/me/fees"),
      api("/notices"),
      api("/results/my"),
      api("/outing/my")
    ]);

  const submittedAssignments = new Set(submissionsData.submissions.map((item) => item.assignment_id));
  const feeRecord = feesData.fees[0];

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Overall Attendance", value: `${attendanceData.summary.overallPercentage || 0}%`, helper: "Across all your courses", icon: "attendance" },
      { label: "Open Assignments", value: String(assignmentsData.assignments.filter((item) => !submittedAssignments.has(item.id)).length), helper: "Tasks still awaiting your upload", icon: "assignments" },
      { label: "Study Materials", value: String(materialsData.materials.length), helper: "Files ready for download", icon: "materials" },
      { label: "Fee Balance", value: feeRecord ? formatCurrency(feeRecord.balance) : formatCurrency(0), helper: "Outstanding fee on the latest semester", icon: "fees" }
    ])}
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Profile",
        title: "Your academic profile",
        body: `
          <div class="activity-list">
            <div class="list-card">
              <h3>${escapeHtml(profileData.student.fullName)}</h3>
              <p>${escapeHtml(profileData.student.rollNumber)} • ${escapeHtml(profileData.student.departmentName)}</p>
            </div>
            <div class="list-card">
              <h3>Mentor</h3>
              <p>${escapeHtml(profileData.student.advisorName || "Not assigned")}</p>
            </div>
            <div class="list-card">
              <h3>Semester</h3>
              <p>Semester ${escapeHtml(profileData.student.semester)} • Section ${escapeHtml(profileData.student.section)}</p>
            </div>
          </div>
        `
      })}
      ${panel({
        eyebrow: "Upcoming work",
        title: "Assignment status",
        body: assignmentsData.assignments.length
          ? `<div class="activity-list">${assignmentsData.assignments
              .slice(0, 4)
              .map((assignment) => {
                const submission = submissionsData.submissions.find((item) => item.assignment_id === assignment.id);
                return `
                  <div class="list-card">
                    <h3>${escapeHtml(assignment.title)}</h3>
                    <p>${escapeHtml(assignment.course_code)} • Due ${formatDateTime(assignment.deadline)}</p>
                    <div class="meta-row" style="margin-top: 12px;">${statusBadge(submission ? submission.status : "pending")}</div>
                  </div>
                `;
              })
              .join("")}</div>`
          : emptyState("No assignments assigned to you yet.")
      })}
    </section>
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Results",
        title: "Latest published scores",
        body: resultsData.results.length
          ? `<div class="notice-list">${resultsData.results
              .slice(0, 4)
              .map(
                (result) => `
                  <article class="notice-card">
                    <div class="meta-row">
                      ${statusBadge(result.grade)}
                      <span class="muted-text">${escapeHtml(result.course_code)}</span>
                    </div>
                    <h3>${escapeHtml(result.course_name)}</h3>
                    <p>${escapeHtml(result.exam_type)} • ${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</p>
                  </article>
                `
              )
              .join("")}</div>`
          : emptyState("Results have not been published yet.")
      })}
      ${panel({
        eyebrow: "Notices & outing",
        title: "Recent updates",
        body: `
          <div class="activity-list">
            <div class="list-card">
              <h3>Notice feed</h3>
              <p>${noticesData.notices.length} active notices available for your role.</p>
            </div>
            <div class="list-card">
              <h3>Outing requests</h3>
              <p>${outingData.requests.length} requests submitted so far.</p>
            </div>
          </div>
        `
      })}
    </section>
  `;
}

async function renderFacultyPage() {
  const pageContent = document.getElementById("pageContent");
  const [facultyData, academicData] = await Promise.all([api("/faculty"), api("/academics/overview")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Create faculty account",
        body: `
          <form id="facultyCreateForm" class="form-grid">
            <label class="field"><span>Full name</span><input type="text" name="fullName" placeholder="Faculty full name" required /></label>
            <label class="field"><span>Email</span><input type="email" name="email" placeholder="faculty@college.edu" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" placeholder="At least 8 characters" required /></label>
            <label class="field">
              <span>Department</span>
              <select name="departmentCode" id="facultyDepartmentCreate" required>
                <option value="">Select department</option>
                ${academicData.departments
                  .map(
                    (department) =>
                      `<option value="${department.code}" data-department-id="${department.id}">${escapeHtml(department.name)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="facultyBranchCreate" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field"><span>Designation</span><input type="text" name="designation" placeholder="Assistant Professor" required /></label>
            <label class="field"><span>Employee code</span><input type="text" name="employeeCode" placeholder="FAC010" required /></label>
            <button class="button button-primary" type="submit">Create Faculty</button>
          </form>
        `
      })}
      ${panel({
        title: "Faculty structure",
        body: createStatsGrid([
          { label: "Faculty", value: String(facultyData.faculty.length), icon: "faculty" },
          { label: "Departments", value: String(new Set(facultyData.faculty.map((item) => item.department_name)).size), icon: "students" },
          { label: "Branches", value: String(new Set(facultyData.faculty.map((item) => item.branch_name || "General")).size), icon: "timetable" },
          { label: "Salary Credited", value: String(facultyData.faculty.filter((item) => item.salary_status === "credited").length), icon: "fees" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Faculty directory",
      headers: ["Faculty", "Employee Code", "Department", "Branch", "Salary"],
      rows: facultyData.faculty.map(
        (faculty) => `
          <tr>
            <td>${escapeHtml(faculty.full_name)}<div class="muted-text">${escapeHtml(faculty.email)}</div></td>
            <td>${escapeHtml(faculty.employee_code)}<div class="muted-text">${escapeHtml(faculty.designation)}</div></td>
            <td>${escapeHtml(faculty.department_name)}</td>
            <td>${escapeHtml(faculty.branch_name || "-")}</td>
            <td class="inline-actions">
              ${statusBadge(faculty.salary_status || "pending")}
              <button class="button button-ghost button-small" type="button" data-credit-salary="${faculty.id}">Mark Credited</button>
              <button
                class="icon-action icon-action-danger"
                type="button"
                data-delete-faculty="${faculty.id}"
                aria-label="Delete faculty"
                title="Delete faculty"
              >
                ${icon("trash")}
              </button>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No faculty records available."
    })}
  `;

  const departmentSelect = document.getElementById("facultyDepartmentCreate");
  const branchSelect = document.getElementById("facultyBranchCreate");

  const syncBranches = () => {
    const selectedDepartmentId = departmentSelect.selectedOptions[0]?.dataset.departmentId || "";
    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${buildBranchOptionsFromData(academicData.branches, selectedDepartmentId)}
    `;
  };

  departmentSelect?.addEventListener("change", syncBranches);

  document.getElementById("facultyCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/faculty", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Faculty created successfully.");
      await renderFacultyPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-credit-salary]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/academics/faculty/${button.dataset.creditSalary}/assignment`, {
          method: "PUT",
          body: JSON.stringify({ salaryStatus: "credited" })
        });
        showToast("Salary status updated.");
        await renderFacultyPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll("[data-delete-faculty]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteFaculty(button.dataset.deleteFaculty, button);
    });
  });
}

async function deleteFaculty(facultyId, button = null) {
  const parsedFacultyId = Number(facultyId);

  if (!parsedFacultyId) {
    showToast("Faculty selection is invalid.", "error");
    return;
  }

  const confirmed = window.confirm("Are you sure you want to delete this faculty? This action cannot be undone.");
  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;
  }

  try {
    await api(`/faculty/${parsedFacultyId}`, { method: "DELETE" });
    button?.closest("tr")?.remove();
    showToast("Faculty deleted successfully.");
    await renderFacultyPage();
  } catch (error) {
    if (button) {
      button.disabled = false;
    }
    showToast(error.message, "error");
  }
}

async function renderAttendancePage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const [attendanceData, subjectsData, timetableData] = await Promise.all([
      api("/attendance/my"),
      api("/students/me/courses"),
      api("/students/me/timetable")
    ]);

    const renderSubjectAttendance = (subjectId) => {
      const filtered =
        subjectId && subjectId !== "all"
          ? attendanceData.summary.byCourse.filter((item) => String(item.course_id) === String(subjectId))
          : attendanceData.summary.byCourse;

      return createTableCard({
        title: "Subject-wise attendance",
        headers: ["Subject", "Attended", "Total", "Percentage"],
        rows: filtered.map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.course_name)}<div class="muted-text">${escapeHtml(item.course_code)}</div></td>
              <td>${escapeHtml(item.attended_classes)}</td>
              <td>${escapeHtml(item.total_classes)}</td>
              <td>${statusBadge(`${item.percentage}%`)}</td>
            </tr>
          `
        ),
        emptyMessage: "No attendance records are available for the selected subject."
      });
    };

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Overall", value: `${attendanceData.summary.overallPercentage || 0}%`, icon: "attendance" },
        { label: "Subjects", value: String(attendanceData.summary.byCourse.length), icon: "timetable" },
        { label: "Recent Logs", value: String(attendanceData.summary.recent.length), icon: "dashboard" },
        { label: "Above 75%", value: String(attendanceData.summary.byCourse.filter((item) => Number(item.percentage) >= 75).length), icon: "results" }
      ])}
      ${panel({
        title: "Select subject",
        body: `
          <label class="field">
            <span>Subject</span>
            <select id="attendanceSubjectFilter">
              <option value="all">All subjects</option>
              ${subjectsData.courses
                .map((subject) => `<option value="${subject.id}">${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</option>`)
                .join("")}
            </select>
          </label>
        `
      })}
      <div id="studentAttendanceTable">${renderSubjectAttendance("all")}</div>
      ${createTableCard({
        title: "Recent attendance log",
        headers: ["Date", "Subject", "Status"],
        rows: attendanceData.summary.recent.map(
          (item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${escapeHtml(item.course_name)}<div class="muted-text">${escapeHtml(item.course_code)}</div></td>
              <td>${statusBadge(item.status)}</td>
            </tr>
          `
        ),
        emptyMessage: "No recent attendance logs available."
      })}
      ${panel({
        eyebrow: "Schedule",
        title: "Your weekly timetable",
        body: buildTimetableBoard(timetableData.timetable || [], "No classes are scheduled for your branch yet.")
      })}
    `;

    document.getElementById("attendanceSubjectFilter")?.addEventListener("change", (event) => {
      document.getElementById("studentAttendanceTable").innerHTML = renderSubjectAttendance(event.currentTarget.value);
    });
    return;
  }

  const isAdmin = STATE.user.role === "admin";
  const [coursesData, studentsData] = await Promise.all([
    api("/faculty/courses"),
    api(isAdmin ? "/students" : "/students/assigned")
  ]);

  // Build department options from students AND courses (keyed by name — the
  // student list carries department_name, not department_id). This ensures a
  // branch/department that has students but no subjects yet still appears.
  const departmentOptions = [
    ...new Set(
      [...coursesData.courses, ...studentsData.students].map((row) => row.department_name).filter(Boolean)
    )
  ].map((name) => ({ id: name, name }));

  pageContent.innerHTML = `
    ${panel({
      title: isAdmin ? "Mark attendance by subject" : "Mark attendance",
      body: `
        <form id="attendanceForm" class="stack-form">
          <div class="form-grid">
            ${
              isAdmin
                ? `
                  <label class="field">
                    <span>Department</span>
                    <select id="attendanceDepartment">
                      <option value="">Select department</option>
                      ${departmentOptions.map((department) => `<option value="${department.id}">${escapeHtml(department.name)}</option>`).join("")}
                    </select>
                  </label>
                  <label class="field">
                    <span>Branch</span>
                    <select id="attendanceBranch">
                      <option value="">Select branch</option>
                    </select>
                  </label>
                `
                : ""
            }
            <label class="field">
              <span>Subject</span>
              <select name="courseId" id="attendanceCourse" required>
                <option value="">Select subject</option>
              </select>
            </label>
            <label class="field">
              <span>Date</span>
              <input type="date" name="date" id="attendanceDate" required />
            </label>
          </div>
          <div id="attendanceRoster">${emptyState("Choose a subject to load the student roster.")}</div>
          <button class="button button-primary" type="submit">Save Attendance</button>
        </form>
      `
    })}
    <div id="attendanceHistory"></div>
  `;

  const departmentSelect = document.getElementById("attendanceDepartment");
  const branchSelect = document.getElementById("attendanceBranch");
  const courseSelect = document.getElementById("attendanceCourse");
  const dateInput = document.getElementById("attendanceDate");
  const rosterRoot = document.getElementById("attendanceRoster");
  const historyRoot = document.getElementById("attendanceHistory");
  dateInput.value = new Date().toISOString().slice(0, 10);

  const getVisibleCourses = () =>
    coursesData.courses
      .filter((course) => !isAdmin || !departmentSelect.value || String(course.department_name) === String(departmentSelect.value))
      .filter((course) => !isAdmin || !branchSelect.value || String(course.branch_id) === String(branchSelect.value));

  const syncBranchOptions = () => {
    if (!isAdmin || !branchSelect) return;

    const inDept = (deptName) => !departmentSelect.value || String(deptName) === String(departmentSelect.value);
    // Union of branches from courses AND students, so branches that only have
    // students (no subjects yet) are still selectable.
    const visibleBranches = [
      ...new Map(
        [
          ...coursesData.courses.filter((course) => inDept(course.department_name)),
          ...studentsData.students.filter((student) => inDept(student.department_name))
        ]
          .filter((row) => row.branch_id != null)
          .map((row) => [String(row.branch_id), { id: row.branch_id, name: row.branch_name }])
      ).values()
    ];

    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${visibleBranches.map((branch) => `<option value="${branch.id}">${escapeHtml(branch.name || "-")}</option>`).join("")}
    `;
  };

  const syncSubjectOptions = () => {
    courseSelect.innerHTML = `
      <option value="">Select subject</option>
      ${getVisibleCourses()
        .map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`)
        .join("")}
    `;
  };

  const renderRoster = async () => {
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    if (!selectedCourse) {
      // A branch was chosen that has students but no subjects — explain the
      // dead-end and the fix instead of a bare "choose a subject" prompt.
      if (isAdmin && branchSelect.value && getVisibleCourses().length === 0) {
        const waiting = studentsData.students.filter(
          (student) => String(student.branch_id || "") === String(branchSelect.value)
        );
        if (waiting.length) {
          const branchName = waiting[0].branch_name || "this branch";
          const semesters = [...new Set(waiting.map((student) => Number(student.semester)))].sort((a, b) => a - b);
          rosterRoot.innerHTML = `
            <div class="empty-state" style="text-align: left;">
              <strong>No subjects exist for ${escapeHtml(branchName)} yet.</strong>
              <p class="muted-text" style="margin-top: 6px;">
                ${waiting.length} student${waiting.length === 1 ? "" : "s"} in ${escapeHtml(branchName)}
                (semester${semesters.length === 1 ? "" : "s"} ${semesters.join(", ")})
                ${waiting.length === 1 ? "is" : "are"} waiting. Attendance is recorded per subject —
                add a subject for this branch and semester under <strong>Academics</strong>,
                then it will appear here to mark.
              </p>
            </div>`;
          historyRoot.innerHTML = "";
          return;
        }
      }
      rosterRoot.innerHTML = emptyState("Choose a subject to load the student roster.");
      historyRoot.innerHTML = "";
      return;
    }

    const roster = studentsData.students.filter(
      (student) =>
        student.department_name === selectedCourse.department_name &&
        String(student.branch_id || "") === String(selectedCourse.branch_id || "") &&
        Number(student.semester) === Number(selectedCourse.semester)
    );

    rosterRoot.innerHTML = roster.length
      ? `
          <section class="roster-card">
            <div class="roster-header">
              <div>
                <h3 style="margin: 0;">${escapeHtml(selectedCourse.name)}</h3>
                <p class="muted-text">${escapeHtml(selectedCourse.code)} - ${escapeHtml(selectedCourse.branch_name || selectedCourse.department_name)}</p>
              </div>
              ${statusBadge("ready")}
            </div>
            <div class="roster-grid">
              ${roster
                .map(
                  (student) => `
                    <div class="roster-item">
                      <div>
                        <strong>${escapeHtml(student.full_name)}</strong>
                        <div class="muted-text">${escapeHtml(student.roll_number)} - Section ${escapeHtml(student.section)}</div>
                      </div>
                      <label class="field" style="margin: 0;">
                        <span>Status</span>
                        <select name="status-${student.id}" data-student-id="${student.id}">
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </select>
                      </label>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      : emptyState("No students are mapped to this subject yet.");

    const history = await api(`/attendance/course/${selectedCourse.id}`);
    historyRoot.innerHTML = createTableCard({
      title: "Attendance history",
      headers: ["Date", "Student", "Roll Number", "Status"],
      rows: history.records.map(
        (record) => `
          <tr>
            <td>${formatDate(record.date)}</td>
            <td>${escapeHtml(record.full_name)}</td>
            <td>${escapeHtml(record.roll_number)}</td>
            <td>${statusBadge(record.status)}</td>
          </tr>
        `
      ),
      emptyMessage: "No attendance history found for this subject."
    });
  };

  departmentSelect?.addEventListener("change", () => {
    syncBranchOptions();
    syncSubjectOptions();
    renderRoster();
  });
  branchSelect?.addEventListener("change", () => {
    syncSubjectOptions();
    renderRoster();
  });
  courseSelect?.addEventListener("change", renderRoster);

  syncBranchOptions();
  syncSubjectOptions();

  document.getElementById("attendanceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!courseSelect.value) {
      showToast("Please select a subject first.", "error");
      return;
    }

    const records = [...document.querySelectorAll("[data-student-id]")].map((field) => ({
      studentId: Number(field.dataset.studentId),
      status: field.value
    }));

    try {
      await api("/attendance", {
        method: "POST",
        body: JSON.stringify({
          courseId: Number(courseSelect.value),
          date: dateInput.value,
          records
        })
      });
      showToast("Attendance saved successfully.");
      await renderRoster();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderExamsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const [resultsData, examsData] = await Promise.all([api("/results/my"), api("/results/exams")]);

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Results", value: String(resultsData.results.length), icon: "results" },
        { label: "Scheduled Exams", value: String(examsData.exams.length), icon: "attendance" },
        { label: "Passed Subjects", value: String(resultsData.results.filter((item) => item.grade !== "F").length), icon: "students" },
        { label: "Top Grade", value: resultsData.results[0] ? resultsData.results[0].grade : "-", icon: "dashboard" }
      ])}
      ${createTableCard({
        title: "Upcoming exams",
        headers: ["Subject", "Branch", "Date", "Time"],
        rows: examsData.exams.map(
          (exam) => `
            <tr>
              <td>${escapeHtml(exam.course_name)}<div class="muted-text">${escapeHtml(exam.course_code)}</div></td>
              <td>${escapeHtml(exam.department_name || "-")}<div class="muted-text">${escapeHtml(exam.branch_name || "-")}</div></td>
              <td>${formatDate(exam.exam_date)}</td>
              <td>${escapeHtml(exam.exam_time)}</td>
            </tr>
          `
        ),
        emptyMessage: "No exams are scheduled yet."
      })}
      ${createTableCard({
        title: "Published results",
        headers: ["Subject", "Exam", "Score", "Grade", "Published"],
        rows: resultsData.results.map(
          (result) => `
            <tr>
              <td>${escapeHtml(result.course_name)}<div class="muted-text">${escapeHtml(result.course_code)}</div></td>
              <td>${escapeHtml(result.exam_type)}</td>
              <td>${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</td>
              <td>${statusBadge(result.grade)}</td>
              <td>${formatDateTime(result.published_at)}</td>
            </tr>
          `
        ),
        emptyMessage: "Results are not available yet."
      })}
    `;
    return;
  }

  const isAdmin = STATE.user.role === "admin";
  const [resultsData, examsData, coursesData, studentsData] = await Promise.all([
    api("/results"),
    api("/results/exams"),
    api("/faculty/courses"),
    api(isAdmin ? "/students" : "/students/assigned")
  ]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Publish marks",
        body: `
          <form id="resultForm" class="form-grid">
            <label class="field">
              <span>Subject</span>
              <select name="courseId" id="resultCourse" required>
                <option value="">Select subject</option>
                ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Student</span>
              <select name="studentId" id="resultStudent" required><option value="">Select student</option></select>
            </label>
            <label class="field"><span>Exam type</span><input type="text" name="examType" placeholder="Mid Semester" required /></label>
            <label class="field"><span>Marks obtained</span><input type="number" name="marksObtained" min="0" required /></label>
            <label class="field"><span>Maximum marks</span><input type="number" name="maxMarks" min="1" required /></label>
            <label class="field full-width"><span>Remarks</span><textarea name="remarks" placeholder="Optional note"></textarea></label>
            <button class="button button-primary" type="submit">Publish Result</button>
          </form>
        `
      })}
      ${
        isAdmin
          ? panel({
              title: "Create exam schedule",
              body: `
                <form id="examCreateForm" class="form-grid">
                  <label class="field">
                    <span>Subject</span>
                    <select name="courseId" required>
                      <option value="">Select subject</option>
                      ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`).join("")}
                    </select>
                  </label>
                  <label class="field"><span>Exam name</span><input type="text" name="examName" placeholder="Mid Semester" required /></label>
                  <label class="field"><span>Date</span><input type="date" name="examDate" required /></label>
                  <label class="field"><span>Time</span><input type="time" name="examTime" required /></label>
                  <button class="button button-primary" type="submit">Create Exam</button>
                </form>
              `
            })
          : panel({
              title: "Exam overview",
              body: createStatsGrid([
                { label: "Results", value: String(resultsData.results.length), icon: "results" },
                { label: "Scheduled", value: String(examsData.exams.length), icon: "attendance" },
                { label: "Subjects", value: String(coursesData.courses.length), icon: "timetable" },
                { label: "Students", value: String(studentsData.students.length), icon: "students" }
              ])
            })
      }
    </section>
    ${createTableCard({
      title: "Exam schedule",
      headers: ["Subject", "Branch", "Date", "Time"],
      rows: examsData.exams.map(
        (exam) => `
          <tr>
            <td>${escapeHtml(exam.course_name)}<div class="muted-text">${escapeHtml(exam.course_code)}</div></td>
            <td>${escapeHtml(exam.department_name || "-")}<div class="muted-text">${escapeHtml(exam.branch_name || "-")}</div></td>
            <td>${formatDate(exam.exam_date)}</td>
            <td>${escapeHtml(exam.exam_time)}</td>
          </tr>
        `
      ),
      emptyMessage: "No exam schedule available yet."
    })}
    ${createTableCard({
      title: "Published results",
      headers: ["Student", "Subject", "Exam", "Score", "Grade"],
      rows: resultsData.results.map(
        (result) => `
          <tr>
            <td>${escapeHtml(result.student_name)}<div class="muted-text">${escapeHtml(result.roll_number)}</div></td>
            <td>${escapeHtml(result.course_name)}<div class="muted-text">${escapeHtml(result.course_code)}</div></td>
            <td>${escapeHtml(result.exam_type)}</td>
            <td>${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</td>
            <td>${statusBadge(result.grade)}</td>
          </tr>
        `
      ),
      emptyMessage: "No results have been published yet."
    })}
  `;

  const courseSelect = document.getElementById("resultCourse");
  const studentSelect = document.getElementById("resultStudent");

  const populateStudents = () => {
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    const filteredStudents = selectedCourse
      ? studentsData.students.filter(
          (student) =>
            student.department_name === selectedCourse.department_name &&
            String(student.branch_id || "") === String(selectedCourse.branch_id || "") &&
            Number(student.semester) === Number(selectedCourse.semester)
        )
      : [];

    studentSelect.innerHTML = filteredStudents.length
      ? filteredStudents
          .map((student) => `<option value="${student.id}">${escapeHtml(student.full_name)} - ${escapeHtml(student.roll_number)}</option>`)
          .join("")
      : `<option value="">Select student</option>`;
  };

  courseSelect?.addEventListener("change", populateStudents);
  populateStudents();

  document.getElementById("resultForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/results", {
        method: "POST",
        body: JSON.stringify({
          studentId: Number(formData.get("studentId")),
          courseId: Number(formData.get("courseId")),
          examType: formData.get("examType"),
          marksObtained: Number(formData.get("marksObtained")),
          maxMarks: Number(formData.get("maxMarks")),
          remarks: formData.get("remarks")
        })
      });
      showToast("Result published successfully.");
      await renderExamsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("examCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/results/exams", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Exam created successfully.");
      await renderExamsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function buildSemesterOptions(selectedValue = "") {
  return Array.from({ length: 8 }, (_, index) => {
    const value = String(index + 1);
    const selected = String(selectedValue) === value ? "selected" : "";
    return `<option value="${value}" ${selected}>Semester ${value}</option>`;
  }).join("");
}

// Compact, spreadsheet-style timetable: days across the top, time slots down the
// side, one cell per day/slot — like an Excel grid.
function buildTimetableBoard(timetable, emptyMessage = "No classes scheduled yet.") {
  const canManageTimetable = STATE.user?.role === "admin";

  if (!timetable.length) {
    return `<div class="empty-inline">${escapeHtml(emptyMessage)}</div>`;
  }

  // Distinct time slots (start/end), ordered by start time.
  const slots = [
    ...new Map(
      timetable.map((entry) => [`${entry.start_time}-${entry.end_time}`, { start: entry.start_time, end: entry.end_time }])
    ).values()
  ].sort((a, b) => String(a.start).localeCompare(String(b.start)));

  const cell = (day, slot) => {
    const entries = timetable.filter(
      (entry) => entry.day_of_week === day && entry.start_time === slot.start && entry.end_time === slot.end
    );
    if (!entries.length) {
      return `<td class="tt-empty"></td>`;
    }
    return `<td class="tt-cell">${entries
      .map(
        (entry) => `
          <div class="tt-entry">
            <span class="tt-code">${escapeHtml(entry.course_code || entry.course_name)}</span>
            ${entry.room_no ? `<span class="tt-room">${escapeHtml(entry.room_no)}</span>` : ""}
            ${entry.faculty_name ? `<span class="tt-faculty">${escapeHtml(entry.faculty_name)}</span>` : ""}
            ${
              canManageTimetable
                ? `<button class="tt-del" type="button" data-delete-slot="${entry.id}" title="Delete slot" aria-label="Delete slot">&times;</button>`
                : ""
            }
          </div>`
      )
      .join("")}</td>`;
  };

  return `
    <div class="tt-wrap">
      <table class="tt-grid">
        <thead>
          <tr>
            <th class="tt-corner">Time</th>
            ${WEEK_DAYS.map((day) => `<th>${escapeHtml(day.slice(0, 3))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${slots
            .map(
              (slot) => `
                <tr>
                  <th class="tt-time">${escapeHtml(formatTime(slot.start))}<span class="tt-time-end">${escapeHtml(formatTime(slot.end))}</span></th>
                  ${WEEK_DAYS.map((day) => cell(day, slot)).join("")}
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindTimetableAdminActions() {
  if (STATE.user?.role !== "admin") {
    return;
  }

  document.querySelectorAll("[data-delete-slot]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteTimetableSlot(button.dataset.deleteSlot, button);
    });
  });

  document.querySelectorAll("[data-delete-day]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteDaySlots(button.dataset.deleteDay, button);
    });
  });
}

async function deleteTimetableSlot(slotId, button = null) {
  const parsedSlotId = Number(slotId);

  if (!parsedSlotId) {
    showToast("Timetable slot selection is invalid.", "error");
    return;
  }

  const confirmed = window.confirm("Delete this timetable slot?");
  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;
  }

  try {
    await api(`/faculty/timetable/${parsedSlotId}`, { method: "DELETE" });
    showToast("Timetable slot deleted successfully.");
    await renderTimetablePage();
  } catch (error) {
    if (button) {
      button.disabled = false;
    }
    showToast(error.message, "error");
  }
}

async function deleteDaySlots(day, button = null) {
  if (!day) {
    showToast("Timetable day selection is invalid.", "error");
    return;
  }

  const confirmed = window.confirm(`Delete all timetable slots for ${day}?`);
  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;
  }

  try {
    const response = await api(`/faculty/timetable/day/${encodeURIComponent(day)}`, { method: "DELETE" });
    showToast(response.message || "Day timetable deleted successfully.");
    await renderTimetablePage();
  } catch (error) {
    if (button) {
      button.disabled = false;
    }
    showToast(error.message, "error");
  }
}

function buildDepartmentOptionsFromData(departments, selectedValue = "") {
  return departments
    .map((department) => {
      const selected = String(selectedValue) === String(department.id) ? "selected" : "";
      return `<option value="${department.id}" ${selected}>${escapeHtml(department.name)}</option>`;
    })
    .join("");
}

function buildBranchOptionsFromData(branches, departmentId, selectedValue = "") {
  return branches
    .filter((branch) => !departmentId || String(branch.department_id) === String(departmentId))
    .map((branch) => {
      const selected = String(selectedValue) === String(branch.id) ? "selected" : "";
      return `<option value="${branch.id}" ${selected}>${escapeHtml(branch.name)}</option>`;
    })
    .join("");
}

function buildSubjectOptions(subjects, { departmentId = "", branchId = "", facultyOnly = false } = {}) {
  return subjects
    .filter((subject) => !departmentId || String(subject.department_id) === String(departmentId))
    .filter((subject) => !branchId || String(subject.branch_id) === String(branchId))
    .filter((subject) => (facultyOnly ? Boolean(subject.faculty_id) : true))
    .map(
      (subject) =>
        `<option value="${subject.id}">${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</option>`
    )
    .join("");
}

function buildFacultyAssignmentOptions(facultyList, selectedValue = "") {
  return facultyList
    .map((faculty) => {
      const selected = String(selectedValue) === String(faculty.id) ? "selected" : "";
      const descriptor = faculty.branch_name || faculty.department_name || faculty.employee_code || "Faculty";
      return `<option value="${faculty.id}" ${selected}>${escapeHtml(faculty.full_name)} - ${escapeHtml(descriptor)}</option>`;
    })
    .join("");
}

async function fetchCurrentTimetableData() {
  if (STATE.user.role === "student") {
    const studentId = STATE.user.studentProfile?.id;
    if (!studentId) {
      throw new Error("Student profile is unavailable for timetable lookup.");
    }

    return api(`/timetable/${studentId}`);
  }

  return api("/faculty/timetable");
}

async function renderAssignmentsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const [assignmentsData, submissionsData] = await Promise.all([api("/assignments"), api("/submissions/my")]);

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Assignments", value: String(assignmentsData.assignments.length), helper: "Tasks available for this semester", icon: "assignments" },
        { label: "Submitted", value: String(submissionsData.submissions.length), helper: "Assignments already uploaded", icon: "materials" },
        { label: "Pending", value: String(assignmentsData.assignments.filter((item) => !submissionsData.submissions.some((submission) => submission.assignment_id === item.id)).length), helper: "Assignments still open", icon: "attendance" },
        { label: "Late", value: String(submissionsData.submissions.filter((item) => item.status === "late").length), helper: "Submissions past the deadline", icon: "dashboard" }
      ])}
      <section class="assignment-grid">
        ${
          assignmentsData.assignments.length
            ? assignmentsData.assignments
                .map((assignment) => {
                  const submission = submissionsData.submissions.find((item) => item.assignment_id === assignment.id);
                  return `
                    <article class="assignment-card">
                      <div class="split-row">
                        <div>
                          <div class="meta-row">
                            ${statusBadge(submission ? submission.status : "pending")}
                            ${tag(assignment.course_code)}
                          </div>
                          <h3 style="margin: 12px 0 8px;">${escapeHtml(assignment.title)}</h3>
                          <p>${escapeHtml(assignment.description)}</p>
                        </div>
                        <div class="muted-text">Due ${formatDateTime(assignment.deadline)}</div>
                      </div>
                      <div class="inline-actions">
                        ${
                          assignment.attachmentUrl
                            ? `<a class="button button-secondary button-small" href="${normalizeAssetUrl(assignment.attachmentUrl)}" target="_blank" rel="noreferrer">Download Brief</a>`
                            : ""
                        }
                        ${
                          submission
                            ? `<a class="button button-secondary button-small" href="${normalizeAssetUrl(submission.downloadUrl)}" target="_blank" rel="noreferrer">View Submission</a>`
                            : ""
                        }
                      </div>
                      <form class="compact-form" data-submission-form="${assignment.id}">
                        <label class="field">
                          <span>Notes</span>
                          <textarea name="notes" placeholder="Optional submission notes">${escapeHtml(submission?.notes || "")}</textarea>
                        </label>
                        <label class="field">
                          <span>Submission file</span>
                          <input type="file" name="file" ${submission ? "" : "required"} />
                        </label>
                        <button class="button button-primary" type="submit">${submission ? "Update Submission" : "Submit Assignment"}</button>
                      </form>
                    </article>
                  `;
                })
                .join("")
            : emptyState("No assignments are available right now.")
        }
      </section>
    `;

    document.querySelectorAll("[data-submission-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const assignmentId = event.currentTarget.dataset.submissionForm;
        const formData = new FormData(event.currentTarget);
        formData.append("assignmentId", assignmentId);

        try {
          await api("/submissions", {
            method: "POST",
            body: formData
          });
          showToast("Assignment submitted successfully.");
          await renderAssignmentsPage();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
    return;
  }

  const [assignmentsData, coursesData] = await Promise.all([api("/assignments"), api("/faculty/courses")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Faculty Action",
        title: "Create assignment",
        body: `
          <form id="assignmentCreateForm" class="form-grid">
            <label class="field">
              <span>Course</span>
              <select name="courseId" required>
                <option value="">Select course</option>
                ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} • ${escapeHtml(course.name)}</option>`).join("")}
              </select>
            </label>
            <label class="field"><span>Deadline</span><input type="datetime-local" name="deadline" required /></label>
            <label class="field full-width"><span>Title</span><input type="text" name="title" placeholder="Assignment title" required /></label>
            <label class="field full-width"><span>Description</span><textarea name="description" placeholder="Explain the task and expected outcome" required></textarea></label>
            <label class="field full-width"><span>Attachment (optional)</span><input type="file" name="attachment" /></label>
            <button class="button button-primary full-width" type="submit">Create Assignment</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Overview",
        title: "Assignment delivery",
        body: createStatsGrid([
          { label: "Assignments", value: String(assignmentsData.assignments.length), helper: "Current academic tasks", icon: "assignments" },
          { label: "Subjects", value: String(coursesData.courses.length), helper: "Subjects available for posting", icon: "timetable" },
          { label: "Attachments", value: String(assignmentsData.assignments.filter((item) => item.attachmentUrl).length), helper: "Assignments with files attached", icon: "materials" },
          { label: "Submissions", value: String(assignmentsData.assignments.reduce((sum, item) => sum + Number(item.submissions_count || 0), 0)), helper: "Total uploaded student work", icon: "students" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Assignment register",
      subtitle: "Assignments available for your accessible subjects",
      headers: ["Assignment", "Subject", "Deadline", "Submissions", "Actions"],
      rows: assignmentsData.assignments.map(
        (assignment) => `
          <tr>
            <td><strong>${escapeHtml(assignment.title)}</strong><div class="muted-text">${escapeHtml(assignment.description)}</div></td>
            <td>${escapeHtml(assignment.course_code)}</td>
            <td>${formatDateTime(assignment.deadline)}</td>
            <td>${escapeHtml(assignment.submissions_count || 0)}</td>
            <td class="inline-actions">
              ${assignment.attachmentUrl ? `<a class="button button-secondary button-small" href="${normalizeAssetUrl(assignment.attachmentUrl)}" target="_blank" rel="noreferrer">Brief</a>` : ""}
              <button class="button button-ghost button-small" type="button" data-view-submissions="${assignment.id}">View Submissions</button>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No assignments have been created yet."
    })}
    <div id="assignmentSubmissionViewer"></div>
  `;

  document.getElementById("assignmentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/assignments", {
        method: "POST",
        body: formData
      });
      showToast("Assignment created successfully.");
      await renderAssignmentsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-view-submissions]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const assignmentId = button.dataset.viewSubmissions;
        const data = await api(`/submissions/${assignmentId}`);
        document.getElementById("assignmentSubmissionViewer").innerHTML = createTableCard({
          title: "Student submissions",
          subtitle: "Uploaded files for the selected assignment",
          headers: ["Student", "Submitted At", "Status", "Download"],
          rows: data.submissions.map(
            (submission) => `
              <tr>
                <td>${escapeHtml(submission.student_name)} <div class="muted-text">${escapeHtml(submission.roll_number)}</div></td>
                <td>${formatDateTime(submission.submitted_at)}</td>
                <td>${statusBadge(submission.status)}</td>
                <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(submission.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
              </tr>
            `
          ),
          emptyMessage: "No student submissions found for this assignment."
        });
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderOutingPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const outingData = await api("/outing/my");
    const pendingRequests = outingData.requests.filter((item) => item.status === "pending");
    const approvedRequests = outingData.requests.filter((item) => item.status === "approved");
    const rejectedRequests = outingData.requests.filter((item) => item.status === "rejected");

    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Student Action",
          title: "Request outing approval",
          body: `
            <form id="outingCreateForm" class="form-grid">
              <label class="field full-width"><span>Purpose</span><input type="text" name="purpose" placeholder="Reason for the outing request" required /></label>
              <label class="field"><span>Destination</span><input type="text" name="destination" placeholder="Destination" required /></label>
              <label class="field"><span>Outing date</span><input type="date" name="outingDate" required /></label>
              <label class="field"><span>Return date</span><input type="date" name="returnDate" required /></label>
              <button class="button button-primary full-width" type="submit">Submit Request</button>
            </form>
          `
        })}
        ${panel({
          eyebrow: "Overview",
          title: "Request tracker",
          body: createStatsGrid([
            { label: "Requests", value: String(outingData.requests.length), icon: "outing" },
            { label: "Pending", value: String(pendingRequests.length), icon: "attendance" },
            { label: "Approved", value: String(approvedRequests.length), icon: "results" },
            { label: "Rejected", value: String(rejectedRequests.length), icon: "dashboard" }
          ])
        })}
      </section>
      ${createTableCard({
        title: "Pending requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: pendingRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "No comments yet")}</td>
            </tr>
          `
        ),
        emptyMessage: "No pending outing requests."
      })}
      ${createTableCard({
        title: "Approved requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: approvedRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "Approved")}</td>
            </tr>
          `
        ),
        emptyMessage: "No approved outing requests yet."
      })}
      ${createTableCard({
        title: "Rejected requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: rejectedRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "No comments yet")}</td>
            </tr>
          `
        ),
        emptyMessage: "No rejected outing requests."
      })}
    `;

    document.getElementById("outingCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/outing", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        showToast("Outing request submitted successfully.");
        await renderOutingPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
    return;
  }

  const outingData = await api("/outing");
  const pendingRequests = outingData.requests.filter((item) => item.status === "pending");
  const approvedRequests = outingData.requests.filter((item) => item.status === "approved");
  const rejectedRequests = outingData.requests.filter((item) => item.status === "rejected");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Requests", value: String(outingData.requests.length), icon: "outing" },
      { label: "Pending", value: String(pendingRequests.length), icon: "attendance" },
      { label: "Approved", value: String(approvedRequests.length), icon: "results" },
      { label: "Rejected", value: String(rejectedRequests.length), icon: "dashboard" }
    ])}
    ${panel({
      title: "Pending outing requests",
      body: pendingRequests.length
        ? `<section class="outing-grid">
            ${pendingRequests
              .map(
                (request) => `
                  <article class="outing-card">
                    <div class="split-row">
                      <div>
                        <div class="meta-row">
                          ${statusBadge(request.status)}
                          ${tag(request.roll_number)}
                        </div>
                        <h3 style="margin: 12px 0 8px;">${escapeHtml(request.student_name)}</h3>
                        <p>${escapeHtml(request.purpose)} &middot; ${escapeHtml(request.destination)}</p>
                      </div>
                      <div class="muted-text">${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</div>
                    </div>
                    <form class="compact-form" data-outing-review="${request.id}">
                      <label class="field">
                        <span>Reviewer comment</span>
                        <textarea name="facultyComment" placeholder="Optional comment for the student">${escapeHtml(request.faculty_comment || "")}</textarea>
                      </label>
                      <div class="inline-actions">
                        <button class="button button-primary button-small" type="submit" name="status" value="approved">Approve</button>
                        <button class="button button-danger button-small" type="submit" name="status" value="rejected">Reject</button>
                      </div>
                    </form>
                  </article>
                `
              )
              .join("")}
          </section>`
        : emptyState("No outing requests require review right now.")
    })}
    ${createTableCard({
      title: "Approved requests",
      headers: ["Student", "Roll Number", "Purpose", "Dates", "Comment"],
      rows: approvedRequests.map(
        (request) => `
          <tr>
            <td>${escapeHtml(request.student_name)}</td>
            <td>${escapeHtml(request.roll_number)}</td>
            <td>${escapeHtml(request.purpose)}</td>
            <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
            <td>${escapeHtml(request.faculty_comment || "Approved")}</td>
          </tr>
        `
      ),
      emptyMessage: "No approved outing requests yet."
    })}
    ${createTableCard({
      title: "Rejected requests",
      headers: ["Student", "Roll Number", "Purpose", "Dates", "Comment"],
      rows: rejectedRequests.map(
        (request) => `
          <tr>
            <td>${escapeHtml(request.student_name)}</td>
            <td>${escapeHtml(request.roll_number)}</td>
            <td>${escapeHtml(request.purpose)}</td>
            <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
            <td>${escapeHtml(request.faculty_comment || "Rejected")}</td>
          </tr>
        `
      ),
      emptyMessage: "No rejected outing requests."
    })}
  `;

  document.querySelectorAll("[data-outing-review]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.submitter;
      const formData = new FormData(event.currentTarget);

      try {
        await api(`/outing/${event.currentTarget.dataset.outingReview}`, {
          method: "PUT",
          body: JSON.stringify({
            status: button.value,
            facultyComment: formData.get("facultyComment")
          })
        });
        showToast(`Outing request ${button.value}.`);
        await renderOutingPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderAcademicsPage() {
  const pageContent = document.getElementById("pageContent");
  const overview = await api("/academics/overview");

  const facultyOptions = overview.faculty
    .map(
      (faculty) =>
        `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} - ${escapeHtml(faculty.employee_code)}</option>`
    )
    .join("");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Departments", value: String(overview.departments.length), icon: "faculty" },
      { label: "Branches", value: String(overview.branches.length), icon: "students" },
      { label: "Subjects", value: String(overview.subjects.length), icon: "results" },
      { label: "Faculty Linked", value: String(overview.subjects.filter((subject) => subject.faculty_id).length), icon: "timetable" }
    ])}
    <section class="section-grid two-column">
      ${panel({
        title: "Department management",
        body: `
          <form id="departmentCreateForm" class="form-grid">
            <label class="field">
              <span>Department name</span>
              <input type="text" name="name" placeholder="BTech" required />
            </label>
            <label class="field">
              <span>Code</span>
              <input type="text" name="code" placeholder="BTECH" required />
            </label>
            <button class="button button-primary" type="submit">Add Department</button>
          </form>
        `
      })}
      ${panel({
        title: "Branch management",
        body: `
          <form id="branchCreateForm" class="form-grid">
            <label class="field">
              <span>Department</span>
              <select name="departmentId" required>
                <option value="">Select department</option>
                ${buildDepartmentOptionsFromData(overview.departments)}
              </select>
            </label>
            <label class="field">
              <span>Branch name</span>
              <input type="text" name="name" placeholder="CSE Core" required />
            </label>
            <label class="field">
              <span>Code</span>
              <input type="text" name="code" placeholder="CSE-CORE" required />
            </label>
            <button class="button button-primary" type="submit">Add Branch</button>
          </form>
        `
      })}
    </section>
    <section class="section-grid two-column">
      ${panel({
        title: "Subject management",
        body: `
          <form id="subjectCreateForm" class="form-grid">
            <label class="field">
              <span>Department</span>
              <select name="departmentId" id="subjectDepartment" required>
                <option value="">Select department</option>
                ${buildDepartmentOptionsFromData(overview.departments)}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="subjectBranch" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field">
              <span>Subject name</span>
              <input type="text" name="name" placeholder="Database Systems" required />
            </label>
            <label class="field">
              <span>Subject code</span>
              <input type="text" name="code" placeholder="CSE501" required />
            </label>
            <label class="field">
              <span>Semester</span>
              <select name="semester" required>
                <option value="">Select semester</option>
                ${buildSemesterOptions()}
              </select>
            </label>
            <label class="field">
              <span>Credits</span>
              <input type="number" name="credits" min="1" placeholder="4" required />
            </label>
            <label class="field">
              <span>Faculty</span>
              <select name="facultyId">
                <option value="">Assign later</option>
                ${facultyOptions}
              </select>
            </label>
            <button class="button button-primary" type="submit">Add Subject</button>
          </form>
        `
      })}
      ${panel({
        title: "Faculty assignment",
        body: `
          <form id="facultyAssignmentForm" class="form-grid">
            <label class="field">
              <span>Faculty</span>
              <select name="facultyId" required>
                <option value="">Select faculty</option>
                ${facultyOptions}
              </select>
            </label>
            <label class="field">
              <span>Department</span>
              <select name="departmentId" id="facultyDepartment" required>
                <option value="">Select department</option>
                ${buildDepartmentOptionsFromData(overview.departments)}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="facultyBranch" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field">
              <span>Salary status</span>
              <select name="salaryStatus" required>
                <option value="pending">Pending</option>
                <option value="credited">Salary credited</option>
              </select>
            </label>
            <button class="button button-primary" type="submit">Update Faculty</button>
          </form>
        `
      })}
    </section>
    ${createTableCard({
      title: "Departments and branches",
      headers: ["Department", "Code", "Branches"],
      rows: overview.departments.map((department) => {
        const relatedBranches = overview.branches.filter((branch) => String(branch.department_id) === String(department.id));
        return `
          <tr>
            <td>${escapeHtml(department.name)}</td>
            <td>${escapeHtml(department.code)}</td>
            <td>${relatedBranches.map((branch) => `<div class="muted-text">${escapeHtml(branch.name)}</div>`).join("") || "No branches"}</td>
          </tr>
        `;
      }),
      emptyMessage: "No departments configured yet."
    })}
    ${createTableCard({
      title: "Subject allocation",
      headers: ["Subject", "Branch", "Semester", "Faculty", "Assign"],
      rows: overview.subjects.map(
        (subject) => `
          <tr>
            <td>${escapeHtml(subject.name)}<div class="muted-text">${escapeHtml(subject.code)}</div></td>
            <td>${escapeHtml(subject.department_name || "-")}<div class="muted-text">${escapeHtml(subject.branch_name || "-")}</div></td>
            <td>Semester ${escapeHtml(subject.semester)}<div class="muted-text">${escapeHtml(subject.credits)} credits</div></td>
            <td>${escapeHtml(subject.faculty_name || "Not assigned")}</td>
            <td class="inline-actions">
              <select class="compact-select" data-subject-faculty="${subject.id}">
                <option value="">Select faculty</option>
                ${facultyOptions.replace(`value="${subject.faculty_id}"`, `value="${subject.faculty_id}" selected`)}
              </select>
              <button class="button button-ghost button-small" type="button" data-subject-assign="${subject.id}">Save</button>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No subjects configured yet."
    })}
    ${createTableCard({
      title: "Faculty structure and salary",
      headers: ["Faculty", "Department", "Branch", "Salary Status"],
      rows: overview.faculty.map(
        (faculty) => `
          <tr>
            <td>${escapeHtml(faculty.full_name)}<div class="muted-text">${escapeHtml(faculty.employee_code)}</div></td>
            <td>${escapeHtml(faculty.department_name || "-")}</td>
            <td>${escapeHtml(faculty.branch_name || "-")}</td>
            <td>${statusBadge(faculty.salary_status || "pending")}</td>
          </tr>
        `
      ),
      emptyMessage: "No faculty records available."
    })}
  `;

  const syncBranchSelect = (departmentSelect, branchSelect) => {
    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${buildBranchOptionsFromData(overview.branches, departmentSelect.value)}
    `;
  };

  const subjectDepartment = document.getElementById("subjectDepartment");
  const subjectBranch = document.getElementById("subjectBranch");
  const facultyDepartment = document.getElementById("facultyDepartment");
  const facultyBranch = document.getElementById("facultyBranch");

  subjectDepartment?.addEventListener("change", () => syncBranchSelect(subjectDepartment, subjectBranch));
  facultyDepartment?.addEventListener("change", () => syncBranchSelect(facultyDepartment, facultyBranch));

  document.getElementById("departmentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/academics/departments", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Department created successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("branchCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/academics/branches", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Branch created successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("subjectCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/academics/subjects", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Subject created successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("facultyAssignmentForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const facultyId = formData.get("facultyId");

    try {
      await api(`/academics/faculty/${facultyId}/assignment`, {
        method: "PUT",
        body: JSON.stringify({
          departmentId: Number(formData.get("departmentId")),
          branchId: Number(formData.get("branchId")),
          salaryStatus: formData.get("salaryStatus")
        })
      });
      showToast("Faculty assignment updated successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-subject-assign]").forEach((button) => {
    button.addEventListener("click", async () => {
      const subjectId = button.dataset.subjectAssign;
      const select = document.querySelector(`[data-subject-faculty="${subjectId}"]`);

      if (!select?.value) {
        showToast("Select a faculty member first.", "error");
        return;
      }

      try {
        await api(`/academics/subjects/${subjectId}/faculty`, {
          method: "PUT",
          body: JSON.stringify({ facultyId: Number(select.value) })
        });
        showToast("Faculty assigned successfully.");
        await renderAcademicsPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderTimetablePage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role !== "student") {
    const timetablePromise = api("/faculty/timetable");
    const coursesPromise = api("/faculty/courses");
    const facultyPromise = STATE.user.role === "admin" ? api("/faculty") : Promise.resolve({ faculty: [] });
    const [timetableData, coursesData, facultyData] = await Promise.all([
      timetablePromise,
      coursesPromise,
      facultyPromise
    ]);
    const timetable = timetableData.timetable;
    const canSelectFaculty = STATE.user.role === "admin";

    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          title: "Create timetable slot",
          body: `
            <form id="timetableCreateForm" class="form-grid">
              <label class="field">
                <span>Subject</span>
                <select name="courseId" required>
                  <option value="">Select subject</option>
                  ${coursesData.courses
                    .map(
                      (course) =>
                        `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`
                    )
                    .join("")}
                </select>
              </label>
              ${
                canSelectFaculty
                  ? `
                    <label class="field">
                      <span>Faculty</span>
                      <select name="facultyId" required>
                        <option value="">Select faculty</option>
                        ${facultyData.faculty
                          .map(
                            (faculty) =>
                              `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} - ${escapeHtml(faculty.employee_code)}</option>`
                          )
                          .join("")}
                      </select>
                    </label>
                  `
                  : ""
              }
              <label class="field">
                <span>Day</span>
                <select name="dayOfWeek" required>
                  <option value="">Select day</option>
                  ${WEEK_DAYS.map((day) => `<option value="${day}">${escapeHtml(day)}</option>`).join("")}
                </select>
              </label>
              <label class="field">
                <span>Classroom</span>
                <input type="text" name="roomNo" placeholder="Room 204" required />
              </label>
              <label class="field">
                <span>Start time</span>
                <input type="time" name="startTime" required />
              </label>
              <label class="field">
                <span>End time</span>
                <input type="time" name="endTime" required />
              </label>
              <button class="button button-primary" type="submit">${canSelectFaculty ? "Create Slot" : "Add My Slot"}</button>
            </form>
          `
        })}
        ${panel({
          title: "Timetable overview",
          body: createStatsGrid(
            canSelectFaculty
              ? [
                  { label: "Slots", value: String(timetable.length), icon: "timetable" },
                  { label: "Working Days", value: String(new Set(timetable.map((item) => item.day_of_week)).size), icon: "attendance" },
                  { label: "Faculty", value: String(new Set(timetable.map((item) => item.faculty_name).filter(Boolean)).size), icon: "faculty" },
                  { label: "Subjects", value: String(new Set(timetable.map((item) => item.course_code)).size), icon: "results" }
                ]
              : [
                  { label: "Slots", value: String(timetable.length), icon: "timetable" },
                  { label: "Working Days", value: String(new Set(timetable.map((item) => item.day_of_week)).size), icon: "attendance" },
                  { label: "Rooms", value: String(new Set(timetable.map((item) => item.room_no).filter(Boolean)).size), icon: "dashboard" },
                  { label: "Subjects", value: String(new Set(timetable.map((item) => item.course_code)).size), icon: "results" }
                ]
          )
        })}
      </section>
      ${buildTimetableBoard(timetable)}
    `;

    bindTimetableAdminActions();

    document.getElementById("timetableCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/faculty/timetable", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        showToast(canSelectFaculty ? "Timetable slot created successfully." : "Your timetable slot was added successfully.");
        await renderTimetablePage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
    return;
  }

  const data = await fetchCurrentTimetableData();
  const timetable = data.timetable;

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Classes", value: String(timetable.length), icon: "timetable" },
      { label: "Working Days", value: String(new Set(timetable.map((item) => item.day_of_week)).size), icon: "attendance" },
      { label: "Rooms", value: String(new Set(timetable.map((item) => item.room_no).filter(Boolean)).size), icon: "dashboard" },
      { label: "Subjects", value: String(new Set(timetable.map((item) => item.course_code)).size), icon: "results" }
    ])}
    ${buildTimetableBoard(timetable)}
  `;

  bindTimetableAdminActions();
}

async function renderFeesPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const feesData = await api("/students/me/fees");
    const current = feesData.fees[0];

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Status", value: current ? current.status.toUpperCase() : "N/A", icon: "fees" },
        { label: "Total", value: current ? formatCurrency(current.total_amount) : formatCurrency(0), icon: "dashboard" },
        { label: "Paid", value: current ? formatCurrency(current.paid_amount) : formatCurrency(0), icon: "results" },
        { label: "Due", value: current ? formatCurrency(current.balance) : formatCurrency(0), icon: "attendance" }
      ])}
      ${createTableCard({
        title: "Fee status",
        headers: ["Semester", "Total", "Paid", "Balance", "Status", "Due Date"],
        rows: feesData.fees.map(
          (fee) => `
            <tr>
              <td>Semester ${escapeHtml(fee.semester)}</td>
              <td>${formatCurrency(fee.total_amount)}</td>
              <td>${formatCurrency(fee.paid_amount)}</td>
              <td>${formatCurrency(fee.balance)}</td>
              <td>${statusBadge(fee.status)}</td>
              <td>${formatDate(fee.due_date)}</td>
            </tr>
          `
        ),
        emptyMessage: "No fee records found."
      })}
    `;
    return;
  }

  const [feesData, studentsData] = await Promise.all([api("/students/fees"), api("/students")]);
  const feeRecords = feesData.fees;

  const renderFeeTable = (records) =>
    createTableCard({
      title: "Fee ledger",
      headers: ["Student", "Semester", "Total", "Paid", "Due", "Status", "Due Date", "Actions"],
      rows: records.map(
        (fee) => `
          <tr>
            <td>${escapeHtml(fee.full_name)}<div class="muted-text">${escapeHtml(fee.roll_number)}</div></td>
            <td>Semester ${escapeHtml(fee.semester)}</td>
            <td>${formatCurrency(fee.total_amount)}</td>
            <td>${formatCurrency(fee.paid_amount)}</td>
            <td>${formatCurrency(fee.balance)}</td>
            <td>${statusBadge(fee.status)}</td>
            <td>${formatDate(fee.due_date)}</td>
            <td><button class="button button-ghost button-small" type="button" data-fee-edit="${fee.id}">Edit</button></td>
          </tr>
        `
      ),
      emptyMessage: "No fee records available."
    });

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Update fee status",
        body: `
          <form id="feeForm" class="form-grid">
            <input type="hidden" name="feeId" value="" />
            <label class="field">
              <span>Student</span>
              <select name="studentId" required>
                <option value="">Select student</option>
                ${studentsData.students
                  .map(
                    (student) =>
                      `<option value="${student.id}">${escapeHtml(student.full_name)} - ${escapeHtml(student.roll_number)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>Semester</span>
              <select name="semester" required>
                <option value="">Select semester</option>
                ${buildSemesterOptions()}
              </select>
            </label>
            <label class="field">
              <span>Total amount</span>
              <input type="number" name="totalAmount" min="0" step="0.01" placeholder="85000" required />
            </label>
            <label class="field">
              <span>Paid amount</span>
              <input type="number" name="paidAmount" min="0" step="0.01" placeholder="0" />
            </label>
            <label class="field">
              <span>Due amount</span>
              <input id="feeDuePreview" type="text" value="${escapeHtml(formatCurrency(0))}" readonly />
            </label>
            <label class="field">
              <span>Due date</span>
              <input type="date" name="dueDate" required />
            </label>
            <div class="inline-actions full-width">
              <button class="button button-primary" id="feeSubmitButton" type="submit">Save Fee Record</button>
              <button class="button button-secondary" id="feeResetButton" type="button">Clear</button>
            </div>
          </form>
        `
      })}
      ${panel({
        title: "Fee overview",
        body: createStatsGrid([
          { label: "Records", value: String(feeRecords.length), icon: "fees" },
          { label: "Collected", value: formatCurrency(feeRecords.reduce((sum, fee) => sum + Number(fee.paid_amount), 0)), icon: "results" },
          { label: "Due", value: formatCurrency(feeRecords.reduce((sum, fee) => sum + Number(fee.balance), 0)), icon: "attendance" },
          { label: "Paid in Full", value: String(feeRecords.filter((fee) => fee.status === "paid").length), icon: "dashboard" }
        ])
      })}
    </section>
    <div id="feeLedger">${renderFeeTable(feeRecords)}</div>
  `;

  const feeForm = document.getElementById("feeForm");
  const feeIdField = feeForm?.querySelector('[name="feeId"]');
  const studentField = feeForm?.querySelector('[name="studentId"]');
  const semesterField = feeForm?.querySelector('[name="semester"]');
  const totalField = feeForm?.querySelector('[name="totalAmount"]');
  const paidField = feeForm?.querySelector('[name="paidAmount"]');
  const dueField = document.getElementById("feeDuePreview");
  const dueDateField = feeForm?.querySelector('[name="dueDate"]');
  const submitButton = document.getElementById("feeSubmitButton");

  const syncDuePreview = () => {
    const total = Number(totalField?.value || 0);
    const paid = Number(paidField?.value || 0);
    dueField.value = formatCurrency(Math.max(total - paid, 0));
  };

  const resetFeeForm = () => {
    feeForm?.reset();
    if (feeIdField) feeIdField.value = "";
    if (studentField) studentField.disabled = false;
    if (submitButton) submitButton.textContent = "Save Fee Record";
    syncDuePreview();
  };

  totalField?.addEventListener("input", syncDuePreview);
  paidField?.addEventListener("input", syncDuePreview);
  document.getElementById("feeResetButton")?.addEventListener("click", resetFeeForm);

  document.querySelectorAll("[data-fee-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = feeRecords.find((item) => String(item.id) === button.dataset.feeEdit);
      if (!record || !feeForm) return;

      feeIdField.value = record.id;
      studentField.value = record.student_id;
      studentField.disabled = true;
      semesterField.value = record.semester;
      totalField.value = record.total_amount;
      paidField.value = record.paid_amount;
      dueDateField.value = record.due_date;
      submitButton.textContent = "Update Fee Record";
      syncDuePreview();
      feeForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  feeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const feeId = feeIdField.value;
    const payload = {
      semester: Number(formData.get("semester")),
      totalAmount: Number(formData.get("totalAmount")),
      paidAmount: Number(formData.get("paidAmount") || 0),
      dueDate: formData.get("dueDate")
    };

    if (!feeId) {
      payload.studentId = Number(formData.get("studentId"));
    }

    try {
      await api(feeId ? `/students/fees/${feeId}` : "/students/fees", {
        method: feeId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      showToast(feeId ? "Fee record updated successfully." : "Fee record saved successfully.");
      await renderFeesPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  syncDuePreview();
}

async function renderNoticesPage() {
  const pageContent = document.getElementById("pageContent");
  const noticesData = await api("/notices");
  const notices = noticesData.notices;
  const isAdmin = STATE.user.role === "admin";
  const canPost = ["admin", "faculty"].includes(STATE.user.role);

  pageContent.innerHTML = `
    ${
      canPost
        ? `<section class="section-grid two-column">
            ${panel({
              title: isAdmin ? "Manage notices" : "Share notice",
              body: `
                <form id="noticeForm" class="form-grid">
                  <input type="hidden" name="noticeId" value="" />
                  <label class="field full-width">
                    <span>Notice title</span>
                    <input type="text" name="title" placeholder="Notice title" required />
                  </label>
                  ${
                    isAdmin
                      ? `<label class="field">
                          <span>Audience</span>
                          <select name="audience" required>
                            <option value="all">All</option>
                            <option value="students">Students</option>
                            <option value="faculty">Faculty</option>
                            <option value="admins">Admins</option>
                          </select>
                        </label>`
                      : ""
                  }
                  <label class="field full-width">
                    <span>Content</span>
                    <textarea name="content" placeholder="Write the notice details" required></textarea>
                  </label>
                  <div class="inline-actions full-width">
                    <button class="button button-primary" id="noticeSubmitButton" type="submit">${
                      isAdmin ? "Publish Notice" : "Share Notice"
                    }</button>
                    ${
                      isAdmin
                        ? `<button class="button button-secondary" id="noticeResetButton" type="button">Clear</button>`
                        : ""
                    }
                  </div>
                </form>
              `
            })}
            ${panel({
              title: "Notice overview",
              body: createStatsGrid([
                { label: "Visible", value: String(notices.length), icon: "notices" },
                { label: "For Students", value: String(notices.filter((item) => item.audience === "students").length), icon: "students" },
                { label: "For Faculty", value: String(notices.filter((item) => item.audience === "faculty").length), icon: "faculty" },
                { label: "For All", value: String(notices.filter((item) => item.audience === "all").length), icon: "dashboard" }
              ])
            })}
          </section>`
        : createStatsGrid([
            { label: "Visible", value: String(notices.length), icon: "notices" },
            { label: "Faculty", value: String(notices.filter((item) => item.posted_by_role === "faculty").length), icon: "faculty" },
            { label: "Admin", value: String(notices.filter((item) => item.posted_by_role === "admin").length), icon: "dashboard" },
            { label: "This Week", value: String(notices.filter((item) => Date.now() - new Date(item.posted_at).getTime() < 604800000).length), icon: "attendance" }
          ])
    }
    <section class="notice-list">
      ${
        notices.length
          ? notices
              .map(
                (notice) => `
                  <article class="notice-card">
                    <div class="split-row">
                      <div>
                        <div class="meta-row">
                          ${statusBadge(notice.audience)}
                          ${tag(getRoleLabel(notice.posted_by_role || "admin"))}
                        </div>
                        <h3>${escapeHtml(notice.title)}</h3>
                      </div>
                      <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                    </div>
                    <p>${escapeHtml(notice.content)}</p>
                    <div class="split-row notice-footer">
                      <span class="muted-text">${escapeHtml(notice.posted_by_name || "System")}</span>
                      ${
                        isAdmin
                          ? `<div class="inline-actions">
                              <button class="button button-ghost button-small" type="button" data-notice-edit="${notice.id}">Edit</button>
                              <button class="button button-danger button-small" type="button" data-notice-delete="${notice.id}">Delete</button>
                            </div>`
                          : ""
                      }
                    </div>
                  </article>
                `
              )
              .join("")
          : emptyState("No notices have been posted yet.")
      }
    </section>
  `;

  const noticeForm = document.getElementById("noticeForm");
  const noticeIdField = noticeForm?.querySelector('[name="noticeId"]');
  const titleField = noticeForm?.querySelector('[name="title"]');
  const audienceField = noticeForm?.querySelector('[name="audience"]');
  const contentField = noticeForm?.querySelector('[name="content"]');
  const submitButton = document.getElementById("noticeSubmitButton");

  const resetNoticeForm = () => {
    noticeForm?.reset();
    if (noticeIdField) noticeIdField.value = "";
    if (submitButton) submitButton.textContent = isAdmin ? "Publish Notice" : "Share Notice";
  };

  document.getElementById("noticeResetButton")?.addEventListener("click", resetNoticeForm);

  document.querySelectorAll("[data-notice-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const notice = notices.find((item) => String(item.id) === button.dataset.noticeEdit);
      if (!notice || !noticeForm) return;

      noticeIdField.value = notice.id;
      titleField.value = notice.title;
      if (audienceField) audienceField.value = notice.audience;
      contentField.value = notice.content;
      submitButton.textContent = "Update Notice";
      noticeForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-notice-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const noticeId = button.dataset.noticeDelete;
      if (!window.confirm("Delete this notice?")) return;

      try {
        await api(`/notices/${noticeId}`, { method: "DELETE" });
        showToast("Notice deleted successfully.");
        await renderNoticesPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  noticeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const noticeId = formData.get("noticeId");
    const payload = {
      title: formData.get("title"),
      content: formData.get("content")
    };

    if (isAdmin) {
      payload.audience = formData.get("audience");
    }

    try {
      await api(noticeId ? `/notices/${noticeId}` : "/notices", {
        method: noticeId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      showToast(noticeId ? "Notice updated successfully." : "Notice published successfully.");
      await renderNoticesPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderMaterialsPage() {
  const pageContent = document.getElementById("pageContent");
  const isStudent = STATE.user.role === "student";
  const [materialsData, coursesData] = await Promise.all([
    api("/materials"),
    api(isStudent ? "/students/me/courses" : "/faculty/courses")
  ]);
  const materials = materialsData.materials;
  const subjects = coursesData.courses;

  const renderLibrary = (filterValue) => {
    const filteredMaterials =
      filterValue && filterValue !== "all"
        ? materials.filter((material) => String(material.course_id) === String(filterValue))
        : materials;

    return createTableCard({
      title: "Material library",
      headers: isStudent
        ? ["Title", "Subject", "Faculty", "Uploaded", "Download"]
        : ["Title", "Subject", "Uploaded", "Download"],
      rows: filteredMaterials.map(
        (material) => `
          <tr>
            <td><strong>${escapeHtml(material.title)}</strong><div class="muted-text">${escapeHtml(material.description)}</div></td>
            <td>${escapeHtml(material.course_code)}<div class="muted-text">${escapeHtml(material.course_name)}</div></td>
            ${
              isStudent
                ? `<td>${escapeHtml(material.faculty_name || "Faculty")}</td>`
                : ""
            }
            <td>${formatDateTime(material.uploaded_at)}</td>
            <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(material.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
          </tr>
        `
      ),
      emptyMessage: "No materials are available for the selected subject."
    });
  };

  const subjectOptions = `
    <option value="all">All subjects</option>
    ${subjects
      .map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`)
      .join("")}
  `;

  if (isStudent) {
    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          title: "Browse materials",
          body: `
            <label class="field">
              <span>Subject</span>
              <select id="materialSubjectFilter">${subjectOptions}</select>
            </label>
          `
        })}
        ${panel({
          title: "Library overview",
          body: createStatsGrid([
            { label: "Files", value: String(materials.length), icon: "materials" },
            { label: "Subjects", value: String(new Set(materials.map((item) => item.course_id)).size), icon: "timetable" },
            { label: "Faculty", value: String(new Set(materials.map((item) => item.faculty_name).filter(Boolean)).size), icon: "faculty" },
            { label: "Latest", value: materials[0] ? formatDate(materials[0].uploaded_at) : "-", icon: "dashboard" }
          ])
        })}
      </section>
      <div id="materialsLibrary">${renderLibrary("all")}</div>
    `;
  } else {
    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          title: "Upload material",
          body: `
            <form id="materialCreateForm" class="form-grid">
              <label class="field">
                <span>Subject</span>
                <select name="courseId" required>
                  <option value="">Select subject</option>
                  ${subjects
                    .map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`)
                    .join("")}
                </select>
              </label>
              <label class="field full-width">
                <span>Title</span>
                <input type="text" name="title" placeholder="Material title" required />
              </label>
              <label class="field full-width">
                <span>Description</span>
                <textarea name="description" placeholder="Short description" required></textarea>
              </label>
              <label class="field full-width">
                <span>File</span>
                <input type="file" name="file" required />
              </label>
              <button class="button button-primary" type="submit">Upload Material</button>
            </form>
          `
        })}
        ${panel({
          title: "Resource overview",
          body: `
            <div class="stack-form">
              <label class="field">
                <span>Filter by subject</span>
                <select id="materialSubjectFilter">${subjectOptions}</select>
              </label>
              ${createStatsGrid([
                { label: "Files", value: String(materials.length), icon: "materials" },
                { label: "Subjects", value: String(subjects.length), icon: "timetable" },
                { label: "Uploads", value: String(materials.filter((item) => item.downloadUrl).length), icon: "dashboard" },
                { label: "Latest", value: materials[0] ? formatDate(materials[0].uploaded_at) : "-", icon: "attendance" }
              ])}
            </div>
          `
        })}
      </section>
      <div id="materialsLibrary">${renderLibrary("all")}</div>
    `;

    document.getElementById("materialCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/materials", {
          method: "POST",
          body: formData
        });
        showToast("Material uploaded successfully.");
        await renderMaterialsPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  document.getElementById("materialSubjectFilter")?.addEventListener("change", (event) => {
    document.getElementById("materialsLibrary").innerHTML = renderLibrary(event.currentTarget.value);
  });
}

async function renderStudentsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "faculty") {
    const { students } = await api("/students/assigned");

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Students", value: String(students.length), icon: "students" },
        { label: "Branches", value: String(new Set(students.map((item) => item.branch_name || "General")).size), icon: "faculty" },
        { label: "Semesters", value: String(new Set(students.map((item) => item.semester)).size), icon: "timetable" },
        { label: "Sections", value: String(new Set(students.map((item) => item.section)).size), icon: "dashboard" }
      ])}
      ${createTableCard({
        title: "Students under your subjects",
        headers: ["Student", "Roll Number", "Branch", "Semester", "Contact"],
        rows: students.map(
          (student) => `
            <tr>
              <td>${escapeHtml(student.full_name)}</td>
              <td>${escapeHtml(student.roll_number)}</td>
              <td>${escapeHtml(student.department_name)}<div class="muted-text">${escapeHtml(student.branch_name || "-")}</div></td>
              <td>Semester ${escapeHtml(student.semester)}<div class="muted-text">Section ${escapeHtml(student.section)}</div></td>
              <td>${escapeHtml(student.email)}</td>
            </tr>
          `
        ),
        emptyMessage: "No students are mapped to your subjects yet."
      })}
    `;
    return;
  }

  const [studentsData, facultyData, academicData] = await Promise.all([
    api("/students"),
    api("/faculty"),
    api("/academics/overview")
  ]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Create student account",
        body: `
          <form id="studentCreateForm" class="form-grid">
            <label class="field"><span>Full name</span><input type="text" name="fullName" placeholder="Student full name" required /></label>
            <label class="field"><span>Email</span><input type="email" name="email" placeholder="student@college.edu" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" placeholder="At least 8 characters" required /></label>
            <label class="field">
              <span>Department</span>
              <select name="departmentCode" id="studentDepartment" required>
                <option value="">Select department</option>
                ${academicData.departments
                  .map(
                    (department) =>
                      `<option value="${department.code}" data-department-id="${department.id}">${escapeHtml(department.name)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="studentBranch" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field"><span>Semester</span><select name="semester" required>${buildSemesterOptions("1")}</select></label>
            <label class="field"><span>Section</span><input type="text" name="section" placeholder="A" required /></label>
            <label class="field"><span>Roll number</span><input type="text" name="rollNumber" placeholder="CSE2026-010" required /></label>
            <label class="field"><span>Registration number</span><input type="text" name="registrationNumber" placeholder="REG2026-010" required /></label>
            <label class="field full-width">
              <span>Mentor</span>
              <select name="advisorFacultyId">
                <option value="">Assign later</option>
                ${facultyData.faculty
                  .map(
                    (faculty) =>
                      `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} - ${escapeHtml(faculty.branch_name || faculty.department_name)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <button class="button button-primary" type="submit">Create Student</button>
          </form>
        `
      })}
      ${panel({
        title: "Student structure",
        body: createStatsGrid([
          { label: "Students", value: String(studentsData.students.length), icon: "students" },
          { label: "Departments", value: String(new Set(studentsData.students.map((item) => item.department_name)).size), icon: "faculty" },
          { label: "Branches", value: String(new Set(studentsData.students.map((item) => item.branch_name || "General")).size), icon: "timetable" },
          { label: "Mentors", value: String(new Set(studentsData.students.map((item) => item.advisor_name || "Unassigned")).size), icon: "attendance" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Student directory",
      headers: ["Student", "Roll Number", "Registration", "Structure", "Mentor", "Actions"],
      rows: studentsData.students.map(
        (student) => `
          <tr>
            <td>${escapeHtml(student.full_name)}<div class="muted-text">${escapeHtml(student.email)}</div></td>
            <td>${escapeHtml(student.roll_number)}</td>
            <td>${escapeHtml(student.registration_number)}</td>
            <td>${escapeHtml(student.department_name)}<div class="muted-text">${escapeHtml(student.branch_name || "-")} - Semester ${escapeHtml(student.semester)}</div></td>
            <td>${escapeHtml(student.advisor_name || "Not assigned")}</td>
            <td>
              <div class="inline-actions">
                <select class="compact-select" data-student-faculty="${student.id}">
                  <option value="">Select mentor</option>
                  ${buildFacultyAssignmentOptions(facultyData.faculty, student.faculty_id)}
                </select>
                <button class="button button-ghost button-small" type="button" data-student-assign="${student.id}">Save</button>
                <button
                  class="icon-action icon-action-danger"
                  type="button"
                  data-delete-student="${student.id}"
                  aria-label="Delete student"
                  title="Delete student"
                >
                  ${icon("trash")}
                </button>
              </div>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No students are available yet."
    })}
  `;

  const departmentSelect = document.getElementById("studentDepartment");
  const branchSelect = document.getElementById("studentBranch");

  const syncBranches = () => {
    const selectedDepartmentId = departmentSelect.selectedOptions[0]?.dataset.departmentId || "";
    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${buildBranchOptionsFromData(academicData.branches, selectedDepartmentId)}
    `;
  };

  departmentSelect?.addEventListener("change", syncBranches);

  document.getElementById("studentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/students", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Student created successfully.");
      await renderStudentsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-student-assign]").forEach((button) => {
    button.addEventListener("click", async () => {
      const studentId = button.dataset.studentAssign;
      const select = document.querySelector(`[data-student-faculty="${studentId}"]`);

      if (!select?.value) {
        showToast("Select a faculty member first.", "error");
        return;
      }

      button.disabled = true;

      try {
        await api("/assign-student", {
          method: "POST",
          body: JSON.stringify({
            student_id: Number(studentId),
            faculty_id: Number(select.value)
          })
        });
        showToast("Student assigned successfully.");
        await renderStudentsPage();
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll("[data-delete-student]").forEach((button) => {
    button.addEventListener("click", async () => {
      const studentId = button.dataset.deleteStudent;
      if (!studentId) return;

      const confirmed = window.confirm("Are you sure you want to delete this student? This action cannot be undone.");
      if (!confirmed) return;

      button.disabled = true;

      try {
        await api(`/students/${studentId}`, { method: "DELETE" });
        button.closest("tr")?.remove();
        showToast("Student deleted successfully");
        await renderStudentsPage();
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}

// ===========================================================================
// Placement Preparation
// ===========================================================================
async function renderPlacementPage() {
  if (STATE.user.role === "student") {
    await renderPlacementHome();
  } else {
    await renderPlacementAdmin();
  }
}

function buildPlacementFeedbackPanel(feedback) {
  const weak = feedback.weakAreas.length
    ? `
        <div class="feedback-block">
          <h4 style="margin: 0 0 10px;">Focus areas to improve</h4>
          <ul class="feedback-list">
            ${feedback.weakAreas
              .map(
                (area) =>
                  `<li><strong>${escapeHtml(area.topic)} — ${area.accuracy}%</strong><br>${escapeHtml(area.tip)}</li>`
              )
              .join("")}
          </ul>
        </div>
      `
    : `<p class="muted-text">No weak areas detected. Excellent work — keep practising to stay sharp.</p>`;

  const strong = feedback.strengths.length
    ? `
        <div class="feedback-block" style="margin-top: 18px;">
          <h4 style="margin: 0 0 10px;">Your strengths</h4>
          <ul class="feedback-list">
            ${feedback.strengths
              .map((area) => `<li><strong>${escapeHtml(area.topic)} — ${area.accuracy}%</strong></li>`)
              .join("")}
          </ul>
        </div>
      `
    : "";

  return panel({ eyebrow: "Knowledge base", title: "Personalized feedback", body: weak + strong });
}

async function renderPlacementHome() {
  const pageContent = document.getElementById("pageContent");
  const overview = await api("/placement/overview");
  const totalAvailable = overview.categories.reduce((sum, item) => sum + item.questionCount, 0);
  const feedback = overview.feedback;
  const hasAttempts = overview.summary.answered > 0;

  const categoryOptions = ['<option value="">All categories</option>']
    .concat(
      overview.categories.map(
        (item) =>
          `<option value="${escapeHtml(item.category)}">${escapeHtml(item.category)} (${item.questionCount})</option>`
      )
    )
    .join("");

  const difficultyOptions = ['<option value="">All levels</option>']
    .concat(
      overview.difficulties.map(
        (level) => `<option value="${level}">${level.charAt(0).toUpperCase() + level.slice(1)}</option>`
      )
    )
    .join("");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Readiness", value: hasAttempts ? `${feedback.readiness.score}%` : "—", icon: "placement" },
      { label: "Questions answered", value: String(overview.summary.answered), icon: "assignments" },
      { label: "Accuracy", value: hasAttempts ? `${overview.summary.accuracy}%` : "—", icon: "results" },
      { label: "Question bank", value: String(totalAvailable), icon: "materials" }
    ])}
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Practice",
        title: "Start a practice quiz",
        body: `
          <form id="placementQuizForm" class="form-grid">
            <label class="field"><span>Category</span><select name="category">${categoryOptions}</select></label>
            <label class="field"><span>Difficulty</span><select name="difficulty">${difficultyOptions}</select></label>
            <label class="field"><span>Number of questions</span><select name="limit"><option value="5">5 questions</option><option value="10">10 questions</option><option value="15">15 questions</option></select></label>
            <button class="button button-primary full-width" type="submit">Start Quiz</button>
          </form>
          <p class="muted-text" style="margin-top: 12px;">Every wrong answer comes with a full explanation, and you'll get topic-by-topic feedback after each quiz.</p>
        `
      })}
      ${panel({
        eyebrow: "Readiness",
        title: feedback.readiness.label,
        body: hasAttempts
          ? `
              <p class="muted-text">Overall accuracy across ${overview.summary.answered} answered question(s).</p>
              ${
                feedback.recommendations.length
                  ? `<h4 style="margin: 14px 0 8px;">Recommended focus</h4>
                     <ul class="reco-list">${feedback.recommendations
                       .map((item) => `<li>${escapeHtml(item)}</li>`)
                       .join("")}</ul>`
                  : `<p>Great work — no weak topics detected yet. Keep going to stay placement-ready.</p>`
              }
            `
          : `<p>Take your first quiz to unlock a personalized readiness score and topic-by-topic feedback.</p>`
      })}
    </section>
    ${hasAttempts ? buildPlacementFeedbackPanel(feedback) : ""}
    ${
      hasAttempts
        ? createTableCard({
            title: "Topic-wise performance",
            subtitle: "Where you stand across every topic you have attempted",
            headers: ["Topic", "Answered", "Correct", "Accuracy"],
            rows: overview.topicBreakdown.map(
              (item) => `
                <tr>
                  <td>${escapeHtml(item.topic)}</td>
                  <td>${item.answered}</td>
                  <td>${item.correct}</td>
                  <td>${statusBadge(item.accuracy >= 80 ? "Strong" : item.accuracy >= 60 ? "Fair" : "Weak")} ${item.accuracy}%</td>
                </tr>
              `
            ),
            emptyMessage: "No attempts yet."
          })
        : ""
    }
  `;

  document.getElementById("placementQuizForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await startPlacementQuiz({
      category: formData.get("category") || "",
      difficulty: formData.get("difficulty") || "",
      limit: formData.get("limit") || "5"
    });
  });
}

async function startPlacementQuiz(filters) {
  const pageContent = document.getElementById("pageContent");
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.limit) params.set("limit", filters.limit);

  let data;
  try {
    data = await api(`/placement/quiz?${params.toString()}`);
  } catch (error) {
    showToast(error.message, "error");
    return;
  }

  if (!data.questions.length) {
    pageContent.innerHTML = panel({
      title: "No questions found",
      body: `<p class="muted-text">No questions match those filters yet. Try a different category or difficulty level.</p>
             <button class="button button-secondary" id="placementBack" type="button">Back to Overview</button>`
    });
    document.getElementById("placementBack")?.addEventListener("click", renderPlacementPage);
    return;
  }

  renderPlacementQuiz(data.questions);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPlacementQuiz(questions) {
  const pageContent = document.getElementById("pageContent");

  pageContent.innerHTML = panel({
    eyebrow: "Practice quiz",
    title: `Answer all ${questions.length} question(s)`,
    actions: `<button class="button button-secondary button-small" id="placementCancel" type="button">Cancel</button>`,
    body: `
      <form id="placementQuiz">
        ${questions
          .map(
            (question, index) => `
              <article class="quiz-question" data-question-id="${question.id}">
                <div class="quiz-question-head">
                  <span class="quiz-index">Q${index + 1}</span>
                  <div class="meta-row">${tag(question.category)} ${tag(question.topic)} ${tag(question.difficulty)}</div>
                </div>
                <p class="quiz-text">${escapeHtml(question.question)}</p>
                <div class="quiz-options">
                  ${["A", "B", "C", "D"]
                    .map(
                      (letter) => `
                        <label class="quiz-option">
                          <input type="radio" name="q-${question.id}" value="${letter}" />
                          <span class="opt-key">${letter}</span>
                          <span class="opt-text">${escapeHtml(question.options[letter])}</span>
                        </label>
                      `
                    )
                    .join("")}
                </div>
              </article>
            `
          )
          .join("")}
        <button class="button button-primary full-width" type="submit">Submit Answers</button>
      </form>
    `
  });

  document.getElementById("placementCancel")?.addEventListener("click", renderPlacementPage);

  document.getElementById("placementQuiz")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const answers = [];
    let unanswered = 0;

    form.querySelectorAll(".quiz-question").forEach((block) => {
      block.classList.remove("needs-answer");
      const checked = block.querySelector("input[type=radio]:checked");
      if (!checked) {
        unanswered += 1;
        block.classList.add("needs-answer");
      } else {
        answers.push({ questionId: Number(block.dataset.questionId), selectedOption: checked.value });
      }
    });

    if (unanswered > 0) {
      showToast(`Please answer all questions — ${unanswered} left.`, "error");
      return;
    }

    const submitButton = form.querySelector("button[type=submit]");
    submitButton.disabled = true;

    try {
      const result = await api("/placement/submit", {
        method: "POST",
        body: JSON.stringify({ answers })
      });
      renderPlacementResults(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      submitButton.disabled = false;
      showToast(error.message, "error");
    }
  });
}

function renderPlacementResults(result) {
  const pageContent = document.getElementById("pageContent");
  const { score, results, feedback } = result;

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Score", value: `${score.correct}/${score.total}`, icon: "results" },
      { label: "Accuracy", value: `${score.accuracy}%`, icon: "placement" },
      { label: "Correct", value: String(score.correct), icon: "assignments" },
      { label: "To review", value: String(score.incorrect), icon: "notices" }
    ])}
    ${buildPlacementFeedbackPanel(feedback)}
    ${panel({
      eyebrow: "Review",
      title: "Answer review with explanations",
      actions: `
        <div class="inline-actions">
          <button class="button button-secondary button-small" id="placementNew" type="button">New Quiz</button>
          <button class="button button-primary button-small" id="placementHome" type="button">Back to Overview</button>
        </div>
      `,
      body: results
        .map(
          (item) => `
            <article class="result-card ${item.isCorrect ? "correct" : "incorrect"}">
              <div class="quiz-question-head">
                <span class="result-icon ${item.isCorrect ? "correct" : "incorrect"}">${item.isCorrect ? "✓" : "✗"}</span>
                <div class="meta-row">${tag(item.topic)} ${tag(item.difficulty)} ${statusBadge(item.isCorrect ? "Correct" : "Incorrect")}</div>
              </div>
              <p class="quiz-text">${escapeHtml(item.question)}</p>
              <ul class="result-options">
                <li class="opt ${item.isCorrect ? "right" : "wrong"}">Your answer: ${item.yourOption}. ${escapeHtml(item.yourAnswer)}</li>
                ${
                  item.isCorrect
                    ? ""
                    : `<li class="opt right">Correct answer: ${item.correctOption}. ${escapeHtml(item.correctAnswer)}</li>`
                }
              </ul>
              <div class="explanation"><strong>Why this answer?</strong>${escapeHtml(item.explanation)}</div>
            </article>
          `
        )
        .join("")
    })}
  `;

  document.getElementById("placementHome")?.addEventListener("click", renderPlacementPage);
  document.getElementById("placementNew")?.addEventListener("click", renderPlacementPage);
}

async function renderPlacementAdmin() {
  const pageContent = document.getElementById("pageContent");
  const [analytics, bank] = await Promise.all([api("/placement/analytics"), api("/placement/questions")]);
  const canDelete = STATE.user.role === "admin";

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Questions", value: String(analytics.totalQuestions), icon: "materials" },
      { label: "Total attempts", value: String(analytics.totalAttempts), icon: "assignments" },
      { label: "Active students", value: String(analytics.activeStudents), icon: "students" },
      { label: "Cohort accuracy", value: analytics.totalAttempts ? `${analytics.overallAccuracy}%` : "—", icon: "results" }
    ])}
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Question bank",
        title: "Add a placement question",
        body: `
          <form id="placementAddForm" class="form-grid">
            <label class="field"><span>Category</span><input name="category" required placeholder="e.g. Quantitative Aptitude" /></label>
            <label class="field"><span>Topic</span><input name="topic" required placeholder="e.g. Percentages" /></label>
            <label class="field"><span>Difficulty</span><select name="difficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label class="field"><span>Correct option</span><select name="correctOption"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label>
            <label class="field full-width"><span>Question</span><textarea name="question" required placeholder="Question text"></textarea></label>
            <label class="field"><span>Option A</span><input name="optionA" required /></label>
            <label class="field"><span>Option B</span><input name="optionB" required /></label>
            <label class="field"><span>Option C</span><input name="optionC" required /></label>
            <label class="field"><span>Option D</span><input name="optionD" required /></label>
            <label class="field full-width"><span>Explanation</span><textarea name="explanation" required placeholder="Why the correct option is right"></textarea></label>
            <button class="button button-primary full-width" type="submit">Add Question</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Analytics",
        title: "Cohort weak spots",
        body: analytics.weakestTopics.length
          ? `<ul class="feedback-list">${analytics.weakestTopics
              .map(
                (topic) =>
                  `<li><strong>${escapeHtml(topic.topic)} — ${topic.accuracy}%</strong> across ${topic.answered} attempt(s)</li>`
              )
              .join("")}</ul>`
          : `<p class="muted-text">No student attempts recorded yet.</p>`
      })}
    </section>
    ${createTableCard({
      title: "Question bank",
      subtitle: `${bank.count} questions`,
      headers: canDelete
        ? ["Category", "Topic", "Level", "Question", "Answer", "Action"]
        : ["Category", "Topic", "Level", "Question", "Answer"],
      rows: bank.questions.map(
        (question) => `
          <tr>
            <td>${escapeHtml(question.category)}</td>
            <td>${escapeHtml(question.topic)}</td>
            <td>${escapeHtml(question.difficulty)}</td>
            <td>${escapeHtml(question.question)}</td>
            <td>${question.correct_option}</td>
            ${
              canDelete
                ? `<td><button class="button button-danger button-small" data-delete-question="${question.id}" type="button">Delete</button></td>`
                : ""
            }
          </tr>
        `
      ),
      emptyMessage: "No questions in the bank yet."
    })}
  `;

  document.getElementById("placementAddForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await api("/placement/questions", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Question added to the bank.");
      await renderPlacementAdmin();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-delete-question]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api(`/placement/questions/${button.dataset.deleteQuestion}`, { method: "DELETE" });
        button.closest("tr")?.remove();
        showToast("Question deleted.");
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}

// ===========================================================================
// Shared helpers for community features
// ===========================================================================
function formatTime(value) {
  if (!value) return "";
  const [h, m] = String(value).split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return String(value);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m || "00"} ${period}`;
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((word) => word[0]).join("") || "?").toUpperCase();
}

async function fetchSelectableStudents() {
  if (STATE.user.role === "admin") return (await api("/students")).students;
  if (STATE.user.role === "faculty") return (await api("/students/assigned")).students;
  return [];
}

function studentOptions(students) {
  return students
    .map((s) => `<option value="${s.id}">${escapeHtml(s.full_name)} (${escapeHtml(s.roll_number)})</option>`)
    .join("");
}

// ===========================================================================
// Events
// ===========================================================================
async function renderEventsPage() {
  const pageContent = document.getElementById("pageContent");
  const canManage = STATE.user.role === "admin" || STATE.user.role === "faculty";
  const canDelete = STATE.user.role === "admin";
  const data = await api("/events");
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.events.filter((e) => e.event_date >= today);
  const past = data.events.filter((e) => e.event_date < today);

  const eventCard = (e) => `
    <article class="event-card${e.event_date < today ? " is-past" : ""}">
      <div class="event-body">
        <div class="meta-row">${statusBadge(e.category)}${e.event_time ? " " + tag(formatTime(e.event_time)) : ""}${e.venue ? " " + tag(e.venue) : ""}</div>
        <h3>${escapeHtml(e.title)}</h3>
        <p>${escapeHtml(e.description)}</p>
        <div class="muted-text">${formatDate(e.event_date)}${e.created_by_name ? " &middot; " + escapeHtml(e.created_by_name) : ""}</div>
        ${
          canManage
            ? `<div class="inline-actions">
                 <button class="button button-ghost button-small" type="button" data-event-edit="${e.id}">Edit</button>
                 ${canDelete ? `<button class="button button-danger button-small" type="button" data-event-delete="${e.id}">Delete</button>` : ""}
               </div>`
            : ""
        }
      </div>
    </article>`;

  const categoryOptions = ["academic", "cultural", "sports", "placement", "general"]
    .map((c) => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`)
    .join("");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Upcoming", value: String(upcoming.length), icon: "events" },
      { label: "Total events", value: String(data.events.length), icon: "notices" },
      { label: "This month", value: String(upcoming.filter((e) => e.event_date.slice(0, 7) === today.slice(0, 7)).length), icon: "attendance" },
      { label: "Past", value: String(past.length), icon: "dashboard" }
    ])}
    ${
      canManage
        ? panel({
            eyebrow: "Manage",
            title: "Create an event",
            body: `
              <form id="eventForm" class="form-grid">
                <input type="hidden" name="eventId" value="" />
                <label class="field full-width"><span>Title</span><input name="title" required placeholder="Event title" /></label>
                <label class="field"><span>Category</span><select name="category">${categoryOptions}</select></label>
                <label class="field"><span>Date</span><input type="date" name="eventDate" required /></label>
                <label class="field"><span>Time</span><input type="time" name="eventTime" /></label>
                <label class="field"><span>Venue</span><input name="venue" placeholder="Venue" /></label>
                <label class="field full-width"><span>Description</span><textarea name="description" required placeholder="What is this event about?"></textarea></label>
                <button class="button button-primary full-width" type="submit" id="eventSubmit">Add Event</button>
              </form>
            `
          })
        : ""
    }
    ${panel({
      eyebrow: "Calendar",
      title: "Upcoming events",
      body: upcoming.length ? `<section class="event-grid">${upcoming.map(eventCard).join("")}</section>` : emptyState("No upcoming events scheduled.")
    })}
    ${past.length ? panel({ eyebrow: "Archive", title: "Past events", body: `<section class="event-grid">${past.map(eventCard).join("")}</section>` }) : ""}
  `;

  const form = document.getElementById("eventForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const id = payload.eventId;
    delete payload.eventId;
    try {
      if (id) {
        await api(`/events/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showToast("Event updated.");
      } else {
        await api("/events", { method: "POST", body: JSON.stringify(payload) });
        showToast("Event created.");
      }
      await renderEventsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-event-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = data.events.find((e) => String(e.id) === button.dataset.eventEdit);
      if (!target || !form) return;
      form.eventId.value = target.id;
      form.title.value = target.title;
      form.category.value = target.category;
      form.eventDate.value = target.event_date;
      form.eventTime.value = target.event_time || "";
      form.venue.value = target.venue || "";
      form.description.value = target.description;
      document.getElementById("eventSubmit").textContent = "Update Event";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll("[data-event-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api(`/events/${button.dataset.eventDelete}`, { method: "DELETE" });
        showToast("Event deleted.");
        await renderEventsPage();
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}

// ===========================================================================
// Complaints
// ===========================================================================
async function renderComplaintsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const data = await api("/complaints/my");
    const open = data.complaints.filter((c) => c.status !== "resolved");
    const categories = ["academic", "infrastructure", "hostel", "faculty", "administration", "general"]
      .map((c) => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`)
      .join("");

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Raised", value: String(data.complaints.length), icon: "complaints" },
        { label: "Open", value: String(open.length), icon: "notices" },
        { label: "Resolved", value: String(data.complaints.length - open.length), icon: "results" },
        { label: "In progress", value: String(data.complaints.filter((c) => c.status === "in_progress").length), icon: "attendance" }
      ])}
      ${panel({
        eyebrow: "Raise",
        title: "Submit a complaint",
        body: `
          <form id="complaintForm" class="form-grid">
            <label class="field"><span>Category</span><select name="category">${categories}</select></label>
            <label class="field"><span>Subject</span><input name="subject" required placeholder="Brief subject" /></label>
            <label class="field full-width"><span>Description</span><textarea name="description" required placeholder="Describe the issue in detail"></textarea></label>
            <button class="button button-primary full-width" type="submit">Submit Complaint</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "History",
        title: "Your complaints",
        body: data.complaints.length
          ? `<section class="list-grid">${data.complaints
              .map(
                (c) => `
                  <article class="list-card">
                    <div class="meta-row">${statusBadge(c.status.replace("_", " "))} ${tag(c.category)}</div>
                    <h3 style="margin:10px 0 6px;">${escapeHtml(c.subject)}</h3>
                    <p>${escapeHtml(c.description)}</p>
                    ${c.response ? `<div class="explanation"><strong>Response${c.responded_by_name ? " · " + escapeHtml(c.responded_by_name) : ""}</strong>${escapeHtml(c.response)}</div>` : `<div class="muted-text">Awaiting response.</div>`}
                    <div class="muted-text" style="margin-top:8px;">Raised ${formatDate(c.created_at)}</div>
                  </article>`
              )
              .join("")}</section>`
          : emptyState("You have not raised any complaints yet.")
      })}
    `;

    document.getElementById("complaintForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      try {
        await api("/complaints", { method: "POST", body: JSON.stringify(Object.fromEntries(formData.entries())) });
        showToast("Complaint submitted.");
        await renderComplaintsPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
    return;
  }

  // Admin / faculty view
  const data = await api("/complaints");
  const open = data.complaints.filter((c) => c.status !== "resolved");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Total", value: String(data.complaints.length), icon: "complaints" },
      { label: "Open", value: String(data.complaints.filter((c) => c.status === "open").length), icon: "notices" },
      { label: "In progress", value: String(data.complaints.filter((c) => c.status === "in_progress").length), icon: "attendance" },
      { label: "Resolved", value: String(data.complaints.filter((c) => c.status === "resolved").length), icon: "results" }
    ])}
    ${panel({
      eyebrow: "Inbox",
      title: "Student complaints",
      body: data.complaints.length
        ? `<section class="list-grid">${data.complaints
            .map(
              (c) => `
                <article class="list-card">
                  <div class="split-row">
                    <div>
                      <div class="meta-row">${statusBadge(c.status.replace("_", " "))} ${tag(c.category)}</div>
                      <h3 style="margin:10px 0 4px;">${escapeHtml(c.subject)}</h3>
                      <div class="muted-text">${escapeHtml(c.student_name)} &middot; ${escapeHtml(c.roll_number)} &middot; ${formatDate(c.created_at)}</div>
                    </div>
                    ${
                      STATE.user.role === "admin"
                        ? `<button class="button button-danger button-small" type="button" data-complaint-delete="${c.id}">Delete</button>`
                        : ""
                    }
                  </div>
                  <p style="margin-top:10px;">${escapeHtml(c.description)}</p>
                  <form class="compact-form" data-complaint-id="${c.id}">
                    <div class="form-grid">
                      <label class="field"><span>Status</span>
                        <select name="status">
                          <option value="open"${c.status === "open" ? " selected" : ""}>Open</option>
                          <option value="in_progress"${c.status === "in_progress" ? " selected" : ""}>In progress</option>
                          <option value="resolved"${c.status === "resolved" ? " selected" : ""}>Resolved</option>
                        </select>
                      </label>
                      <label class="field full-width"><span>Response</span><textarea name="response" placeholder="Reply to the student">${escapeHtml(c.response || "")}</textarea></label>
                    </div>
                    <button class="button button-primary button-small" type="submit">Save Response</button>
                  </form>
                </article>`
            )
            .join("")}</section>`
        : emptyState("No complaints have been raised yet.")
    })}
  `;

  document.querySelectorAll("[data-complaint-id]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      try {
        await api(`/complaints/${event.currentTarget.dataset.complaintId}`, {
          method: "PUT",
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        showToast("Complaint updated.");
        await renderComplaintsPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll("[data-complaint-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api(`/complaints/${button.dataset.complaintDelete}`, { method: "DELETE" });
        showToast("Complaint deleted.");
        await renderComplaintsPage();
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}

// ===========================================================================
// Disciplinary / conduct records
// ===========================================================================
const CONDUCT_TYPES = ["warning", "note", "fine", "suspension"];

async function renderDisciplinaryPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const data = await api("/disciplinary/my");
    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Records", value: String(data.records.length), icon: "disciplinary" },
        { label: "Warnings", value: String(data.records.filter((r) => r.action_type === "warning").length), icon: "notices" },
        { label: "Notes", value: String(data.records.filter((r) => r.action_type === "note").length), icon: "results" },
        { label: "Serious", value: String(data.records.filter((r) => ["fine", "suspension"].includes(r.action_type)).length), icon: "dashboard" }
      ])}
      ${panel({
        eyebrow: "Conduct",
        title: "Your conduct record",
        body: data.records.length
          ? `<section class="list-grid">${data.records
              .map(
                (r) => `
                  <article class="list-card conduct-${escapeHtml(r.action_type)}">
                    <div class="meta-row">${statusBadge(r.action_type)} ${tag(formatDate(r.action_date))}</div>
                    <p style="margin:10px 0 6px;">${escapeHtml(r.reason)}</p>
                    ${r.remarks ? `<div class="muted-text">${escapeHtml(r.remarks)}</div>` : ""}
                    ${r.recorded_by_name ? `<div class="muted-text" style="margin-top:6px;">Recorded by ${escapeHtml(r.recorded_by_name)}</div>` : ""}
                  </article>`
              )
              .join("")}</section>`
          : emptyState("You have a clean record — nothing here.")
      })}
    `;
    return;
  }

  // Admin / faculty
  const canDelete = STATE.user.role === "admin";
  const [data, students] = await Promise.all([api("/disciplinary"), fetchSelectableStudents()]);
  const typeOptions = CONDUCT_TYPES.map((t) => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join("");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Records", value: String(data.records.length), icon: "disciplinary" },
      { label: "Warnings", value: String(data.records.filter((r) => r.action_type === "warning").length), icon: "notices" },
      { label: "Notes", value: String(data.records.filter((r) => r.action_type === "note").length), icon: "results" },
      { label: "Students", value: String(students.length), icon: "students" }
    ])}
    ${panel({
      eyebrow: "Record",
      title: "Add a conduct record",
      body: `
        <form id="conductForm" class="form-grid">
          <label class="field"><span>Student</span><select name="studentId" required><option value="">Select student</option>${studentOptions(students)}</select></label>
          <label class="field"><span>Type</span><select name="actionType">${typeOptions}</select></label>
          <label class="field"><span>Date</span><input type="date" name="actionDate" required /></label>
          <label class="field full-width"><span>Reason</span><textarea name="reason" required placeholder="What happened?"></textarea></label>
          <label class="field full-width"><span>Remarks (optional)</span><input name="remarks" placeholder="Additional notes" /></label>
          <button class="button button-primary full-width" type="submit">Add Record</button>
        </form>
      `
    })}
    ${createTableCard({
      title: "All conduct records",
      subtitle: "Visible to the student and teachers",
      headers: canDelete ? ["Student", "Type", "Reason", "Date", "Recorded by", ""] : ["Student", "Type", "Reason", "Date", "Recorded by"],
      rows: data.records.map(
        (r) => `
          <tr>
            <td>${escapeHtml(r.student_name)}<div class="muted-text">${escapeHtml(r.roll_number)}</div></td>
            <td>${statusBadge(r.action_type)}</td>
            <td>${escapeHtml(r.reason)}${r.remarks ? `<div class="muted-text">${escapeHtml(r.remarks)}</div>` : ""}</td>
            <td>${formatDate(r.action_date)}</td>
            <td>${escapeHtml(r.recorded_by_name || "-")}</td>
            ${canDelete ? `<td><button class="button button-danger button-small" type="button" data-conduct-delete="${r.id}">Delete</button></td>` : ""}
          </tr>`
      ),
      emptyMessage: "No conduct records yet."
    })}
  `;

  document.getElementById("conductForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await api("/disciplinary", { method: "POST", body: JSON.stringify(Object.fromEntries(formData.entries())) });
      showToast("Conduct record added.");
      await renderDisciplinaryPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-conduct-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api(`/disciplinary/${button.dataset.conductDelete}`, { method: "DELETE" });
        button.closest("tr")?.remove();
        showToast("Record removed.");
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}

// ===========================================================================
// Hall tickets
// ===========================================================================
async function renderHallTicketsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const data = await api("/hall-tickets/my");
    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Hall tickets", value: String(data.tickets.length), icon: "halltickets" },
        { label: "Upcoming", value: String(data.tickets.filter((t) => t.exam_date >= new Date().toISOString().slice(0, 10)).length), icon: "attendance" },
        { label: "Halls", value: String(new Set(data.tickets.map((t) => t.hall)).size), icon: "dashboard" },
        { label: "Subjects", value: String(new Set(data.tickets.map((t) => t.subject)).size), icon: "results" }
      ])}
      ${
        data.tickets.length
          ? `<section class="ticket-grid">${data.tickets.map(hallTicketCard).join("")}</section>`
          : panel({ title: "No hall tickets", body: emptyState("Your hall tickets will appear here once released by the administration.") })
      }
    `;
    return;
  }

  const canIssue = STATE.user.role === "admin";
  const [data, students] = await Promise.all([api("/hall-tickets"), canIssue ? fetchSelectableStudents() : Promise.resolve([])]);

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Issued", value: String(data.tickets.length), icon: "halltickets" },
      { label: "Students", value: String(new Set(data.tickets.map((t) => t.roll_number)).size), icon: "students" },
      { label: "Exams", value: String(new Set(data.tickets.map((t) => t.exam_name)).size), icon: "results" },
      { label: "Halls", value: String(new Set(data.tickets.map((t) => t.hall)).size), icon: "dashboard" }
    ])}
    ${
      canIssue
        ? panel({
            eyebrow: "Issue",
            title: "Issue a hall ticket",
            body: `
              <form id="hallTicketForm" class="form-grid">
                <label class="field"><span>Student</span><select name="studentId" required><option value="">Select student</option>${studentOptions(students)}</select></label>
                <label class="field"><span>Examination</span><input name="examName" required placeholder="e.g. End Semester Exam - Sem 5" /></label>
                <label class="field"><span>Subject</span><input name="subject" required placeholder="Subject and code" /></label>
                <label class="field"><span>Date</span><input type="date" name="examDate" required /></label>
                <label class="field"><span>Time</span><input type="time" name="examTime" required /></label>
                <label class="field"><span>Hall</span><input name="hall" required placeholder="Block A - Hall 1" /></label>
                <label class="field"><span>Seat No.</span><input name="seatNo" required placeholder="A-014" /></label>
                <button class="button button-primary full-width" type="submit">Issue Hall Ticket</button>
              </form>
            `
          })
        : ""
    }
    ${createTableCard({
      title: "Issued hall tickets",
      headers: canIssue ? ["Student", "Exam", "Subject", "Date", "Hall", "Seat", ""] : ["Student", "Exam", "Subject", "Date", "Hall", "Seat"],
      rows: data.tickets.map(
        (t) => `
          <tr>
            <td>${escapeHtml(t.student_name)}<div class="muted-text">${escapeHtml(t.roll_number)}</div></td>
            <td>${escapeHtml(t.exam_name)}</td>
            <td>${escapeHtml(t.subject)}</td>
            <td>${formatDate(t.exam_date)} ${escapeHtml(formatTime(t.exam_time))}</td>
            <td>${escapeHtml(t.hall)}</td>
            <td>${escapeHtml(t.seat_no)}</td>
            ${canIssue ? `<td><button class="button button-danger button-small" type="button" data-ticket-delete="${t.id}">Delete</button></td>` : ""}
          </tr>`
      ),
      emptyMessage: "No hall tickets issued yet."
    })}
  `;

  document.getElementById("hallTicketForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await api("/hall-tickets", { method: "POST", body: JSON.stringify(Object.fromEntries(formData.entries())) });
      showToast("Hall ticket issued.");
      await renderHallTicketsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-ticket-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api(`/hall-tickets/${button.dataset.ticketDelete}`, { method: "DELETE" });
        button.closest("tr")?.remove();
        showToast("Hall ticket deleted.");
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}

function hallTicketCard(t) {
  return `
    <article class="ticket-card">
      <div class="ticket-head">
        <div>
          <span class="ticket-college">DIET Engineering College</span>
          <h3>Hall Ticket</h3>
        </div>
        <div class="ticket-seal">${escapeHtml(initials(t.student_name))}</div>
      </div>
      <div class="ticket-grid-info">
        <div><span>Student</span><strong>${escapeHtml(t.student_name)}</strong></div>
        <div><span>Roll No.</span><strong>${escapeHtml(t.roll_number)}</strong></div>
        <div><span>Registration</span><strong>${escapeHtml(t.registration_number || "-")}</strong></div>
        <div><span>Branch</span><strong>${escapeHtml(t.branch_name || t.department_name || "-")}</strong></div>
        <div><span>Examination</span><strong>${escapeHtml(t.exam_name)}</strong></div>
        <div><span>Subject</span><strong>${escapeHtml(t.subject)}</strong></div>
        <div><span>Date &amp; Time</span><strong>${formatDate(t.exam_date)} &middot; ${escapeHtml(formatTime(t.exam_time))}</strong></div>
        <div><span>Hall</span><strong>${escapeHtml(t.hall)}</strong></div>
        <div><span>Seat No.</span><strong>${escapeHtml(t.seat_no)}</strong></div>
      </div>
      <div class="ticket-foot">
        <span class="muted-text">Bring a valid photo ID to the examination hall.</span>
        <button class="button button-secondary button-small" type="button" onclick="window.print()">Print</button>
      </div>
    </article>`;
}

// ===========================================================================
// About the College
// ===========================================================================
async function renderAboutPage() {
  const pageContent = document.getElementById("pageContent");
  const { profile, stats } = await api("/college/info");

  pageContent.innerHTML = `
    ${panel({
      eyebrow: "About",
      title: profile.name,
      body: `
        <p class="about-tagline">${escapeHtml(profile.tagline)}</p>
        <div class="about-meta">
          <div><span>Established</span><strong>${escapeHtml(profile.established)}</strong></div>
          <div><span>Accreditation</span><strong>${escapeHtml(profile.accreditation)}</strong></div>
          <div><span>Affiliation</span><strong>${escapeHtml(profile.affiliation)}</strong></div>
        </div>
      `
    })}
    ${createStatsGrid([
      { label: "Departments", value: String(stats.departments), icon: "faculty" },
      { label: "Branches", value: String(stats.branches), icon: "timetable" },
      { label: "Students", value: String(stats.students), icon: "students" },
      { label: "Upcoming events", value: String(stats.upcomingEvents), icon: "events" }
    ])}
    <section class="section-grid two-column">
      ${panel({ eyebrow: "Purpose", title: "Vision", body: `<p>${escapeHtml(profile.vision)}</p>` })}
      ${panel({
        eyebrow: "Purpose",
        title: "Mission",
        body: `<ul class="reco-list">${profile.mission.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`
      })}
    </section>
    ${panel({
      eyebrow: "Campus",
      title: "Highlights",
      body: `<ul class="feedback-list">${profile.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>`
    })}
    ${panel({
      eyebrow: "Reach us",
      title: "Contact",
      body: `
        <div class="about-meta">
          <div><span>Address</span><strong>${escapeHtml(profile.address)}</strong></div>
          <div><span>Email</span><strong>${escapeHtml(profile.email)}</strong></div>
          <div><span>Phone</span><strong>${escapeHtml(profile.phone)}</strong></div>
          <div><span>Website</span><strong>${escapeHtml(profile.website)}</strong></div>
        </div>
      `
    })}
  `;
}

// ===========================================================================
// Profile / digital ID card
// ===========================================================================
async function renderProfilePage() {
  const pageContent = document.getElementById("pageContent");
  const user = STATE.user;
  const role = user.role;
  const sp = user.studentProfile;
  const fp = user.facultyProfile;

  const idRows =
    role === "student" && sp
      ? [
          ["Roll Number", sp.rollNumber],
          ["Registration", sp.registrationNumber],
          ["Department", user.departmentName],
          ["Branch", sp.branchName],
          ["Semester", sp.semester ? "Semester " + sp.semester : null],
          ["Section", sp.section]
        ]
      : role === "faculty" && fp
        ? [
            ["Employee Code", fp.employeeCode],
            ["Designation", fp.designation],
            ["Department", user.departmentName],
            ["Branch", fp.branchName]
          ]
        : [
            ["Role", "Administrator"],
            ["Email", user.email]
          ];

  const cardLabel = role === "student" ? "Student Identity Card" : role === "faculty" ? "Faculty Identity Card" : "Staff Identity Card";

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Identity",
        title: "Digital ID card",
        body: `
          <div class="id-card" id="idCard">
            <div class="id-card-top">
              <div>
                <span class="id-college">DIET Engineering College</span>
                <span class="id-type">${escapeHtml(cardLabel)}</span>
              </div>
              <span class="id-role-badge">${escapeHtml(getRoleLabel(role))}</span>
            </div>
            <div class="id-card-body">
              <div class="id-avatar">${escapeHtml(initials(user.fullName))}</div>
              <div class="id-details">
                <h3>${escapeHtml(user.fullName)}</h3>
                <p class="muted-text">${escapeHtml(user.email)}</p>
                <div class="id-fields">
                  ${idRows
                    .filter(([, value]) => value)
                    .map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`)
                    .join("")}
                </div>
              </div>
            </div>
            <div class="id-card-foot">
              <span>Valid for Academic Year 2025-26</span>
              <span>dietcollege.edu</span>
            </div>
          </div>
          <button class="button button-secondary full-width" type="button" style="margin-top:16px;" onclick="window.print()">Print ID Card</button>
        `
      })}
      ${panel({
        eyebrow: "Account",
        title: "Profile details",
        body: `
          <div class="about-meta">
            <div><span>Full name</span><strong>${escapeHtml(user.fullName)}</strong></div>
            <div><span>Email</span><strong>${escapeHtml(user.email)}</strong></div>
            <div><span>Role</span><strong>${escapeHtml(getRoleLabel(role))}</strong></div>
            ${idRows.filter(([, v]) => v).map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("")}
          </div>
        `
      })}
    </section>
  `;
}

// ===========================================================================
// KPI count-up — stat values ease from 0 to their target on first render.
// Tabular figures (set in CSS) keep the width stable, so nothing jitters.
// ===========================================================================
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animated = new WeakSet();
  const NUMERIC = /^(\d{1,3}(?:,\d{3})*|\d{1,6})(%?)$/;

  function countUp(el) {
    if (animated.has(el)) return;
    animated.add(el);

    const raw = el.textContent.trim();
    const match = NUMERIC.exec(raw);
    if (!match || reduced.matches) return;

    const target = Number(match[1].replace(/,/g, ""));
    const suffix = match[2] || "";
    if (!Number.isFinite(target) || target === 0) return;

    const hasGrouping = match[1].includes(",");
    const format = (value) => (hasGrouping ? value.toLocaleString("en-IN") : String(value)) + suffix;
    const duration = 620;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("pageContent");
    if (!content) return;

    const scan = () => content.querySelectorAll(".stat-card strong").forEach(countUp);
    scan();
    new MutationObserver(scan).observe(content, { childList: true, subtree: true });
  });
})();
