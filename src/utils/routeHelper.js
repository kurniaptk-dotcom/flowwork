/**
 * Route Helper for KeepWork Single Page Application (HTML5 History API)
 * Enables clean path routing (/dashboards, /spaces, /habits, /second-brain, etc.)
 * without '#' hash, fully supporting browser Back/Forward navigation and page reload.
 */

export const ROUTE_TO_MODULE = {
  '/': 'dashboards',
  '/dashboards': 'dashboards',
  '/dashboard': 'dashboards',
  '/spaces': 'spaces',
  '/kanban': 'spaces',
  '/inbox': 'home',
  '/home': 'home',
  '/planner': 'planner',
  '/calendar': 'planner',
  '/ai': 'brain',
  '/brain': 'brain',
  '/teams': 'teams',
  '/habits': 'habits',
  '/habit-tracker': 'habits',
  '/second-brain': 'second-brain',
  '/notes': 'second-brain'
};

export const MODULE_TO_ROUTE = {
  dashboards: '/dashboards',
  spaces: '/spaces',
  home: '/inbox',
  planner: '/planner',
  brain: '/ai',
  teams: '/teams',
  habits: '/habits',
  'second-brain': '/second-brain'
};

export const MODULE_TITLES = {
  dashboards: 'KeepWork — Dashboard & Analitik',
  spaces: 'KeepWork — Ruang Kerja & Kanban',
  home: 'KeepWork — Kotak Masuk (Inbox)',
  planner: 'KeepWork — Kalender & Planner',
  brain: 'KeepWork AI — Asisten Cerdas',
  teams: 'KeepWork — Tim & Anggota',
  habits: 'KeepWork — Habit Tracker',
  'second-brain': 'KeepWork — Second Brain'
};

/**
 * Determine initial active module from window.location.pathname or localStorage
 */
export function getInitialModule() {
  if (typeof window === 'undefined') return 'dashboards';
  
  const rawPath = window.location.pathname.toLowerCase();
  const path = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;

  if (ROUTE_TO_MODULE[path]) {
    return ROUTE_TO_MODULE[path];
  }

  // If visiting root '/' or unknown path, try saved preference
  try {
    const saved = localStorage.getItem('keepwork_last_module');
    if (saved && MODULE_TO_ROUTE[saved]) {
      return saved;
    }
  } catch (e) {}

  return 'dashboards';
}

/**
 * Update URL path (HTML5 pushState / replaceState) and document title
 */
export function updateUrlForModule(module, replace = false) {
  if (typeof window === 'undefined') return;

  const targetPath = MODULE_TO_ROUTE[module] || `/${module}`;
  const rawPath = window.location.pathname.toLowerCase();
  const currentPath = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;

  if (currentPath !== targetPath) {
    if (replace) {
      window.history.replaceState({ module }, '', targetPath);
    } else {
      window.history.pushState({ module }, '', targetPath);
    }
  }

  // Update tab title
  const title = MODULE_TITLES[module] || 'KeepWork — OS Produktivitas';
  document.title = title;

  try {
    localStorage.setItem('keepwork_last_module', module);
  } catch (e) {}
}
